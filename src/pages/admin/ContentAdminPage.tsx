import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FileText, Save, Loader2, Globe, Trash2 } from 'lucide-react';
import { useAllPageContent, useUpsertPageContent, PAGE_SECTIONS, PageKey } from '@/hooks/usePageContent';
import { useCmsTranslation } from '@/hooks/useCmsTranslation';
import { LocaleTranslationBox, TranslationStatus, TranslationTarget } from '@/components/admin/LocaleTranslationBox';
import { MediaAssetPicker } from '@/components/admin/MediaAssetPicker';
import { RowsEditor } from '@/components/admin/RowsEditor';
import {
  isStructuredRowsContent,
  parseStructuredRows,
  serializeStructuredRows,
  type StructuredRow,
} from '@/lib/structured-rows';
import { toast } from 'sonner';
import { getPocketBaseErrorMessage } from '@/lib/pocketbase-errors';

interface RowsEditorConfig {
  labelHeader: string;
  valueHeader: string;
  labelPlaceholder: string;
  valuePlaceholder: string;
  addLabel: string;
  helpText: string;
}

const ROWS_EDITOR_CONFIG: Record<string, RowsEditorConfig> = {
  'motocross:training': {
    labelHeader: 'Tag',
    valueHeader: 'Zeit',
    labelPlaceholder: 'z. B. Mittwoch',
    valuePlaceholder: 'z. B. 17:00 – 19:00 Uhr',
    addLabel: 'Trainingstag hinzufügen',
    helpText: 'Jede Zeile entspricht einem Trainingstag. Wird automatisch als Tabelle dargestellt.',
  },
  'motocross:fees': {
    labelHeader: 'Fahrzeug / Kategorie',
    valueHeader: 'Gebühr',
    labelPlaceholder: 'z. B. Motorräder bis 85 ccm',
    valuePlaceholder: 'z. B. 10,00 € pro Trainingstag',
    addLabel: 'Gebühr hinzufügen',
    helpText: 'Eine Zeile pro Fahrzeugklasse. Wird im Frontend als Preisliste angezeigt.',
  },
};

const PAGE_LABELS: Record<PageKey, string> = {
  home: 'Startseite',
  about: 'Über uns',
  board: 'Vorstand',
  history: 'Geschichte',
  membership: 'Mitgliedschaft',
  motocross: 'Motocross',
  trial: 'Trial',
  touring: 'Motorradtouristik',
  calendar: 'Kalender',
  news: 'News',
  event: 'Veranstaltung',
  contact: 'Kontakt',
  sponsors: 'Sponsoren',
  partner_clubs: 'Partnervereine',
  imprint: 'Impressum',
  privacy: 'Datenschutz',
};

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero-Bereich',
  club_teaser: 'Club-Teaser',
  upcoming_events: 'Kommende Termine',
  news: 'News-Bereich',
  sponsors: 'Sponsoren-Bereich',
  intro: 'Einleitung',
  mission: 'Mission',
  values: 'Werte',
  members: 'Mitglieder',
  timeline: 'Zeitstrahl',
  benefits: 'Vorteile',
  how_to_join: 'Wie beitreten',
  declaration_document: 'Beitrittserklärung (Dokument)',
  statute_document: 'Vereinssatzung (Dokument)',
  training: 'Training',
  events: 'Events',
  tours: 'Touren',
  tours_current: 'Aktuelle Touren',
  tours_archive: 'Tourenarchiv',
  community: 'Community',
  track_map: 'Streckenkarte',
  location_map: 'Karten-Embed',
  registration_info: 'Anmeldung',
  visitors_admission: 'Eintrittspreise',
  visitors_schedule: 'Zeitplan / Ablauf',
  visitors_parking: 'Parkplätze & Shuttle',
  visitors_paddock: 'Fahrerlager',
  visitors_photographers: 'Fotografenbereiche',
  visitors_privacy: 'Datenschutzhinweis VA',
  visitors_transport: 'ÖPNV',
  visitors_site_map: 'Lageplan',
  accommodation_intro: 'Übernachtungen-Intro',
  accommodation_list: 'Übernachtungen-Liste',
  gallery: 'Galerie',
  archive: 'Archiv',
  info: 'Kontaktinfos',
  map: 'Karte',
  cta: 'Call-to-Action',
  content: 'Inhalt',
  fees: 'Gebühren',
  safety: 'Sicherheitshinweise',
  directions: 'Anfahrt',
  contact: 'Ansprechpartner',
};

