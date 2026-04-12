import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Languages } from 'lucide-react';
import { formatDateSafe } from '@/lib/date';

const TARGETS = [
  { value: 'en', label: 'EN' },
  { value: 'cz', label: 'CZ' },
] as const;

export type TranslationTarget = (typeof TARGETS)[number]['value'];

export interface TranslationStatus {
  en: boolean;
  cz: boolean;
}

export interface TranslationMeta {
  exists: boolean;
  date?: string | null;
  status?: 'draft' | 'published';
}

interface LocaleTranslationBoxProps {
  description: string;
  status: TranslationStatus;
  meta?: Partial<Record<TranslationTarget, TranslationMeta>>;
  onTranslate: (target: TranslationTarget) => Promise<void> | void;
  isTranslating?: boolean;
  disabled?: boolean;
}

export function LocaleTranslationBox({
  description,
  status,
  meta,
  onTranslate,
  isTranslating = false,
  disabled = false,
}: LocaleTranslationBoxProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="space-y-3 pt-4">
        <p className="text-sm font-medium">Übersetzungen</p>
        <p className="text-sm text-muted-foreground">{description}</p>

        <div className="flex flex-wrap gap-2">
          {TARGETS.map((target) => (
            <Button
              key={target.value}
              type="button"
              variant="outline"
              onClick={() => onTranslate(target.value)}
              disabled={disabled || isTranslating}
            >
              {isTranslating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Languages className="mr-2 h-4 w-4" />
              )}
              {'DE -> '}
              {target.label}
            </Button>
          ))}
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          {TARGETS.map((target) => {
            const targetMeta = meta?.[target.value];
            const exists = targetMeta?.exists ?? status[target.value];
            const formattedDate = targetMeta?.date
              ? formatDateSafe(targetMeta.date, 'dd.MM.yyyy', undefined, '')
              : '';
            const statusLabel =
              targetMeta?.status === 'published'
                ? 'veröffentlicht'
                : targetMeta?.status === 'draft'
                  ? 'Entwurf'
                  : 'vorhanden';

            return (
              <div key={target.value}>
                {target.label}: {exists ? statusLabel : 'fehlt'}
                {formattedDate ? ` • ${formattedDate}` : ''}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
