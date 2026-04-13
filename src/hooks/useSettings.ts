import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pb, SiteSettings } from '@/integrations/pocketbase/client';
import { ClientResponseError } from 'pocketbase';

export interface SettingsData extends SiteSettings {
  meta_keywords: string;
  notifications_contact: boolean;
  notifications_registration: boolean;
  notifications_weekly: boolean;
}

const DEFAULT_SETTINGS: SettingsData = {
  site_name: 'MSC Oberlausitzer Dreiländereck e.V.',
  site_short_name: 'MSC Dreiländereck',
  description: '',
  contact_email: 'info@msc-dreilaendereck.de',
  contact_phone: '',
  address: '',
  facebook_url: '',
  instagram_url: '',
  contact_map_embed_url: '',
  contact_map_link: '',
  contact_map_label: '',
  sponsoring_email: '',
  meta_title: '',
  meta_description: '',
  logo_url: null,
  logo_alt: '',
  default_og_image_url: null,
  founding_year: 1984,
  member_count: '150+',
  section_count: '3',
  member_count_label: 'Mitglieder',
  tradition_years_label: 'Jahre Tradition',
  section_count_label: 'Sektionen',
  meta_keywords: '',
  notifications_contact: true,
  notifications_registration: true,
  notifications_weekly: false,
};

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      try {
        const data = await pb.collection('siteSettings').getList(1, 1);
        const item = data.items[0];

        if (!item) {
          return DEFAULT_SETTINGS;
        }

        return {
          id: item.id,
          site_name: item.siteName || '',
          site_short_name: item.siteShortName || '',
          description: item.description || '',
          contact_email: item.contactEmail || '',
          contact_phone: item.contactPhone || '',
          address: item.address || '',
          facebook_url: item.facebookUrl || '',
          instagram_url: item.instagramUrl || '',
          contact_map_embed_url: item.contactMapEmbedUrl || '',
          contact_map_link: item.contactMapLink || '',
          contact_map_label: item.contactMapLabel || '',
          sponsoring_email: item.sponsoringEmail || '',
          meta_title: item.metaTitle || '',
          meta_description: item.metaDescription || '',
          logo_url: item.logo ? pb.files.getURL(item, item.logo) : null,
          logo_alt: item.logoAlt || '',
          default_og_image_url: item.defaultOgImage ? pb.files.getURL(item, item.defaultOgImage) : null,
          founding_year: typeof item.foundingYear === 'number' ? item.foundingYear : item.foundingYear ? Number(item.foundingYear) : 1984,
          member_count: item.memberCount || '150+',
          section_count: item.sectionCount || '3',
          member_count_label: item.memberCountLabel || 'Mitglieder',
          tradition_years_label: item.traditionYearsLabel || 'Jahre Tradition',
          section_count_label: item.sectionCountLabel || 'Zuschauer',
          meta_keywords: '',
          notifications_contact: true,
          notifications_registration: true,
          notifications_weekly: false,
        } as SettingsData;
      } catch {
        return DEFAULT_SETTINGS;
      }
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<SettingsData> & { logo_file?: File | null; default_og_image_file?: File | null }) => {
      const data = await pb.collection('siteSettings').getList(1, 1);
      const existing = data.items[0];
      const payload: Record<string, unknown> = {
        siteName: settings.site_name || '',
        siteShortName: settings.site_short_name || '',
        description: settings.description || '',
        contactEmail: settings.contact_email || '',
        contactPhone: settings.contact_phone || '',
        address: settings.address || '',
        facebookUrl: settings.facebook_url || '',
        instagramUrl: settings.instagram_url || '',
        contactMapEmbedUrl: settings.contact_map_embed_url || '',
        contactMapLink: settings.contact_map_link || '',
        contactMapLabel: settings.contact_map_label || '',
        sponsoringEmail: settings.sponsoring_email || '',
        metaTitle: settings.meta_title || '',
        metaDescription: settings.meta_description || '',
        logoAlt: settings.logo_alt || '',
        foundingYear: settings.founding_year || null,
        memberCount: settings.member_count || '',
        sectionCount: settings.section_count || '',
        memberCountLabel: settings.member_count_label || '',
        traditionYearsLabel: settings.tradition_years_label || '',
        sectionCountLabel: settings.section_count_label || '',
      };

      if (settings.logo_file) payload.logo = settings.logo_file;
      if (settings.default_og_image_file) payload.defaultOgImage = settings.default_og_image_file;

      if (existing) {
        try {
          await pb.collection('siteSettings').update(existing.id, payload);
        } catch (error) {
          if (error instanceof ClientResponseError && error.status === 404) {
            await pb.collection('siteSettings').create(payload);
          } else {
            throw error;
          }
        }
      } else {
        await pb.collection('siteSettings').create(payload);
      }

      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
