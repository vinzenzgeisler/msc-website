import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Pin } from 'lucide-react';
import { usePost, useCreatePost, useUpdatePost } from '@/hooks/usePosts';
import { toast } from 'sonner';

const categories = [
  { value: 'allgemein', label: 'Allgemein' },
  { value: 'motocross', label: 'Motocross' },
  { value: 'trial', label: 'Trial' },
  { value: 'touring', label: 'Tourenfahrt' },
  { value: 'verein', label: 'Verein' },
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function NewsFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';

  const { data: existingPost, isLoading: isLoadingPost } = usePost(isEditing ? id : '');
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    image_url: '',
    locale: 'de',
    is_pinned: false,
    status: 'draft' as 'draft' | 'published',
  });

  useEffect(() => {
    if (existingPost) {
      setFormData({
        title: existingPost.title || '',
        slug: existingPost.slug || '',
        excerpt: existingPost.excerpt || '',
        content: existingPost.content || '',
        category: existingPost.category || '',
        image_url: existingPost.image_url || '',
        locale: existingPost.locale || 'de',
        is_pinned: existingPost.is_pinned || false,
        status: existingPost.status || 'draft',
      });
    }
  }, [existingPost]);

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: isEditing ? formData.slug : generateSlug(title),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error('Bitte geben Sie einen Titel ein');
      return;
    }

    try {
      const postData = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        excerpt: formData.excerpt || null,
        content: formData.content || null,
        category: formData.category || null,
        image_url: formData.image_url || null,
        locale: formData.locale,
        is_pinned: formData.is_pinned,
        status: formData.status,
        author_id: null,
        published_at: formData.status === 'published' ? new Date().toISOString() : null,
      };

      if (isEditing) {
        await updatePost.mutateAsync({ id, ...postData });
        toast.success('Artikel aktualisiert');
      } else {
        await createPost.mutateAsync(postData);
        toast.success('Artikel erstellt');
      }
      navigate('/admin/news');
    } catch (error) {
      toast.error('Fehler beim Speichern');
      console.error(error);
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
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/news">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Artikel bearbeiten' : 'Neuer Artikel'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Bearbeiten Sie den Artikel' : 'Erstellen Sie einen neuen News-Artikel'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Inhalt</CardTitle>
            <CardDescription>Titel und Inhalt des Artikels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Artikelüberschrift"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL-Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="artikel-url"
              />
              <p className="text-xs text-muted-foreground">
                Wird automatisch aus dem Titel generiert
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Kurzbeschreibung</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Kurze Zusammenfassung für die Vorschau..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Inhalt</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Der vollständige Artikeltext..."
                rows={10}
              />
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
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Kategorie auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Bild-URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-accent/50 bg-accent/5 p-4">
              <div className="flex items-start gap-3">
                <Pin className="h-5 w-5 text-accent mt-0.5" />
                <div className="space-y-0.5">
                  <Label htmlFor="is_pinned">Angeheftet</Label>
                  <p className="text-sm text-muted-foreground">
                    Artikel oben in der Liste anzeigen
                  </p>
                </div>
              </div>
              <Switch
                id="is_pinned"
                checked={formData.is_pinned}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_pinned: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="published">Veröffentlichen</Label>
                <p className="text-sm text-muted-foreground">
                  Artikel sofort auf der Website anzeigen
                </p>
              </div>
              <Switch
                id="published"
                checked={formData.status === 'published'}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, status: checked ? 'published' : 'draft' })
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
