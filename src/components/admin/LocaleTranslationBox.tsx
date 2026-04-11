import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Languages } from 'lucide-react';

const TARGETS = [
  { value: 'en', label: 'EN' },
  { value: 'cz', label: 'CZ' },
] as const;

export type TranslationTarget = (typeof TARGETS)[number]['value'];

export interface TranslationStatus {
  en: boolean;
  cz: boolean;
}

interface LocaleTranslationBoxProps {
  description: string;
  status: TranslationStatus;
  onTranslate: (target: TranslationTarget) => Promise<void> | void;
  isTranslating?: boolean;
  disabled?: boolean;
}

export function LocaleTranslationBox({
  description,
  status,
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

        <div className="text-xs text-muted-foreground">
          EN: {status.en ? 'vorhanden' : 'fehlt'} | CZ: {status.cz ? 'vorhanden' : 'fehlt'}
        </div>
      </CardContent>
    </Card>
  );
}
