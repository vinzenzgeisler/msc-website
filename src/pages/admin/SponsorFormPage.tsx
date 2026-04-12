import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Save, FileText, Globe, Image } from 'lucide-react';
import { useSponsor, useCreateSponsor, useUpdateSponsor } from '@/hooks/useSponsors';
import { toast } from 'sonner';
import { getPocketBaseErrorMessage } from '@/lib/pocketbase-errors';
import { MediaAssetPicker } from '@/components/admin/MediaAssetPicker';

const tiers = [
  { value: 'main', label: 'Hauptsponsor' },
  { value: 'partner', label: 'Partner' },
  { value: 'supporter', label: 'Unterstützer' },
];

export default function SponsorFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';

  const { data: existingSponsor, isLoading: isLoadingSponsor } = useSponsor(isEditing ? id : '');
  const createSponsor = useCreateSponsor();
  const updateSponsor = useUpdateSponsor();

  const [formData, setFormData] = useState({
    name: '',
    website: '',
    tier: 'supporter' as 'main' | 'partner' | 'supporter',
    active: true,
    sort_order: 0,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const updateField = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  useEffect(() => {
    if (existingSponsor) {
      setFormData({
        name: existingSponsor.name || '',
        website: existingSponsor.website || '',
        tier: existingSponsor.tier || 'supporter',
        active: existingSponsor.active ?? true,
        sort_order: existingSponsor.sort_order || 0,
      });
      setIsDirty(false);
    }
  }, [existingSponsor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Bitte geben Sie einen Namen ein');
      return;
    }

    try {
      const sponsorData = {
        name: formData.name,
        logo_url: null as string | null,
        website: formData.website || null,
        tier: formData.tier,
        active: formData.active,
        sort_order: formData.sort_order,
        logoFile,
      };

      if (isEditing) {
        await updateSponsor.mutateAsync({ id, ...sponsorData });
        toast.success('Sponsor aktualisiert');
      } else {
        await createSponsor.mutateAsync(sponsorData);
        toast.success('Sponsor erstellt');
      }
      setIsDirty(false);
      navigate('/admin/sponsors');
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Fehler beim Speichern'));
      console.error(error);
    }
  };

  const isSubmitting = createSponsor.isPending || updateSponsor.isPending;

  if (isEditing && isLoadingSponsor) {
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
          <Link to="/admin/sponsors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Sponsor bearbeiten' : 'Neuer Sponsor'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isEditing ? 'Bearbeiten Sie die Sponsordaten' : 'Fügen Sie einen neuen Sponsor hinzu'}
          </p>
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
        {/* Left column */}
        <div className="space-y-6">
          {/* Basic info */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Sponsordaten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Firmenname"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" />
                  Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://www.beispiel.de"
                />
              </div>
            </CardContent>
          </Card>

          {/* Logo */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Image className="h-4 w-4 text-muted-foreground" />
                Logo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                id="logo_file"
                type="file"
                accept="image/*"
                onChange={(e) => { setLogoFile(e.target.files?.[0] || null); setIsDirty(true); }}
              />
              <MediaAssetPicker onSelect={(file) => { setLogoFile(file); setIsDirty(true); }} />
              {(logoFile || existingSponsor?.logo_url) && (
                <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                  {logoFile ? (
                    <p className="text-sm text-muted-foreground">{logoFile.name}</p>
                  ) : (
                    <img
                      src={existingSponsor?.logo_url || ''}
                      alt="Logo Vorschau"
                      className="max-h-20 object-contain"
                    />
                  )}
                </div>
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
                  <Label htmlFor="active" className="font-medium">Aktiv</Label>
                  <p className="text-xs text-muted-foreground">Auf der Website sichtbar</p>
                </div>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => updateField('active', checked)}
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
              <CardTitle className="text-base">Kategorie</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.tier}
                onValueChange={(value: 'main' | 'partner' | 'supporter') => updateField('tier', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {tiers.map((tier) => (
                    <SelectItem key={tier.value} value={tier.value}>
                      {tier.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Sort order */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Reihenfolge</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => updateField('sort_order', parseInt(e.target.value) || 0)}
                min={0}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Kleinere Zahlen werden zuerst angezeigt
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
