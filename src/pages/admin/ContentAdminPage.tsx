import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FileText, Save, Loader2, Globe } from 'lucide-react';
import { useAllPageContent, useUpsertPageContent, PAGE_SECTIONS, PageKey } from '@/hooks/usePageContent';
import { toast } from 'sonner';

const PAGE_LABELS: Record<PageKey, string> = {
  home: 'Startseite',
  about: 'Über uns',
  board: 'Vorstand',
  history: 'Geschichte',
  membership: 'Mitgliedschaft',
  motocross: 'Motocross',
  trial: 'Trial',
  touring: 'Motorradtouristik',
  imprint: 'Impressum',
  privacy: 'Datenschutz',
};

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero-Bereich',
  club_teaser: 'Club-Teaser',
  intro: 'Einleitung',
  mission: 'Mission',
  values: 'Werte',
  members: 'Mitglieder',
  timeline: 'Zeitstrahl',
  benefits: 'Vorteile',
  how_to_join: 'Wie beitreten',
  training: 'Training',
  events: 'Events',
  tours: 'Touren',
  community: 'Community',
  content: 'Inhalt',
};

const LOCALES = [
  { value: 'de', label: 'Deutsch' },
  { value: 'en', label: 'English' },
  { value: 'cz', label: 'Čeština' },
];

interface ContentFormData {
  title: string;
  subtitle: string;
  content: string;
}

function ContentEditor({ 
  pageKey, 
  sectionKey, 
  locale,
  initialData,
  onSave,
  isSaving,
}: {
  pageKey: string;
  sectionKey: string;
  locale: string;
  initialData?: { title?: string | null; subtitle?: string | null; content?: string | null };
  onSave: (data: ContentFormData) => void;
  isSaving: boolean;
}) {
  const [formData, setFormData] = useState<ContentFormData>({
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    content: initialData?.content || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`title-${sectionKey}-${locale}`}>Titel</Label>
        <Input
          id={`title-${sectionKey}-${locale}`}
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Titel eingeben..."
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`subtitle-${sectionKey}-${locale}`}>Untertitel</Label>
        <Input
          id={`subtitle-${sectionKey}-${locale}`}
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          placeholder="Untertitel eingeben..."
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`content-${sectionKey}-${locale}`}>Inhalt</Label>
        <Textarea
          id={`content-${sectionKey}-${locale}`}
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Inhalt eingeben..."
          rows={8}
        />
      </div>
      
      <Button type="submit" disabled={isSaving}>
        {isSaving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Speichern
      </Button>
    </form>
  );
}

function PageContentSection({ pageKey }: { pageKey: PageKey }) {
  const [selectedLocale, setSelectedLocale] = useState('de');
  const { data: content, isLoading } = useAllPageContent(pageKey);
  const upsertContent = useUpsertPageContent();
  
  const sections = PAGE_SECTIONS[pageKey];
  
  const getContentForSection = (sectionKey: string, locale: string) => {
    return content?.find(c => c.section_key === sectionKey && c.locale === locale);
  };
  
  const handleSave = async (sectionKey: string, data: ContentFormData) => {
    try {
      await upsertContent.mutateAsync({
        page_key: pageKey,
        section_key: sectionKey,
        locale: selectedLocale,
        title: data.title || null,
        subtitle: data.subtitle || null,
        content: data.content || null,
      });
      toast.success('Inhalt gespeichert');
    } catch (err) {
      toast.error('Fehler beim Speichern');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Locale Selector */}
      <div className="flex items-center gap-4">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedLocale} onValueChange={setSelectedLocale}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOCALES.map((loc) => (
              <SelectItem key={loc.value} value={loc.value}>
                {loc.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Sections */}
      <Accordion type="single" collapsible className="space-y-2">
        {sections.map((sectionKey) => {
          const sectionContent = getContentForSection(sectionKey, selectedLocale);
          const hasContent = sectionContent?.title || sectionContent?.content;
          
          return (
            <AccordionItem key={sectionKey} value={sectionKey} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="font-medium">
                    {SECTION_LABELS[sectionKey] || sectionKey}
                  </span>
                  {hasContent ? (
                    <Badge variant="default" className="text-xs">Bearbeitet</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Leer</Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <ContentEditor
                  pageKey={pageKey}
                  sectionKey={sectionKey}
                  locale={selectedLocale}
                  initialData={sectionContent}
                  onSave={(data) => handleSave(sectionKey, data)}
                  isSaving={upsertContent.isPending}
                />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

export default function ContentAdminPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Inhalte</h1>
        <p className="text-muted-foreground">Bearbeiten Sie Texte auf allen Seiten der Website</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Object.keys(PAGE_SECTIONS).length}</p>
                <p className="text-sm text-muted-foreground">Seiten</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/50 flex items-center justify-center">
                <Globe className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Sprachen</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Object.values(PAGE_SECTIONS).reduce((acc, sections) => acc + sections.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Abschnitte</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Page Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Seiteninhalte bearbeiten</CardTitle>
          <CardDescription>
            Wählen Sie eine Seite und bearbeiten Sie die Texte in allen Sprachen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="home">
            <TabsList className="flex flex-wrap h-auto gap-1 mb-6">
              {(Object.keys(PAGE_SECTIONS) as PageKey[]).map((key) => (
                <TabsTrigger key={key} value={key} className="text-sm">
                  {PAGE_LABELS[key]}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {(Object.keys(PAGE_SECTIONS) as PageKey[]).map((key) => (
              <TabsContent key={key} value={key}>
                <PageContentSection pageKey={key} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
