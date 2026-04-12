import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    if (existingSponsor) {
      setFormData({
        name: existingSponsor.name || '',
        website: existingSponsor.website || '',
        tier: existingSponsor.tier || 'supporter',
        active: existingSponsor.active ?? true,
        sort_order: existingSponsor.sort_order || 0,
      });
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
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/sponsors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Sponsor bearbeiten' : 'Neuer Sponsor'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Bearbeiten Sie die Sponsordaten' : 'Fügen Sie einen neuen Sponsor hinzu'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Sponsordaten</CardTitle>
          <CardDescription>Füllen Sie die Pflichtfelder (*) aus</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Firmenname"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tier">Kategorie</Label>
              <Select
                value={formData.tier}
                onValueChange={(value: 'main' | 'partner' | 'supporter') =>
                  setFormData({ ...formData, tier: value })
                }
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_file">Logo</Label>
              <Input
                id="logo_file"
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              />
              <MediaAssetPicker onSelect={(file) => setLogoFile(file)} />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://www.beispiel.de"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">Reihenfolge</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                min={0}
              />
              <p className="text-xs text-muted-foreground">
                Kleinere Zahlen werden zuerst angezeigt
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="active">Aktiv</Label>
                <p className="text-sm text-muted-foreground">
                  Sponsor auf der Website anzeigen
                </p>
              </div>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
            </div>

            <div className="flex gap-4 pt-4">
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
              <Button type="button" variant="outline" onClick={() => navigate('/admin/sponsors')}>
                Abbrechen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
