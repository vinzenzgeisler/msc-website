import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Image, Archive, Save, Loader2, Globe, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAllPageContent, useUpsertPageContent, type PageContent } from '@/hooks/usePageContent';
import { toast } from 'sonner';
import { getPocketBaseErrorMessage } from '@/lib/pocketbase-errors';

const LOCALES = ['de', 'en', 'cz'] as const;
const LOCALE_LABELS: Record<string, string> = { de: 'Deutsch', en: 'English', cz: 'Čeština' };

interface SectionFormData {
  title: string;
  content: string;
}

function SectionEditor({
  sectionKey,
  label,
  icon: Icon,
  description,
  allContent,
  isLoading,
}: {
  sectionKey: string;
  label: string;
  icon: React.ElementType;
  description: string;
  allContent: PageContent[];
  isLoading: boolean;
}) {
  const [locale, setLocale] = useState<string>('de');
  const [form, setForm] = useState<SectionFormData>({ title: '', content: '' });
  const [dirty, setDirty] = useState(false);
  const upsert = useUpsertPageContent();

  const existing = allContent.find(
    (c) => c.section_key === sectionKey && c.locale === locale,
  );

  useEffect(() => {
    if (existing) {
      setForm({ title: existing.title || '', content: existing.content || '' });
    } else {
      setForm({ title: '', content: '' });
    }
    setDirty(false);
  }, [existing, locale]);

  const handleSave = async () => {
    try {
      await upsert.mutateAsync({
        page_key: 'event',
        section_key: sectionKey,
        locale,
        title: form.title,
        content: form.content,
      });
      setDirty(false);
      toast.success('Gespeichert');
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Speichern'));
    }
  };

  const filledLocales = LOCALES.filter((l) =>
    allContent.some((c) => c.section_key === sectionKey && c.locale === l && (c.title || c.content)),
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{label}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {filledLocales.map((l) => (
              <Badge key={l} variant="secondary" className="text-xs">
                {l.toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Locale tabs */}
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-1">
            {LOCALES.map((l) => (
              <Button
                key={l}
                variant={locale === l ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLocale(l)}
              >
                {LOCALE_LABELS[l]}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor={`${sectionKey}-title`}>Titel</Label>
            <Input
              id={`${sectionKey}-title`}
              value={form.title}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, title: e.target.value }));
                setDirty(true);
              }}
              placeholder={sectionKey === 'gallery' ? 'z.B. Fotogalerie' : 'z.B. Rennarchiv'}
            />
          </div>
          <div>
            <Label htmlFor={`${sectionKey}-content`}>Inhalt</Label>
            <Textarea
              id={`${sectionKey}-content`}
              value={form.content}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, content: e.target.value }));
                setDirty(true);
              }}
              rows={6}
              placeholder={
                sectionKey === 'gallery'
                  ? 'Beschreiben Sie die Galerie oder fügen Sie Links zu Fotoalben ein...'
                  : 'Archivdaten, Ergebnisse vergangener Rennen, historische Informationen...'
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              HTML wird unterstützt. Nutzen Sie &lt;a href="..."&gt; für Links und &lt;br&gt; für Zeilenumbrüche.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!dirty || upsert.isPending}>
            {upsert.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Speichern
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function EventGalleryArchivePage() {
  const { data: allContent, isLoading } = useAllPageContent('event');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/events">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Galerie & Archiv</h1>
          <p className="text-muted-foreground">
            Pflegen Sie Galerie- und Archivdaten für die Veranstaltungsseite
          </p>
        </div>
      </div>

      <Tabs defaultValue="gallery">
        <TabsList>
          <TabsTrigger value="gallery" className="gap-2">
            <Image className="h-4 w-4" />
            Galerie
          </TabsTrigger>
          <TabsTrigger value="archive" className="gap-2">
            <Archive className="h-4 w-4" />
            Archiv
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gallery" className="mt-6">
          <SectionEditor
            sectionKey="gallery"
            label="Fotogalerie"
            icon={Image}
            description="Bilder und Impressionen von der Veranstaltung"
            allContent={allContent || []}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="archive" className="mt-6">
          <SectionEditor
            sectionKey="archive"
            label="Rennarchiv"
            icon={Archive}
            description="Ergebnisse und Daten vergangener Veranstaltungen"
            allContent={allContent || []}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
