import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Globe, Bell, Database, Save } from 'lucide-react';

export default function SettingsAdminPage() {
  const { hasPermission } = useAuth();

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Einstellungen</h1>
        <p className="text-muted-foreground">Konfigurieren Sie die Website-Einstellungen</p>
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
                    <Input id="siteName" defaultValue="MSC Oberlausitzer Dreiländereck e.V." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteShort">Kurzname</Label>
                    <Input id="siteShort" defaultValue="MSC Dreiländereck" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Vereinsbeschreibung</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    defaultValue="Der Motorsportclub Oberlausitzer Dreiländereck e.V. organisiert seit Jahren das beliebte Oberlausitzer Dreieck, einen Demolauf durch die malerische Region im Dreiländereck."
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Kontakt-E-Mail</Label>
                    <Input id="email" type="email" defaultValue="info@msc-dreilaendereck.de" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" defaultValue="+49 123 456789" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Textarea
                    id="address"
                    rows={2}
                    defaultValue="Musterstraße 1&#10;02763 Zittau"
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
                    <Input id="facebook" placeholder="https://facebook.com/..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input id="instagram" placeholder="https://instagram.com/..." />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Speichern
              </Button>
            </div>
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
                  defaultValue="MSC Oberlausitzer Dreiländereck e.V. | Motorsport im Dreiländereck"
                />
                <p className="text-xs text-muted-foreground">Max. 60 Zeichen empfohlen</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta-Beschreibung</Label>
                <Textarea
                  id="metaDescription"
                  rows={3}
                  defaultValue="Der MSC Oberlausitzer Dreiländereck e.V. organisiert das jährliche Oberlausitzer Dreieck - einen einzigartigen Demolauf mit Motorrädern und Rennwagen."
                />
                <p className="text-xs text-muted-foreground">Max. 160 Zeichen empfohlen</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  defaultValue="Motorsport, Oberlausitz, Dreiländereck, Demolauf, Motorrad, Rennwagen"
                />
              </div>
              <div className="flex justify-end">
                <Button>
                  <Save className="mr-2 h-4 w-4" />
                  Speichern
                </Button>
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
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Neue Registrierungen</p>
                  <p className="text-sm text-muted-foreground">
                    E-Mail bei neuen Benutzerregistrierungen
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Wöchentliche Zusammenfassung</p>
                  <p className="text-sm text-muted-foreground">
                    Übersicht über Website-Aktivitäten
                  </p>
                </div>
                <Switch />
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
                  <Button variant="outline">Cache leeren</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Daten exportieren</p>
                    <p className="text-sm text-muted-foreground">
                      Alle Inhalte als JSON exportieren
                    </p>
                  </div>
                  <Button variant="outline">Exportieren</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Backend aktivieren</CardTitle>
                  <Badge>Empfohlen</Badge>
                </div>
                <CardDescription>
                  Aktivieren Sie Lovable Cloud für persistente Datenspeicherung
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Aktuell läuft das Admin-Interface im Demo-Modus. Änderungen werden nicht dauerhaft
                  gespeichert. Mit Lovable Cloud erhalten Sie:
                </p>
                <ul className="text-sm space-y-1 mb-4">
                  <li>✓ Dauerhafte Datenspeicherung</li>
                  <li>✓ Sichere Authentifizierung</li>
                  <li>✓ Datei-Upload für Medien</li>
                  <li>✓ Automatische Backups</li>
                </ul>
                <Button>Cloud aktivieren</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
