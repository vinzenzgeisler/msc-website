import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { fetchLicenses, fetchMyProfile, type LicenseOption, type PhotographerProfile } from '@/integrations/racepic/client';
import { isPhotographerSignedIn } from '@/integrations/racepic/session';
import { StudioLayout } from './StudioLayout';

/**
 * Lizenz-Infoseite (Paket 15), siehe racepic-ux-redesign-plan.md. Fotograf:innen konnten den
 * Lizenzkatalog bisher nur als Auswahlfeld im Upload-Formular sehen, ohne zu wissen, was die
 * Codes eigentlich bedeuten.
 */
export default function StudioLicensesPage() {
  const [profile, setProfile] = useState<PhotographerProfile | null>(null);
  const [licenses, setLicenses] = useState<LicenseOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPhotographerSignedIn()) {
      setLoading(false);
      return;
    }
    Promise.all([fetchMyProfile(), fetchLicenses()])
      .then(([profileResult, licensesResult]) => {
        setProfile(profileResult.photographer);
        setLicenses(licensesResult.licenses);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  if (!isPhotographerSignedIn()) {
    return <Navigate to="/racepic/studio/login" replace />;
  }

  return (
    <StudioLayout profile={profile}>
      <h1 className="font-heading text-3xl font-black uppercase tracking-tight">Lizenzen</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Beim Hochladen wählst du eine dieser Lizenzen pro Batch – sie bestimmt, was Besucher:innen mit deinen Bildern machen dürfen.
      </p>

      {loading && <Loader2 className="mt-8 h-6 w-6 animate-spin text-accent" />}

      <div className="mt-6 space-y-4">
        {licenses.map((license) => (
          <div key={license.id} className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-lg font-bold uppercase tracking-tight">{license.title.de ?? license.code}</h2>
              {license.attributionRequired && <Badge variant="secondary">Namensnennung erforderlich</Badge>}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{license.summary.de ?? ''}</p>
          </div>
        ))}
      </div>
    </StudioLayout>
  );
}
