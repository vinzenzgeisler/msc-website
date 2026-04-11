import { useMutation } from '@tanstack/react-query';
import { pb } from '@/integrations/pocketbase/client';
import { ClientResponseError } from 'pocketbase';

type Locale = 'de' | 'en' | 'cz';

interface TranslatePayload {
  sourceLocale?: Locale;
  targetLocale: Locale;
  context?: string;
  fields: Record<string, string | null | undefined>;
}

interface TranslateResponse {
  translated: boolean;
  fields: Record<string, string>;
}

export function useCmsTranslation() {
  return useMutation({
    mutationFn: async (payload: TranslatePayload) => {
      const textFields = payload.fields || {};

      try {
        const response = await pb.send<TranslateResponse>('/api/cms/translate', {
          method: 'POST',
          body: {
            sourceLocale: payload.sourceLocale || 'de',
            targetLocale: payload.targetLocale,
            context: payload.context || '',
            title: textFields.title || '',
            subtitle: textFields.subtitle || '',
          content: textFields.content || '',
          excerpt: textFields.excerpt || '',
          description: textFields.description || '',
          primaryButtonLabel: textFields.primaryButtonLabel || '',
          secondaryButtonLabel: textFields.secondaryButtonLabel || '',
          statOneLabel: textFields.statOneLabel || '',
          statTwoLabel: textFields.statTwoLabel || '',
          statThreeLabel: textFields.statThreeLabel || '',
        },
      });

        return response.fields || {};
      } catch (error) {
        if (error instanceof ClientResponseError) {
          const message = error.response?.message || error.message || 'Uebersetzung fehlgeschlagen';
          throw new Error(message);
        }

        throw error;
      }
    },
  });
}