interface ContentFormData {
  title: string;
  subtitle: string;
  content: string;
  primary_button_label: string;
  primary_button_url: string;
  secondary_button_label: string;
  secondary_button_url: string;
  stat_one_label: string;
  stat_two_label: string;
  stat_three_label: string;
}

interface ContentEditorProps {
  pageKey: string;
  sectionKey: string;
  allowImage: boolean;
  initialData?: {
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
    attachment_url?: string | null;
    attachment_name?: string | null;
    header_image_url?: string | null;
    header_image_alt?: string | null;
    image_url?: string | null;
    image_alt?: string | null;
  };
  translationStatus: TranslationStatus;
  allowHeaderImage: boolean;
  hasGermanBaseRecord: boolean;
  onSave: (data: ContentFormData & {
    attachment_file?: File | null;
    clear_attachment?: boolean;
    header_image_alt: string;
    header_image_file?: File | null;
    clear_header_image?: boolean;
    image_alt: string;
    image_file?: File | null;
    clear_image?: boolean;
  }) => Promise<void>;
  onTranslate: (target: TranslationTarget, source: ContentFormData) => Promise<void>;
  isSaving: boolean;
  isTranslating: boolean;
}

function ContentEditor({
  pageKey,
  sectionKey,
  allowImage,
  initialData,
  translationStatus,
  allowHeaderImage,
  hasGermanBaseRecord,
  onSave,
  onTranslate,
  isSaving,
  isTranslating,
}: ContentEditorProps) {
  const [formData, setFormData] = useState<ContentFormData>({
    title: initialData?.title || '',
    subtitle: initialData?.subtitle || '',
    content: initialData?.content || '',
    primary_button_label: initialData?.primary_button_label || '',
    primary_button_url: initialData?.primary_button_url || '',
    secondary_button_label: initialData?.secondary_button_label || '',
    secondary_button_url: initialData?.secondary_button_url || '',
    stat_one_label: initialData?.stat_one_label || '',
    stat_two_label: initialData?.stat_two_label || '',
    stat_three_label: initialData?.stat_three_label || '',
  });
  const [headerImageAlt, setHeaderImageAlt] = useState(initialData?.header_image_alt || '');
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [clearAttachment, setClearAttachment] = useState(false);
  const [headerImageFile, setHeaderImageFile] = useState<File | null>(null);
  const [clearHeaderImage, setClearHeaderImage] = useState(false);
  const [imageAlt, setImageAlt] = useState(initialData?.image_alt || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [clearImage, setClearImage] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const dataKey = `${pageKey}:${sectionKey}:de`;

  useEffect(() => {
    setFormData({
      title: initialData?.title || '',
      subtitle: initialData?.subtitle || '',
      content: initialData?.content || '',
      primary_button_label: initialData?.primary_button_label || '',
      primary_button_url: initialData?.primary_button_url || '',
      secondary_button_label: initialData?.secondary_button_label || '',
      secondary_button_url: initialData?.secondary_button_url || '',
      stat_one_label: initialData?.stat_one_label || '',
      stat_two_label: initialData?.stat_two_label || '',
      stat_three_label: initialData?.stat_three_label || '',
    });
    setHeaderImageAlt(initialData?.header_image_alt || '');
    setAttachmentFile(null);
    setClearAttachment(false);
    setHeaderImageFile(null);
    setClearHeaderImage(false);
    setImageAlt(initialData?.image_alt || '');
    setImageFile(null);
    setClearImage(false);
    setIsDirty(false);
    setSaveSuccess(false);
  }, [dataKey, initialData?.title, initialData?.subtitle, initialData?.content, initialData?.header_image_alt, initialData?.header_image_url, initialData?.image_alt, initialData?.image_url]);

  const handleChange = (field: keyof ContentFormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setIsDirty(true);
    setSaveSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      ...formData,
      attachment_file: attachmentFile,
      clear_attachment: clearAttachment,
      header_image_alt: headerImageAlt,
      header_image_file: headerImageFile,
      clear_header_image: clearHeaderImage,
      image_alt: imageAlt,
      image_file: imageFile,
      clear_image: clearImage,
    });
    setIsDirty(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const hasSourceText =
    formData.title.trim().length > 0 ||
    formData.subtitle.trim().length > 0 ||
    formData.content.trim().length > 0;
  const supportsHeroButtons = pageKey === 'home' && sectionKey === 'hero';
  const supportsClubTeaserStats = pageKey === 'home' && sectionKey === 'club_teaser';
  const supportsAttachment = pageKey === 'membership' && (sectionKey === 'declaration_document' || sectionKey === 'statute_document');
  const supportsBodyContent = !supportsHeroButtons;
  const showImageField = allowImage && !supportsHeroButtons;
  const showHeaderImageField = allowHeaderImage && !supportsHeroButtons;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`title-${sectionKey}`}>Titel (DE)</Label>
        <Input
          id={`title-${sectionKey}`}
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Titel eingeben..."
          className="max-w-xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`subtitle-${sectionKey}`}>Untertitel (DE)</Label>
        <Input
          id={`subtitle-${sectionKey}`}
          value={formData.subtitle}
          onChange={(e) => handleChange('subtitle', e.target.value)}
          placeholder="Untertitel eingeben..."
          className="max-w-xl"
        />
      </div>

      {supportsBodyContent ? (
        rowsConfig ? (
          <div className="space-y-2">
            <Label>Inhalt (DE)</Label>
            <RowsEditor
              rows={rows}
              onChange={(next) => {
                setRows(next);
                setFormData((current) => ({
                  ...current,
                  content: serializeStructuredRows(next),
                }));
                setIsDirty(true);
                setSaveSuccess(false);
              }}
              labelHeader={rowsConfig.labelHeader}
              valueHeader={rowsConfig.valueHeader}
              labelPlaceholder={rowsConfig.labelPlaceholder}
              valuePlaceholder={rowsConfig.valuePlaceholder}
              addLabel={rowsConfig.addLabel}
            />
            <p className="text-xs text-muted-foreground">{rowsConfig.helpText}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor={`content-${sectionKey}`}>Inhalt (DE)</Label>
            <Textarea
              id={`content-${sectionKey}`}
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Inhalt eingeben... (Markdown wird unterstützt)"
              rows={10}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Markdown: **fett**, *kursiv*, [Link](url)
            </p>
          </div>
        )
      ) : null}

      {supportsHeroButtons ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4 rounded-lg border p-4">
            <p className="font-medium">Primärer Button</p>
            <div className="space-y-2">
              <Label htmlFor={`primary-button-label-${sectionKey}`}>Label</Label>
              <Input
                id={`primary-button-label-${sectionKey}`}
                value={formData.primary_button_label}
                onChange={(e) => handleChange('primary_button_label', e.target.value)}
                placeholder="z. B. Mehr erfahren"
                className="max-w-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`primary-button-url-${sectionKey}`}>Ziel</Label>
              <Input
                id={`primary-button-url-${sectionKey}`}
                value={formData.primary_button_url}
                onChange={(e) => handleChange('primary_button_url', e.target.value)}
                placeholder="/club/about oder https://..."
                className="max-w-xl"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <p className="font-medium">Sekundärer Button</p>
            <div className="space-y-2">
              <Label htmlFor={`secondary-button-label-${sectionKey}`}>Label</Label>
              <Input
                id={`secondary-button-label-${sectionKey}`}
                value={formData.secondary_button_label}
                onChange={(e) => handleChange('secondary_button_label', e.target.value)}
                placeholder="z. B. Kalender"
                className="max-w-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`secondary-button-url-${sectionKey}`}>Ziel</Label>
              <Input
                id={`secondary-button-url-${sectionKey}`}
                value={formData.secondary_button_url}
                onChange={(e) => handleChange('secondary_button_url', e.target.value)}
                placeholder="/calendar oder https://..."
                className="max-w-xl"
              />
            </div>
          </div>
        </div>
      ) : null}

      {supportsClubTeaserStats ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2 rounded-lg border p-4">
            <Label htmlFor={`stat-one-label-${sectionKey}`}>Label Kasten 1</Label>
            <Input
              id={`stat-one-label-${sectionKey}`}
              value={formData.stat_one_label}
              onChange={(e) => handleChange('stat_one_label', e.target.value)}
              placeholder="Mitglieder"
            />
          </div>
          <div className="space-y-2 rounded-lg border p-4">
            <Label htmlFor={`stat-two-label-${sectionKey}`}>Label Kasten 2</Label>
            <Input
              id={`stat-two-label-${sectionKey}`}
              value={formData.stat_two_label}
              onChange={(e) => handleChange('stat_two_label', e.target.value)}
              placeholder="Jahre Tradition"
            />
          </div>
          <div className="space-y-2 rounded-lg border p-4">
            <Label htmlFor={`stat-three-label-${sectionKey}`}>Label Kasten 3</Label>
            <Input
              id={`stat-three-label-${sectionKey}`}
              value={formData.stat_three_label}
              onChange={(e) => handleChange('stat_three_label', e.target.value)}
              placeholder="Sektionen"
            />
          </div>
        </div>
      ) : null}

      {showHeaderImageField ? (
        <div className="space-y-2">
          <Label htmlFor={`header-image-${sectionKey}`}>Headerbild</Label>
          <Input
            id={`header-image-${sectionKey}`}
            type="file"
            accept="image/*"
            onChange={(e) => {
              setHeaderImageFile(e.target.files?.[0] || null);
              setClearHeaderImage(false);
              setIsDirty(true);
              setSaveSuccess(false);
            }}
          />
          <MediaAssetPicker
            onSelect={(file, altText) => {
              setHeaderImageFile(file);
              setClearHeaderImage(false);
              if (!headerImageAlt && altText) {
                setHeaderImageAlt(altText);
              }
              setIsDirty(true);
              setSaveSuccess(false);
            }}
          />
          {(headerImageFile || (initialData?.header_image_url && !clearHeaderImage)) && (
            <div className="space-y-2">
              {headerImageFile ? (
                <p className="text-sm text-muted-foreground">{headerImageFile.name}</p>
              ) : initialData?.header_image_url ? (
                <img
                  src={initialData.header_image_url}
                  alt={initialData.header_image_alt || ''}
                  className="h-24 rounded border object-cover"
                />
              ) : null}
              <Input
                value={headerImageAlt}
                onChange={(e) => {
                  setHeaderImageAlt(e.target.value);
                  setIsDirty(true);
                  setSaveSuccess(false);
                }}
                placeholder="Alternativtext für das Headerbild"
                className="max-w-xl"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setHeaderImageFile(null);
                  setHeaderImageAlt('');
                  setClearHeaderImage(true);
                  setIsDirty(true);
                  setSaveSuccess(false);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Headerbild entfernen
              </Button>
            </div>
          )}
        </div>
      ) : null}

      {supportsAttachment ? (
        <div className="space-y-2">
          <Label htmlFor={`attachment-${sectionKey}`}>Dokument</Label>
          <Input
            id={`attachment-${sectionKey}`}
            type="file"
            accept=".pdf,.doc,.docx,.odt"
            onChange={(e) => {
              setAttachmentFile(e.target.files?.[0] || null);
              setClearAttachment(false);
              setIsDirty(true);
              setSaveSuccess(false);
            }}
          />
          {(attachmentFile || (initialData?.attachment_name && !clearAttachment)) && (
            <div className="space-y-2">
              {attachmentFile ? (
                <p className="text-sm text-muted-foreground">{attachmentFile.name}</p>
              ) : initialData?.attachment_name ? (
                <p className="text-sm text-muted-foreground">{initialData.attachment_name}</p>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setAttachmentFile(null);
                  setClearAttachment(true);
                  setIsDirty(true);
                  setSaveSuccess(false);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Dokument entfernen
              </Button>
            </div>
          )}
        </div>
      ) : null}

      {showImageField ? (
        <div className="space-y-2">
          <Label htmlFor={`image-${sectionKey}`}>Abschnittsbild</Label>
          <Input
            id={`image-${sectionKey}`}
            type="file"
            accept="image/*"
            onChange={(e) => {
              setImageFile(e.target.files?.[0] || null);
              setClearImage(false);
              setIsDirty(true);
              setSaveSuccess(false);
            }}
          />
          <MediaAssetPicker
            onSelect={(file, altText) => {
              setImageFile(file);
              setClearImage(false);
              if (!imageAlt && altText) {
                setImageAlt(altText);
              }
              setIsDirty(true);
              setSaveSuccess(false);
            }}
          />
          {(imageFile || (initialData?.image_url && !clearImage)) && (
            <div className="space-y-2">
              {imageFile ? (
                <p className="text-sm text-muted-foreground">{imageFile.name}</p>
              ) : initialData?.image_url ? (
                <img
                  src={initialData.image_url}
                  alt={initialData.image_alt || ''}
                  className="h-24 rounded border object-cover"
                />
              ) : null}
              <Input
                value={imageAlt}
                onChange={(e) => {
                  setImageAlt(e.target.value);
                  setIsDirty(true);
                  setSaveSuccess(false);
                }}
                placeholder="Alternativtext für das Bild"
                className="max-w-xl"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setImageFile(null);
                  setImageAlt('');
                  setClearImage(true);
                  setIsDirty(true);
                  setSaveSuccess(false);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Abschnittsbild entfernen
              </Button>
            </div>
          )}
        </div>
      ) : null}

      <LocaleTranslationBox
        description="DE bleibt führend. EN/CZ werden separat gespeichert (zuerst DE speichern)."
        status={translationStatus}
        onTranslate={(target) => onTranslate(target, formData)}
        isTranslating={isTranslating}
        disabled={!hasSourceText || !hasGermanBaseRecord}
      />

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSaving || !isDirty}>
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          DE speichern
        </Button>

        {isDirty && <span className="text-sm text-muted-foreground">Ungespeicherte Änderungen</span>}
        {saveSuccess && <span className="text-sm text-green-600 dark:text-green-400">Gespeichert</span>}
      </div>
    </form>
  );
}

