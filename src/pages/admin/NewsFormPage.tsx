import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Pin, CalendarIcon } from 'lucide-react';
import { usePost, usePosts, useCreatePost, useUpdatePost } from '@/hooks/usePosts';
import { useCmsTranslation } from '@/hooks/useCmsTranslation';
import { LocaleTranslationBox, TranslationTarget } from '@/components/admin/LocaleTranslationBox';
import { buildSlug } from '@/integrations/pocketbase/client';
import { toast } from 'sonner';
import { getPocketBaseErrorMessage } from '@/lib/pocketbase-errors';

const categories = [
  { value: 'event', label: 'Veranstaltung' },
  { value: 'motocross', label: 'Motocross' },
  { value: 'trial', label: 'Trial' },
  { value: 'touring', label: 'Touring' },
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
    published_at: null as string | null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

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
      published_at: existingPost.published_at || null,
    });
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
        published_at: formData.published_at || (formData.status === 'published' ? new Date().toISOString() : null),
        imageFile,
      };

      if (isEditing) {
        await updatePost.mutateAsync({ id, ...postData });
        toast.success('Deutscher Artikel aktualisiert');
      } else {
        await createPost.mutateAsync(postData);
        toast.success('Deutscher Artikel erstellt');
      }
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
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
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

  if (isEditing && isLoadingPost) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/news">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{isEditing ? 'Artikel bearbeiten' : 'Neuer Artikel'}</h1>
          <p className="text-muted-foreground">Bearbeitung erfolgt immer in Deutsch (DE)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Deutscher Hauptinhalt</CardTitle>
            <CardDescription>Titel und Inhalt des Artikels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((current) => ({ ...current, title: e.target.value }))}
                placeholder="Artikelüberschrift"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL-Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData((current) => ({ ...current, slug: e.target.value }))}
                placeholder="artikel-url"
              />
              <p className="text-xs text-muted-foreground">Standardmäßig aus dem Titel erzeugt</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Kurzbeschreibung</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData((current) => ({ ...current, excerpt: e.target.value }))}
                placeholder="Kurze Zusammenfassung..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Inhalt</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(html) => setFormData((current) => ({ ...current, content: html }))}
                placeholder="Vollständiger Artikeltext..."
              />
              <p className="text-xs text-muted-foreground">
                Nutze die Toolbar, um Text zu formatieren und Bilder einzufügen.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Einstellungen</CardTitle>
            <CardDescription>Kategorie, Bild und Veröffentlichung</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Kategorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((current) => ({ ...current, category: value }))}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_file">Bild</Label>
                <Input
                  id="image_file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
                {(imageFile || existingPost?.image_url) && (
                  <p className="text-xs text-muted-foreground">
                    {imageFile ? `Ausgewählt: ${imageFile.name}` : 'Bereits vorhandenes Bild bleibt erhalten'}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Veröffentlichungsdatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.published_at && 'text-muted-foreground',
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.published_at
                      ? format(new Date(formData.published_at), 'd. MMMM yyyy', { locale: de })
                      : 'Datum wählen (optional)'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.published_at ? new Date(formData.published_at) : undefined}
                    onSelect={(date) =>
                      setFormData((current) => ({
                        ...current,
                        published_at: date ? date.toISOString() : null,
                      }))
                    }
                    initialFocus
                    className={cn('p-3 pointer-events-auto')}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground">
                Wird als Datum im Artikel angezeigt. Ohne Angabe wird das Erstellungsdatum verwendet.
              </p>
            </div>

            <LocaleTranslationBox
              description="DE bleibt führend. EN/CZ werden separat gespeichert (zuerst DE speichern)."
              status={translationStatus}
              onTranslate={handleTranslateTo}
              isTranslating={translate.isPending}
              disabled={!deSlug || !hasGermanBaseRecord}
            />

            <div className="flex items-center justify-between rounded-lg border border-accent/50 bg-accent/5 p-4">
              <div className="flex items-start gap-3">
                <Pin className="mt-0.5 h-5 w-5 text-accent" />
                <div className="space-y-0.5">
                  <Label htmlFor="is_pinned">Angeheftet</Label>
                  <p className="text-sm text-muted-foreground">Artikel oben in der Liste anzeigen</p>
                </div>
              </div>
              <Switch
                id="is_pinned"
                checked={formData.is_pinned}
                onCheckedChange={(checked) =>
                  setFormData((current) => ({ ...current, is_pinned: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="published">Veröffentlichen</Label>
                <p className="text-sm text-muted-foreground">Artikel sofort auf der Website anzeigen</p>
              </div>
              <Switch
                id="published"
                checked={formData.status === 'published'}
                onCheckedChange={(checked) =>
                  setFormData((current) => ({ ...current, status: checked ? 'published' : 'draft' }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Speichern...
              </>
            ) : (
              'Speichern'
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/news')}>
            Abbrechen
          </Button>
        </div>
      </form>
    </div>
  );
}
