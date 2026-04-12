import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listAllRecords, pb } from '@/integrations/pocketbase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import { RecordModel } from 'pocketbase';

export interface PageContent {
  id: string;
  page_key: string;
  section_key: string;
  locale: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  primary_button_label: string | null;
  primary_button_url: string | null;
  secondary_button_label: string | null;
  secondary_button_url: string | null;
  stat_one_label: string | null;
  stat_two_label: string | null;
  stat_three_label: string | null;
  image_url: string | null;
  image_alt: string | null;
  resolved_locale: string;
  is_fallback: boolean;
  updated_at: string;
}

export const PAGE_SECTIONS = {
  home: ['hero', 'club_teaser', 'upcoming_events', 'news', 'sponsors'],
  about: ['intro', 'mission', 'values'],
  board: ['intro'],
  history: ['intro'],
  membership: ['intro', 'benefits', 'how_to_join', 'cta'],
  motocross: ['intro', 'training', 'fees', 'safety', 'directions', 'events'],
  trial: ['intro', 'training', 'events'],
  touring: ['intro', 'training', 'events'],
  calendar: ['intro'],
  news: ['intro'],
  event: ['intro', 'track_map', 'location_map', 'registration_info', 'gallery', 'archive'],
  contact: ['intro'],
  sponsors: ['intro', 'cta'],
  partner_clubs: ['intro'],
  imprint: ['content'],
  privacy: ['content'],
} as const;

export type PageKey = keyof typeof PAGE_SECTIONS;

function mapPageContent(item: RecordModel): PageContent {
  return {
    id: item.id,
    page_key: item.pageKey,
    section_key: item.sectionKey,
    locale: item.locale,
    title: item.title || null,
    subtitle: item.subtitle || null,
    content: item.content || null,
    primary_button_label: item.primaryButtonLabel || null,
    primary_button_url: item.primaryButtonUrl || null,
    secondary_button_label: item.secondaryButtonLabel || null,
    secondary_button_url: item.secondaryButtonUrl || null,
    stat_one_label: item.statOneLabel || null,
    stat_two_label: item.statTwoLabel || null,
    stat_three_label: item.statThreeLabel || null,
    image_url: item.image ? pb.files.getURL(item, item.image) : null,
    image_alt: item.imageAlt || null,
    resolved_locale: item.locale,
    is_fallback: false,
    updated_at: item.updated,
  };
}

function resolveLocalizedRecord(items: RecordModel[], locale: string): PageContent | null {
  const exact = items.find((item) => item.locale === locale);
  const german = items.find((item) => item.locale === 'de');
  const primary = exact || german;

  if (!primary) return null;

  const primaryContent = mapPageContent(primary);
  const germanContent = german ? mapPageContent(german) : null;

  return {
    ...primaryContent,
    title: primaryContent.title || germanContent?.title || null,
    subtitle: primaryContent.subtitle || germanContent?.subtitle || null,
    content: primaryContent.content || germanContent?.content || null,
    primary_button_label:
      primaryContent.primary_button_label || germanContent?.primary_button_label || null,
    primary_button_url: primaryContent.primary_button_url || germanContent?.primary_button_url || null,
    secondary_button_label:
      primaryContent.secondary_button_label || germanContent?.secondary_button_label || null,
    secondary_button_url:
      primaryContent.secondary_button_url || germanContent?.secondary_button_url || null,
    stat_one_label: primaryContent.stat_one_label || germanContent?.stat_one_label || null,
    stat_two_label: primaryContent.stat_two_label || germanContent?.stat_two_label || null,
    stat_three_label: primaryContent.stat_three_label || germanContent?.stat_three_label || null,
    image_url: primaryContent.image_url || germanContent?.image_url || null,
    image_alt: primaryContent.image_alt || germanContent?.image_alt || null,
    resolved_locale: exact ? locale : 'de',
    is_fallback: !exact && locale !== 'de',
  };
}

export function useSectionContent(pageKey: PageKey, sectionKey: string) {
  const { locale } = useLanguage();

  return useQuery({
    queryKey: ['page_content', pageKey, sectionKey, locale],
    queryFn: async () => {
      const data = await listAllRecords('pageContents');
      const matching = data.filter(
        (item) => item.pageKey === pageKey && item.sectionKey === sectionKey,
      );
      const resolved = resolveLocalizedRecord(matching, locale);

      if (!resolved) return null;
      return resolved;
    },
  });
}

export function useContentWithFallback(
  pageKey: PageKey,
  sectionKey: string,
  fallback: { title?: string; subtitle?: string; content?: string } = {},
) {
  const { data, isLoading } = useSectionContent(pageKey, sectionKey);

  return {
    title: data?.title || fallback.title || '',
    subtitle: data?.subtitle || fallback.subtitle || '',
    content: data?.content || fallback.content || '',
    primary_button_label: data?.primary_button_label || '',
    primary_button_url: data?.primary_button_url || '',
    secondary_button_label: data?.secondary_button_label || '',
    secondary_button_url: data?.secondary_button_url || '',
    stat_one_label: data?.stat_one_label || '',
    stat_two_label: data?.stat_two_label || '',
    stat_three_label: data?.stat_three_label || '',
    image_url: data?.image_url || null,
    image_alt: data?.image_alt || '',
    isLoading,
    hasDbContent: !!data,
    isFallback: data?.is_fallback || false,
    resolvedLocale: data?.resolved_locale || null,
  };
}

