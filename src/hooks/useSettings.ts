import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SiteSettings {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

// Default settings structure
export interface SettingsData {
  site_name: string;
  site_short_name: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  facebook_url: string;
  instagram_url: string;
  meta_title: string;
  meta_description: string;
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
  meta_title: '',
  meta_description: '',
  meta_keywords: '',
  notifications_contact: true,
  notifications_registration: true,
  notifications_weekly: false,
};

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');
      
      if (error) {
        // If table doesn't exist, return defaults
        if (error.code === '42P01') {
          return DEFAULT_SETTINGS;
        }
        throw error;
      }
      
      // Convert array of key-value pairs to object
      const settings = { ...DEFAULT_SETTINGS } as Record<string, string | boolean>;
      (data as SiteSettings[]).forEach((item) => {
        if (item.key in DEFAULT_SETTINGS) {
          if (item.value === 'true') settings[item.key] = true;
          else if (item.value === 'false') settings[item.key] = false;
          else settings[item.key] = item.value;
        }
      });
      
      return settings as unknown as SettingsData;
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: Partial<SettingsData>) => {
      const entries = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value),
        updated_at: new Date().toISOString(),
      }));
      
      // Upsert all settings
      for (const entry of entries) {
        const { error } = await supabase
          .from('site_settings')
          .upsert(
            { ...entry, id: entry.key },
            { onConflict: 'key' }
          );
        
        if (error) throw error;
      }
      
      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
