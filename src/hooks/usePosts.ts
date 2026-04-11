import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pb, Post, buildSlug, listAllRecords, mapPostRecord } from '@/integrations/pocketbase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import { getSafeTimestamp } from '@/lib/date';

export function usePosts(filterByLocale = true) {
  const { locale } = useLanguage();

  return useQuery({
    queryKey: ['posts', filterByLocale ? locale : 'all'],
    queryFn: async () => {
      const data = await listAllRecords('posts');
      const posts = data.map(mapPostRecord) as Post[];

      return posts
        .filter((post) => !filterByLocale || post.locale === locale)
        .sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;

          const updatedDiff = getSafeTimestamp(b.updated_at) - getSafeTimestamp(a.updated_at);
          if (updatedDiff !== 0) return updatedDiff;

          return getSafeTimestamp(b.created_at) - getSafeTimestamp(a.created_at);
        });
    },
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: async () => {
      const data = await pb.collection('posts').getOne(id);
      return mapPostRecord(data) as Post;
    },
    enabled: !!id,
  });
}

export function usePostBySlug(slug: string) {
  const { locale } = useLanguage();

  return useQuery({
    queryKey: ['posts', 'slug', slug, locale],
    queryFn: async () => {
      const data = await listAllRecords('posts');
      const record = data.find((item: any) => item.slug === slug && item.locale === locale);

      if (!record) {
        throw new Error(`Post not found for slug "${slug}" and locale "${locale}"`);
      }

      return mapPostRecord(record) as Post;
    },
    enabled: !!slug,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: Omit<Post, 'id' | 'created_at' | 'updated_at'> & { imageFile?: File | null }) => {
      const payload: Record<string, unknown> = {
        title: post.title,
        slug: buildSlug(post.slug || post.title),
        excerpt: post.excerpt || '',
        content: post.content || '',
        category: post.category || '',
        locale: post.locale,
        isPinned: post.is_pinned,
        published: post.status === 'published',
      };

      if (post.imageFile) {
        payload.image = post.imageFile;
      }

      const data = await pb.collection('posts').create(payload);
      return mapPostRecord(data) as Post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, imageFile, ...updates }: Partial<Post> & { id: string; imageFile?: File | null }) => {
      const payload: Record<string, unknown> = {};

      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.slug !== undefined) payload.slug = buildSlug(updates.slug || updates.title || '');
      if (updates.excerpt !== undefined) payload.excerpt = updates.excerpt || '';
      if (updates.content !== undefined) payload.content = updates.content || '';
      if (updates.category !== undefined) payload.category = updates.category || '';
      if (updates.locale !== undefined) payload.locale = updates.locale;
      if (updates.is_pinned !== undefined) payload.isPinned = updates.is_pinned;
      if (updates.status !== undefined) payload.published = updates.status === 'published';
      if (imageFile) payload.image = imageFile;

      const data = await pb.collection('posts').update(id, payload);
      return mapPostRecord(data) as Post;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['posts', data.id] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await pb.collection('posts').delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