export function usePageContent(pageKey: PageKey, sectionKey?: string) {
  const { locale } = useLanguage();

  return useQuery({
    queryKey: ['page_content', pageKey, sectionKey, locale],
    queryFn: async () => {
      const data = await listAllRecords('pageContents');
      const relevant = data.filter((item) => item.pageKey === pageKey && (!sectionKey || item.sectionKey === sectionKey));
      const grouped = new Map<string, RecordModel[]>();

      relevant.forEach((item) => {
        const key = `${item.pageKey}:${item.sectionKey}`;
        grouped.set(key, [...(grouped.get(key) || []), item]);
      });

      return Array.from(grouped.values())
        .map((items) => {
          const resolved = resolveLocalizedRecord(items, locale);
          return resolved;
        })
        .filter((item): item is PageContent => Boolean(item))
        .sort((a, b) => a.section_key.localeCompare(b.section_key));
    },
  });
}

export function useAllPageContent(pageKey: PageKey) {
  return useQuery({
    queryKey: ['page_content', pageKey, 'all'],
    queryFn: async () => {
      const data = await listAllRecords('pageContents');

      return (data
        .filter((item) => item.pageKey === pageKey)
        .map(mapPageContent) as PageContent[]).sort(
        (a, b) => a.section_key.localeCompare(b.section_key) || a.locale.localeCompare(b.locale),
      );
    },
  });
}

export function useUpdatePageContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: Omit<PageContent, 'id' | 'updated_at' | 'resolved_locale' | 'is_fallback'> & { id?: string; image_file?: File | null }) => {
      const payload: Record<string, unknown> = {
        pageKey: content.page_key,
        sectionKey: content.section_key,
        locale: content.locale,
        title: content.title || '',
        subtitle: content.subtitle || '',
        content: content.content || '',
        primaryButtonLabel: content.primary_button_label || '',
        primaryButtonUrl: content.primary_button_url || '',
        secondaryButtonLabel: content.secondary_button_label || '',
        secondaryButtonUrl: content.secondary_button_url || '',
        statOneLabel: content.stat_one_label || '',
        statTwoLabel: content.stat_two_label || '',
        statThreeLabel: content.stat_three_label || '',
        imageAlt: content.image_alt || '',
      };

      if (content.image_file) payload.image = content.image_file;

      const data = content.id
        ? await pb.collection('pageContents').update(content.id, payload)
        : await pb.collection('pageContents').create(payload);

      return mapPageContent(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page_content'] });
    },
  });
}

export function useUpsertPageContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: {
      page_key: string;
      section_key: string;
      locale: string;
      title?: string | null;
      subtitle?: string | null;
      content?: string | null;
      primary_button_label?: string | null;
      primary_button_url?: string | null;
      secondary_button_label?: string | null;
      secondary_button_url?: string | null;
      stat_one_label?: string | null;
      stat_two_label?: string | null;
      stat_three_label?: string | null;
      image_alt?: string | null;
      image_file?: File | null;
    }) => {
      const all = await listAllRecords('pageContents');
      const existing = all.find(
        (item) =>
          item.pageKey === content.page_key &&
          item.sectionKey === content.section_key &&
          item.locale === content.locale,
      );

      if (existing) {
        const payload: Record<string, unknown> = {
          title: content.title || '',
          subtitle: content.subtitle || '',
          content: content.content || '',
          primaryButtonLabel: content.primary_button_label || '',
          primaryButtonUrl: content.primary_button_url || '',
          secondaryButtonLabel: content.secondary_button_label || '',
          secondaryButtonUrl: content.secondary_button_url || '',
          statOneLabel: content.stat_one_label || '',
          statTwoLabel: content.stat_two_label || '',
          statThreeLabel: content.stat_three_label || '',
          imageAlt: content.image_alt || '',
        };

        if (content.image_file) payload.image = content.image_file;

        const updated = await pb.collection('pageContents').update(existing.id, payload);

        return mapPageContent(updated);
      }

      const payload: Record<string, unknown> = {
        pageKey: content.page_key,
        sectionKey: content.section_key,
        locale: content.locale,
        title: content.title || '',
        subtitle: content.subtitle || '',
        content: content.content || '',
        primaryButtonLabel: content.primary_button_label || '',
        primaryButtonUrl: content.primary_button_url || '',
        secondaryButtonLabel: content.secondary_button_label || '',
        secondaryButtonUrl: content.secondary_button_url || '',
        statOneLabel: content.stat_one_label || '',
        statTwoLabel: content.stat_two_label || '',
        statThreeLabel: content.stat_three_label || '',
        imageAlt: content.image_alt || '',
      };

      if (content.image_file) payload.image = content.image_file;

      const created = await pb.collection('pageContents').create(payload);

      return mapPageContent(created);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page_content'] });
    },
  });
}
