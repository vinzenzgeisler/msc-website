import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings, useUpdateSettings, SettingsData } from '@/hooks/useSettings';
import { Shield, Globe, Bell, Database, Save, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getPocketBaseErrorMessage } from '@/lib/pocketbase-errors';
import { MediaAssetPicker } from '@/components/admin/MediaAssetPicker';

export default function SettingsAdminPage() {
  const { hasPermission } = useAuth();
  const { data: settings, isLoading, error } = useSettings();
  const updateSettings = useUpdateSettings();
  
  const [formData, setFormData] = useState<Partial<SettingsData>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [defaultOgImageFile, setDefaultOgImageFile] = useState<File | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (key: keyof SettingsData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        ...formData,
        logo_file: logoFile,
        default_og_image_file: defaultOgImageFile,
      });
      toast.success('Einstellungen gespeichert');
      setLogoFile(null);
      setDefaultOgImageFile(null);
      setHasChanges(false);
    } catch (err) {
      toast.error(getPocketBaseErrorMessage(err, 'Fehler beim Speichern der Einstellungen'));
    }
  };

  if (!hasPermission('admin')) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Zugriff verweigert</h2>
            <p className="text-muted-foreground">
              Sie benötigen Administratorrechte für die Einstellungen.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Einstellungen nicht verfügbar</h2>
            <p className="text-muted-foreground mb-4">
              Die Einstellungs-Tabelle muss noch erstellt werden.
            </p>
            <p className="text-sm text-muted-foreground">
              Bitte prüfen Sie die PocketBase-Migrationen und die Backend-Verbindung.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Einstellungen</h1>
          <p className="text-muted-foreground">Konfigurieren Sie die Website-Einstellungen</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
          <TabsTrigger value="advanced">Erweitert</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Website-Informationen
                </CardTitle>
                <CardDescription>
                  Grundlegende Informationen über Ihren Verein
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Vereinsname</Label>
                    <Input 
                      id="siteName" 
                      value={formData.site_name || ''} 
                      onChange={(e) => handleChange('site_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteShort">Kurzname</Label>
                    <Input 
                      id="siteShort" 
                      value={formData.site_short_name || ''} 
                      onChange={(e) => handleChange('site_short_name', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Vereinsbeschreibung</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="foundingYear">Gründungsjahr</Label>
                    <Input
                      id="foundingYear"
                      type="number"
                      value={formData.founding_year || ''}
                      onChange={(e) => handleChange('founding_year', Number(e.target.value) || 0)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memberCount">Mitgliederzahl</Label>
                    <Input
                      id="memberCount"
                      value={formData.member_count || ''}
                      onChange={(e) => handleChange('member_count', e.target.value)}
                      placeholder="z. B. 150+"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sectionCount">Sektionszahl</Label>
                    <Input
                      id="sectionCount"
                      value={formData.section_count || ''}
                      onChange={(e) => handleChange('section_count', e.target.value)}
                      placeholder="z. B. 3"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="memberCountLabel">Label Mitglieder-Box</Label>
                    <Input
                      id="memberCountLabel"
                      value={formData.member_count_label || ''}
                      onChange={(e) => handleChange('member_count_label', e.target.value)}
                      placeholder="Mitglieder"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="traditionYearsLabel">Label Traditions-Box</Label>
                    <Input
                      id="traditionYearsLabel"
                      value={formData.tradition_years_label || ''}
                      onChange={(e) => handleChange('tradition_years_label', e.target.value)}
                      placeholder="Jahre Tradition"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sectionCountLabel">Label Sektions-Box</Label>
                    <Input
                      id="sectionCountLabel"
                      value={formData.section_count_label || ''}
                      onChange={(e) => handleChange('section_count_label', e.target.value)}
                      placeholder="Zuschauer"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo</Label>
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setLogoFile(e.target.files?.[0] || null);
                        setHasChanges(true);
                      }}
                    />
                    <MediaAssetPicker
                      onSelect={(file, altText) => {
                        setLogoFile(file);
                        if (!(formData.logo_alt || '').trim() && altText) {
                          setFormData((prev) => ({ ...prev, logo_alt: altText }));
                        }
                        setHasChanges(true);
                      }}
                    />
                    {(logoFile || formData.logo_url) && (
                      <div className="space-y-2">
                        {logoFile ? (
                          <p className="text-sm text-muted-foreground">{logoFile.name}</p>
                        ) : formData.logo_url ? (
                          <img src={formData.logo_url} alt={formData.logo_alt || 'Logo'} className="h-16 rounded border object-contain p-2 bg-muted/20" />
                        ) : null}
                        <Input
                          value={formData.logo_alt || ''}
                          onChange={(e) => handleChange('logo_alt', e.target.value)}
                          placeholder="Alternativtext für das Logo"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Kontakt-E-Mail</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.contact_email || ''} 
                      onChange={(e) => handleChange('contact_email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input 
                      id="phone" 
                      value={formData.contact_phone || ''} 
                      onChange={(e) => handleChange('contact_phone', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Textarea
                    id="address"
                    rows={2}
                    value={formData.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
                <CardDescription>Verknüpfungen zu sozialen Netzwerken</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input 
                      id="facebook" 
                      placeholder="https://facebook.com/..." 
                      value={formData.facebook_url || ''}
                      onChange={(e) => handleChange('facebook_url', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input 
                      id="instagram" 
                      placeholder="https://instagram.com/..." 
                      value={formData.instagram_url || ''}
                      onChange={(e) => handleChange('instagram_url', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kontakt & Karte</CardTitle>
                <CardDescription>Angaben für Kontaktseite und Sponsoren-CTA</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactMapEmbedUrl">Karten-Embed-URL</Label>
                    <Input
                      id="contactMapEmbedUrl"
                      placeholder="https://www.google.com/maps/embed?..."
                      value={formData.contact_map_embed_url || ''}
                      onChange={(e) => handleChange('contact_map_embed_url', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactMapLink">Karten-Link</Label>
                    <Input
                      id="contactMapLink"
                      placeholder="https://maps.google.com/?q=..."
                      value={formData.contact_map_link || ''}
                      onChange={(e) => handleChange('contact_map_link', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactMapLabel">Karten-Beschriftung</Label>
                    <Input
                      id="contactMapLabel"
                      placeholder="z. B. Vereinsgelände in Oybin"
                      value={formData.contact_map_label || ''}
                      onChange={(e) => handleChange('contact_map_label', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sponsoringEmail">Sponsoring-E-Mail</Label>
                    <Input
                      id="sponsoringEmail"
                      type="email"
                      placeholder="sponsoring@..."
                      value={formData.sponsoring_email || ''}
                      onChange={(e) => handleChange('sponsoring_email', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO-Einstellungen</CardTitle>
              <CardDescription>Suchmaschinenoptimierung für bessere Auffindbarkeit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta-Titel</Label>
                <Input
                  id="metaTitle"
                  value={formData.meta_title || ''}
                  onChange={(e) => handleChange('meta_title', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Max. 60 Zeichen empfohlen</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta-Beschreibung</Label>
                <Textarea
                  id="metaDescription"
                  rows={3}
                  value={formData.meta_description || ''}
                  onChange={(e) => handleChange('meta_description', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Max. 160 Zeichen empfohlen</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultOgImage">Standard-OG-Bild</Label>
                <Input
                  id="defaultOgImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    setDefaultOgImageFile(e.target.files?.[0] || null);
                    setHasChanges(true);
                  }}
                />
                <MediaAssetPicker
                  onSelect={(file) => {
                    setDefaultOgImageFile(file);
                    setHasChanges(true);
                  }}
                />
                {defaultOgImageFile ? (
                  <p className="text-sm text-muted-foreground">{defaultOgImageFile.name}</p>
                ) : formData.default_og_image_url ? (
                  <img src={formData.default_og_image_url} alt="OG Preview" className="h-24 rounded border object-cover" />
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={formData.meta_keywords || ''}
                  onChange={(e) => handleChange('meta_keywords', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Benachrichtigungen
              </CardTitle>
              <CardDescription>E-Mail-Benachrichtigungen konfigurieren</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Kontaktformular-Eingänge</p>
                  <p className="text-sm text-muted-foreground">
                    E-Mail bei neuen Kontaktanfragen
                  </p>
                </div>
                <Switch 
                  checked={formData.notifications_contact || false}
                  onCheckedChange={(checked) => handleChange('notifications_contact', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Neue Registrierungen</p>
                  <p className="text-sm text-muted-foreground">
                    E-Mail bei neuen Benutzerregistrierungen
                  </p>
                </div>
                <Switch 
                  checked={formData.notifications_registration || false}
                  onCheckedChange={(checked) => handleChange('notifications_registration', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Wöchentliche Zusammenfassung</p>
                  <p className="text-sm text-muted-foreground">
                    Übersicht über Website-Aktivitäten
                  </p>
                </div>
                <Switch 
                  checked={formData.notifications_weekly || false}
                  onCheckedChange={(checked) => handleChange('notifications_weekly', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Datenverwaltung
                </CardTitle>
                <CardDescription>Erweiterte Optionen für die Datenverwaltung</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Cache leeren</p>
                    <p className="text-sm text-muted-foreground">
                      Löscht zwischengespeicherte Daten
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => {
                    window.location.reload();
                    toast.success('Cache geleert');
                  }}>
                    Cache leeren
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Daten exportieren</p>
                    <p className="text-sm text-muted-foreground">
                      Alle Inhalte als JSON exportieren
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => {
                    toast.info('Export-Funktion kommt bald');
                  }}>
                    Exportieren
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-600" />
                  Backend-Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Das CMS ist mit PocketBase verbunden. Alle Änderungen werden dauerhaft gespeichert.
                </p>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Datenbankverbindung aktiv
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Authentifizierung aktiv
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Echtzeit-Synchronisation
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateSettings.isPending || !hasChanges}>
          {updateSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Speichern
        </Button>
      </div>
    </div>
  );
}
