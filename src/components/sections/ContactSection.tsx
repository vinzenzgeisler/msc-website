import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Phone, ExternalLink } from 'lucide-react';
import { RichContent } from '@/components/content/RichContent';

interface ContactSectionProps {
  title: string;
  content?: string;
  subtitle?: string;
  primaryLabel?: string;
  primaryUrl?: string;
  secondaryLabel?: string;
  secondaryUrl?: string;
}

export function ContactSection({
  title,
  content,
  subtitle,
  primaryLabel,
  primaryUrl,
  secondaryLabel,
  secondaryUrl,
}: ContactSectionProps) {
  return (
    <section className="border-t border-border bg-muted/50 py-16">
      <div className="container">
        <h2 className="mb-8 text-2xl font-bold flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
          {title}
        </h2>
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="flex-1">
                {content && <RichContent content={content} className="text-foreground" />}
                {subtitle && (
                  <p className="mt-3 flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {subtitle}
                  </p>
                )}
              </div>
              {(primaryUrl || secondaryUrl) && (
                <div className="flex flex-col gap-3">
                  {primaryUrl && (
                    <Button asChild>
                      <a href={primaryUrl}>
                        <Mail className="mr-2 h-4 w-4" />
                        {primaryLabel || 'E-Mail senden'}
                      </a>
                    </Button>
                  )}
                  {secondaryUrl && (
                    <Button variant="outline" asChild>
                      <a href={secondaryUrl} target="_blank" rel="noopener noreferrer">
                        {secondaryLabel || 'Weitere Infos'}
                        <ExternalLink className="ml-1 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
