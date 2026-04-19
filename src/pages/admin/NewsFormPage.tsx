import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { MediaAssetPicker } from '@/components/admin/MediaAssetPicker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Pin, Save, FileText, Settings2 } from 'lucide-react';
import { usePost, usePosts, useCreatePost, useUpdatePost } from '@/hooks/usePosts';
import { useCmsTranslation } from '@/hooks/useCmsTranslation';
import { LocaleTranslationBox, TranslationMeta, TranslationTarget } from '@/components/admin/LocaleTranslationBox';
import { buildSlug } from '@/integrations/pocketbase/client';
import { toast } from 'sonner';
import { getPocketBaseErrorMessage } from '@/lib/pocketbase-errors';
import { formatDateSafe } from '@/lib/date';

const categories = [
  { value: 'event', label: 'Veranstaltung' },
  { value: 'motocross', label: 'Motocross' },
  { value: 'trial', label: 'Trial' },
  { value: 'touring', label: 'Motorradtouristik' },
  { value: 'verein', label: 'Verein' },
];

export default function NewsFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';

  const { data: existingPost, isLoading: isLoadingPost } = usePost(isEditing ? id : '');
  const { data: allPosts } = usePosts(false);
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const translate = useCmsTranslation();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    is_pinned: false,
    status: 'draft' as 'draft' | 'published',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const updateField = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const deSlug = useMemo(
    () => buildSlug(formData.slug || formData.title || existingPost?.slug || ''),
    [formData.slug, formData.title, existingPost?.slug],
  );

  const translationStatus = useMemo(() => {
    const status = { en: false, cz: false };
    if (!allPosts || !deSlug) return status;
    status.en = Boolean(allPosts.find((post) => post.locale === 'en' && post.slug === deSlug));
    status.cz = Boolean(allPosts.find((post) => post.locale === 'cz' && post.slug === deSlug));
    return status;
  }, [allPosts, deSlug]);

  const translationMeta = useMemo<Record<TranslationTarget, TranslationMeta>>(() => {
    const fallback = { en: { exists: false }, cz: { exists: false } } as Record<TranslationTarget, TranslationMeta>;
    if (!allPosts || !deSlug) return fallback;

    const buildMeta = (targetLocale: TranslationTarget): TranslationMeta => {
      const translation = allPosts.find((post) => post.locale === targetLocale && post.slug === deSlug);
      if (!translation) return { exists: false };
      return { exists: true, status: translation.status, date: translation.display_date };
    };

    return { en: buildMeta('en'), cz: buildMeta('cz') };
  }, [allPosts, deSlug]);

  const hasGermanBaseRecord = useMemo(
    () => Boolean(allPosts?.find((post) => post.locale === 'de' && post.slug === deSlug)),
    [allPosts, deSlug],
  );

  useEffect(() => {
    if (!existingPost) return;

    if (existingPost.locale !== 'de' && allPosts) {
      const germanVariant = allPosts.find(
        (post) => post.locale === 'de' && post.slug === existingPost.slug,
      );
      if (germanVariant && germanVariant.id !== existingPost.id) {
        navigate(`/admin/news/${germanVariant.id}`);
        return;
      }
    }

    setFormData({
      title: existingPost.title || '',
      slug: existingPost.slug || '',
      excerpt: existingPost.excerpt || '',
      content: existingPost.content || '',
      category: existingPost.category || '',
      is_pinned: existingPost.is_pinned || false,
      status: existingPost.status || 'draft',
    });
    setIsDirty(false);
  }, [existingPost, allPosts, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Bitte geben Sie einen Titel ein');
      return;
    }

    if (!deSlug) {
      toast.error('Slug konnte nicht erzeugt werden');
      return;
    }

    const duplicateSlug = allPosts?.find(
      (post) => post.id !== id && post.locale === 'de' && post.slug === deSlug,
    );
    if (duplicateSlug) {
      toast.error('Für diesen Titel existiert bereits ein deutscher Artikel.');
      return;
    }

    try {
      const germanPublishedAt =
        formData.status === 'published'
          ? existingPost?.published_at || new Date().toISOString()
          : null;

      const postData = {
        title: formData.title.trim(),
        slug: deSlug,
        excerpt: formData.excerpt.trim() || null,
        content: formData.content.trim() || null,
        category: formData.category || null,
        image_url: null as string | null,
        locale: 'de' as const,
        is_pinned: formData.is_pinned,
        status: formData.status,
        author_id: null,
        published_at: germanPublishedAt,
        display_date: germanPublishedAt,
        imageFile,
      };

      if (isEditing) {
        await updatePost.mutateAsync({ id, ...postData });
        toast.success('Deutscher Artikel aktualisiert');
      } else {
        await createPost.mutateAsync(postData);
        toast.success('Deutscher Artikel erstellt');
      }
      setIsDirty(false);
      navigate('/admin/news');
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Speichern'));
      console.error(error);
    }
  };

  const handleTranslateTo = async (targetLocale: TranslationTarget) => {
    if (!formData.title.trim()) {
      toast.error('Bitte zuerst den deutschen Titel ausfüllen.');
      return;
    }

    if (!deSlug) {
      toast.error('Bitte zuerst den deutschen Artikel speichern.');
      return;
    }

    if (!hasGermanBaseRecord) {
      toast.error('Bitte zuerst den deutschen Artikel speichern.');
      return;
    }

    try {
      const germanSource = allPosts?.find(
        (post) => post.locale === 'de' && post.slug === deSlug,
      );
      const translationPublishedAt =
        formData.status === 'published'
          ? germanSource?.published_at || existingPost?.published_at || new Date().toISOString()
          : null;

      const translated = await translate.mutateAsync({
        sourceLocale: 'de',
        targetLocale,
        context: 'News-Artikel für die Vereinswebsite',
        fields: {
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
        },
      });

      const translatedTitle = String(translated.title || '').trim();
      const translatedExcerpt = String(translated.excerpt || '').trim();
      const translatedContent = String(translated.content || '').trim();

      if (!translatedTitle && !translatedExcerpt && !translatedContent) {
        toast.error('DeepL hat keine verwertbaren Texte geliefert.');
        return;
      }

      const payload = {
        title: translatedTitle || formData.title.trim(),
        slug: deSlug,
        excerpt: translatedExcerpt || formData.excerpt.trim() || null,
        content: translatedContent || formData.content.trim() || null,
        category: formData.category || null,
        image_url: null as string | null,
        locale: targetLocale,
        is_pinned: formData.is_pinned,
        status: formData.status,
        author_id: null,
        published_at: translationPublishedAt,
        display_date: translationPublishedAt,
      };

      const existingTranslation = allPosts?.find(
        (post) => post.locale === targetLocale && post.slug === deSlug,
      );

      if (existingTranslation) {
        await updatePost.mutateAsync({ id: existingTranslation.id, ...payload });
      } else {
        await createPost.mutateAsync(payload);
      }

      toast.success(`Übersetzung ${targetLocale.toUpperCase()} gespeichert`);
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Übersetzung fehlgeschlagen'));
    }
  };

  const isSubmitting = createPost.isPending || updatePost.isPending;
  const displayDate = existingPost?.display_date || null;

  if (isEditing && isLoadingPost) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/news">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? 'Artikel bearbeiten' : 'Neuer Artikel'}</h1>
          <p className="text-muted-foreground text-sm">Bearbeitung erfolgt immer in Deutsch (DE)</p>
        </div>
      </div>

      {/* Sticky save bar */}
      {isDirty && (
        <div className="sticky top-0 z-30 bg-accent/10 border border-accent/30 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-accent-foreground">Ungespeicherte Änderungen</p>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Speichern
          </Button>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left column: main content */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Inhalt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Artikelüberschrift"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL-Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => updateField('slug', e.target.value)}
                  placeholder="artikel-url"
                />
                <p className="text-xs text-muted-foreground">Standardmäßig aus dem Titel erzeugt</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Kurzbeschreibung</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => updateField('excerpt', e.target.value)}
                  placeholder="Kurze Zusammenfassung..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Inhalt</Label>
                <RichTextEditor
                  content={formData.content}
                  onChange={(html) => updateField('content', html)}
                  placeholder="Vollständiger Artikeltext..."
                />
                <p className="text-xs text-muted-foreground">
                  Nutze die Toolbar, um Text zu formatieren und Bilder einzufügen.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Image */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Bild</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                id="image_file"
                type="file"
                accept="image/*"
                onChange={(e) => { setImageFile(e.target.files?.[0] || null); setIsDirty(true); }}
              />
              <MediaAssetPicker onSelect={(file) => { setImageFile(file); setIsDirty(true); }} />
              {(imageFile || existingPost?.image_url) && (
                <p className="text-xs text-muted-foreground">
                  {imageFile ? `Ausgewählt: ${imageFile.name}` : 'Bereits vorhandenes Bild bleibt erhalten'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="published" className="font-medium">Veröffentlicht</Label>
                  <p className="text-xs text-muted-foreground">Auf der Website sichtbar</p>
                  {displayDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Datum: {formatDateSafe(displayDate, 'dd.MM.yyyy')}
                    </p>
                  )}
                </div>
                <Switch
                  id="published"
                  checked={formData.status === 'published'}
                  onCheckedChange={(checked) => updateField('status', checked ? 'published' : 'draft')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-start gap-2">
                  <Pin className="mt-0.5 h-4 w-4 text-accent" />
                  <div>
                    <Label htmlFor="is_pinned" className="font-medium">Angeheftet</Label>
                    <p className="text-xs text-muted-foreground">Oben in der Liste</p>
                  </div>
                </div>
                <Switch
                  id="is_pinned"
                  checked={formData.is_pinned}
                  onCheckedChange={(checked) => updateField('is_pinned', checked)}
                />
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full" disabled={isSubmitting || !isDirty}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Speichern...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Änderungen speichern
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-muted-foreground" />
                Kategorie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.category}
                onValueChange={(value) => updateField('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Translations */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Übersetzungen</CardTitle>
            </CardHeader>
            <CardContent>
              <LocaleTranslationBox
                description="DE bleibt führend. EN/CZ werden separat gespeichert."
                status={translationStatus}
                meta={translationMeta}
                onTranslate={handleTranslateTo}
                isTranslating={translate.isPending}
                disabled={!deSlug || !hasGermanBaseRecord}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
