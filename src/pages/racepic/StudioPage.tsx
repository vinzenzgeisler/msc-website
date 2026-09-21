import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { fetchMyProfile, type PhotographerProfile } from '@/integrations/racepic/client';
import { isPhotographerSignedIn } from '@/integrations/racepic/session';
import StudioUploadPanel from './StudioUploadPanel';

/**
 * Fotografen-Dashboard (Paket 2b: Profil, Paket 3b: Upload), siehe
 * docs/memory-bank/racepic-progress.md. Bilduebersicht/Verwalten einzelner Bilder folgt spaeter.
 */
export default function StudioPage() {
  const [profile, setProfile] = useState<PhotographerProfile | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPhotographerSignedIn()) {
      setLoading(false);
      return;
    }
    fetchMyProfile()
      .then((result) => setProfile(result.photographer))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (!isPhotographerSignedIn()) {
    return <Navigate to="/racepic/studio/login" replace />;
  }

  return (
    <MainLayout title="RacePic Studio" noindex>
      <section className="container max-w-3xl py-16">
        <h1 className="font-heading text-3xl font-black uppercase tracking-tight">RacePic Studio</h1>
        {loading && <Loader2 className="mt-8 h-8 w-8 animate-spin text-accent" />}
        {!loading && error && <p className="mt-4 text-destructive">Profil konnte nicht geladen werden.</p>}
        {!loading && profile && (
          <>
            <div className="mt-6 rounded-2xl border bg-card p-6">
              <p className="text-lg font-semibold">{profile.displayName}</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <p className="mt-4 text-sm text-muted-foreground">Status: {profile.status}</p>
            </div>
            <div className="mt-8 rounded-2xl border bg-card p-6">
              <h2 className="font-heading text-xl font-bold uppercase tracking-tight">Bilder hochladen</h2>
              <div className="mt-4">
                <StudioUploadPanel />
              </div>
            </div>
          </>
        )}
      </section>
    </MainLayout>
  );
}
