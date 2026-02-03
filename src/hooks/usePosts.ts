import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Post } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';

export function usePosts(filterByLocale = true) {
  const { locale } = useLanguage();
  
  return useQuery({
    queryKey: ['posts', filterByLocale ? locale : 'all'],
    queryFn: async () => {
      let query = supabase
        .from('posts')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });
      
      if (filterByLocale) {
        query = query.eq('locale', locale);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Post[];
    },
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Post;
    },
    enabled: !!id,
  });
}

export function usePostBySlug(slug: string) {
  const { locale } = useLanguage();
  
  return useQuery({
    queryKey: ['posts', 'slug', slug, locale],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .eq('locale', locale)
        .single();
      
      if (error) throw error;
      return data as Post;
    },
    enabled: !!slug,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (post: Omit<Post, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select()
        .single();
      
      if (error) throw error;
      return data as Post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Post> & { id: string }) => {
      const { data, error } = await supabase
        .from('posts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Post;
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
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
