import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  fetchLicenses,
  updateMyProfile,
  setMyPassword,
  type LicenseOption,
  type PhotographerProfile,
} from '@/integrations/racepic/client';

/**
 * Profil-Formular (Paket 15), siehe racepic-ux-redesign-plan.md. `updateMyProfile` existierte
 * bereits als API-Client-Funktion, wurde bisher aber in keiner UI verwendet.
 */
export function StudioProfilePanel({ profile, onSaved }: { profile: PhotographerProfile; onSaved: (updated: PhotographerProfile) => void }) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [copyrightLine, setCopyrightLine] = useState(profile.copyrightLine ?? '');
  const [website, setWebsite] = useState(profile.website ?? '');
  const [instagram, setInstagram] = useState(profile.social.instagram ?? '');
  const [facebook, setFacebook] = useState(profile.social.facebook ?? '');
  const [defaultLicenseId, setDefaultLicenseId] = useState(profile.defaultLicenseId ?? '');
  const [licenses, setLicenses] = useState<LicenseOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    fetchLicenses()
      .then((result) => setLicenses(result.licenses.filter((license) => license.pricingKind === 'FREE')))
      .catch(() => setLicenses([]));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const social: Record<string, string> = {};
      if (instagram.trim()) social.instagram = instagram.trim();
      if (facebook.trim()) social.facebook = facebook.trim();
      const result = await updateMyProfile({
        displayName,
        copyrightLine: copyrightLine.trim() || null,
        website: website.trim() || null,
        social,
        defaultLicenseId: defaultLicenseId || null,
      });
      onSaved(result.photographer);
      setSaved(true);
    } catch {
      setError('Profil konnte nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-card p-6">
        <div>
          <Label htmlFor="profile-name">Anzeigename</Label>
          <Input id="profile-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="profile-copyright">Copyright-Zeile</Label>
          <Input
            id="profile-copyright"
            value={copyrightLine}
            onChange={(e) => setCopyrightLine(e.target.value)}
            placeholder="© Max Mustermann"
          />
        </div>
        <div>
          <Label htmlFor="profile-website">Website</Label>
          <Input id="profile-website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="profile-instagram">Instagram</Label>
            <Input id="profile-instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/…" />
          </div>
          <div>
            <Label htmlFor="profile-facebook">Facebook</Label>
            <Input id="profile-facebook" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://facebook.com/…" />
          </div>
        </div>
        <div>
          <Label htmlFor="profile-license">Standard-Lizenz für neue Uploads</Label>
          <select
            id="profile-license"
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={defaultLicenseId}
            onChange={(e) => setDefaultLicenseId(e.target.value)}
          >
            <option value="">– keine –</option>
            {licenses.map((license) => (
              <option key={license.id} value={license.id}>
                {license.title.de ?? license.code}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">
            Mehr zu den Lizenzen: <Link to="/racepic/studio/lizenzen" className="underline hover:no-underline">Lizenz-Übersicht</Link>
          </p>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {saved && <p className="text-sm text-green-700">Gespeichert.</p>}
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Speichern'}
        </Button>
      </form>

      <form className="space-y-3 rounded-2xl border bg-card p-6" onSubmit={async (event) => {
        event.preventDefault(); setPasswordMessage('');
        try { await setMyPassword(newPassword); setNewPassword(''); setPasswordMessage('Passwort gespeichert.'); }
        catch { setPasswordMessage('Passwort konnte nicht gespeichert werden. Melde dich erneut an und versuche es innerhalb von zehn Minuten.'); }
      }}>
        <h3 className="font-heading text-lg font-bold">Anmeldung</h3>
        <p className="text-sm text-muted-foreground">Optionales Passwort für künftige Anmeldungen. E-Mail-Code bleibt verfügbar.</p>
        <Label htmlFor="studio-new-password">Neues Passwort</Label>
        <Input id="studio-new-password" type="password" minLength={12} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" required />
        <Button type="submit" variant="outline">Passwort setzen</Button>
        {passwordMessage && <p className="text-sm text-muted-foreground">{passwordMessage}</p>}
      </form>

      <div className="rounded-2xl border border-dashed bg-muted/30 p-6 opacity-70">
        <h3 className="font-heading text-lg font-bold uppercase tracking-tight">Zahlungen &amp; Auszahlung</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Kommt mit dem RacePic-Shop – dann kannst du hier dein Konto für Auszahlungen verbinden. Bis dahin ist RacePic für alle
          Beteiligten kostenlos.
        </p>
      </div>
    </div>
  );
}