function PageContentSection({ pageKey }: { pageKey: PageKey }) {
  const { data: content, isLoading } = useAllPageContent(pageKey);
  const upsertContent = useUpsertPageContent();
  const translate = useCmsTranslation();
  const sections = PAGE_SECTIONS[pageKey];
  const imageSections = new Set(['event:track_map', 'history:intro', 'motocross:intro', 'trial:intro', 'touring:intro']);
  const headerImageSections = new Set(['about:intro', 'board:intro', 'history:intro', 'membership:intro', 'partner_clubs:intro', 'motocross:intro', 'trial:intro', 'touring:intro', 'contact:intro']);

  const getContentForSection = (sectionKey: string, locale: string) =>
    content?.find((item) => item.section_key === sectionKey && item.locale === locale) || null;

  const getTranslationStatus = (sectionKey: string): TranslationStatus => ({
    en: Boolean(getContentForSection(sectionKey, 'en')),
    cz: Boolean(getContentForSection(sectionKey, 'cz')),
  });

  const handleSaveGerman = async (
    sectionKey: string,
    data: ContentFormData & {
      attachment_file?: File | null;
      clear_attachment?: boolean;
      header_image_alt: string;
      header_image_file?: File | null;
      clear_header_image?: boolean;
      image_alt: string;
      image_file?: File | null;
      clear_image?: boolean;
    },
  ) => {
    try {
      await upsertContent.mutateAsync({
        page_key: pageKey,
        section_key: sectionKey,
        locale: 'de',
        title: data.title || null,
        subtitle: data.subtitle || null,
        content: data.content || null,
        primary_button_label: data.primary_button_label || null,
        primary_button_url: data.primary_button_url || null,
        secondary_button_label: data.secondary_button_label || null,
        secondary_button_url: data.secondary_button_url || null,
        stat_one_label: data.stat_one_label || null,
        stat_two_label: data.stat_two_label || null,
        stat_three_label: data.stat_three_label || null,
        attachment_file: data.attachment_file || null,
        clear_attachment: data.clear_attachment || false,
        header_image_alt: data.header_image_alt || null,
        header_image_file: data.header_image_file || null,
        clear_header_image: data.clear_header_image || false,
        image_alt: data.image_alt || null,
        image_file: data.image_file || null,
        clear_image: data.clear_image || false,
      });
      toast.success('Deutscher Inhalt gespeichert');
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Speichern'));
    }
  };

  const handleTranslateSection = async (
    sectionKey: string,
    targetLocale: TranslationTarget,
    source: ContentFormData,
  ) => {
    if (!source.title.trim() && !source.subtitle.trim() && !source.content.trim()) {
      toast.error('Bitte zuerst deutsche Inhalte eintragen.');
      return;
    }

    const germanRecord = getContentForSection(sectionKey, 'de');
    if (!germanRecord) {
      toast.error('Bitte zuerst den deutschen Abschnitt speichern.');
      return;
    }

    try {
      const translated = await translate.mutateAsync({
        sourceLocale: 'de',
        targetLocale,
        context: `${PAGE_LABELS[pageKey]} / ${SECTION_LABELS[sectionKey] || sectionKey}`,
        fields: {
          title: source.title,
          subtitle: source.subtitle,
          content: source.content,
          primaryButtonLabel: source.primary_button_label,
          secondaryButtonLabel: source.secondary_button_label,
          statOneLabel: source.stat_one_label,
          statTwoLabel: source.stat_two_label,
          statThreeLabel: source.stat_three_label,
        },
      });

      const translatedTitle = String(translated.title || '').trim();
      const translatedSubtitle = String(translated.subtitle || '').trim();
      const translatedContent = String(translated.content || '').trim();
      const translatedPrimaryButtonLabel = String(translated.primaryButtonLabel || '').trim();
      const translatedSecondaryButtonLabel = String(translated.secondaryButtonLabel || '').trim();
      const translatedStatOneLabel = String(translated.statOneLabel || '').trim();
      const translatedStatTwoLabel = String(translated.statTwoLabel || '').trim();
      const translatedStatThreeLabel = String(translated.statThreeLabel || '').trim();

      if (
        !translatedTitle &&
        !translatedSubtitle &&
        !translatedContent &&
        !translatedPrimaryButtonLabel &&
        !translatedSecondaryButtonLabel &&
        !translatedStatOneLabel &&
        !translatedStatTwoLabel &&
        !translatedStatThreeLabel
      ) {
        toast.error('DeepL hat keine verwertbaren Texte geliefert.');
        return;
      }

      const existingTarget = getContentForSection(sectionKey, targetLocale);

      await upsertContent.mutateAsync({
        page_key: pageKey,
        section_key: sectionKey,
        locale: targetLocale,
        title: translatedTitle || source.title || null,
        subtitle: translatedSubtitle || source.subtitle || null,
        content: translatedContent || source.content || null,
        primary_button_label:
          translatedPrimaryButtonLabel || source.primary_button_label || null,
        primary_button_url: existingTarget?.primary_button_url || germanRecord?.primary_button_url || null,
        secondary_button_label:
          translatedSecondaryButtonLabel || source.secondary_button_label || null,
        secondary_button_url:
          existingTarget?.secondary_button_url || germanRecord?.secondary_button_url || null,
        stat_one_label: translatedStatOneLabel || source.stat_one_label || null,
        stat_two_label: translatedStatTwoLabel || source.stat_two_label || null,
        stat_three_label: translatedStatThreeLabel || source.stat_three_label || null,
        header_image_alt: existingTarget?.header_image_alt || germanRecord?.header_image_alt || null,
        header_image_file: null,
        clear_header_image: false,
        image_alt: existingTarget?.image_alt || germanRecord?.image_alt || null,
        image_file: null,
        clear_image: false,
      });

      toast.success(`Übersetzung ${targetLocale.toUpperCase()} gespeichert`);
    } catch (error: unknown) {
      toast.error(getPocketBaseErrorMessage(error, 'Übersetzung fehlgeschlagen'));
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
      <p className="text-sm text-muted-foreground">
        Bearbeitung erfolgt immer in Deutsch. EN/CZ werden separat über „Übersetzungen“ gepflegt.
      </p>

      <Accordion type="single" collapsible className="space-y-2">
        {sections.map((sectionKey) => {
          const germanContent = getContentForSection(sectionKey, 'de');
          const translationStatus = getTranslationStatus(sectionKey);
          const hasGermanContent = Boolean(germanContent?.title || germanContent?.content || germanContent?.subtitle);

          return (
            <AccordionItem key={sectionKey} value={sectionKey} className="rounded-lg border px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{SECTION_LABELS[sectionKey] || sectionKey}</span>
                  {hasGermanContent ? (
                    <Badge variant="default" className="text-xs">DE bearbeitet</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">DE leer</Badge>
                  )}
                  <Badge variant={translationStatus.en ? 'secondary' : 'outline'} className="text-xs">
                    EN {translationStatus.en ? 'ok' : 'fehlt'}
                  </Badge>
                  <Badge variant={translationStatus.cz ? 'secondary' : 'outline'} className="text-xs">
                    CZ {translationStatus.cz ? 'ok' : 'fehlt'}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-6 pt-4">
                <ContentEditor
                  pageKey={pageKey}
                  sectionKey={sectionKey}
                  allowImage={imageSections.has(`${pageKey}:${sectionKey}`)}
                  allowHeaderImage={headerImageSections.has(`${pageKey}:${sectionKey}`)}
                  initialData={germanContent || undefined}
                  translationStatus={translationStatus}
                  hasGermanBaseRecord={Boolean(germanContent)}
                  onSave={(data) => handleSaveGerman(sectionKey, data)}
                  onTranslate={(target, source) => handleTranslateSection(sectionKey, target, source)}
                  isSaving={upsertContent.isPending}
                  isTranslating={translate.isPending}
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
      <div>
        <h1 className="text-3xl font-bold">Seiten & Texte</h1>
        <p className="text-muted-foreground">Hier bleiben nur freie Einleitungen, Rechtstexte und statische Abschnittsüberschriften.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
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
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/50">
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
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Object.values(PAGE_SECTIONS).reduce((sum, sections) => sum + sections.length, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Abschnitte</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Freie Seiteninhalte bearbeiten</CardTitle>
          <CardDescription>Listen, Karten und strukturierte Inhalte werden separat unter „Strukturierte Inhalte“ gepflegt.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="home">
            <TabsList className="mb-6 flex h-auto flex-wrap gap-1">
              {(Object.keys(PAGE_SECTIONS) as PageKey[]).map((pageKey) => (
                <TabsTrigger key={pageKey} value={pageKey} className="text-sm">
                  {PAGE_LABELS[pageKey]}
                </TabsTrigger>
              ))}
            </TabsList>

            {(Object.keys(PAGE_SECTIONS) as PageKey[]).map((pageKey) => (
              <TabsContent key={pageKey} value={pageKey}>
                <PageContentSection pageKey={pageKey} />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
