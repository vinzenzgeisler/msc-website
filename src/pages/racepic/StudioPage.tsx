import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchMyProfile, type PhotographerProfile } from '@/integrations/racepic/client';
import { isPhotographerSignedIn } from '@/integrations/racepic/session';
import { StudioLayout } from './StudioLayout';
import StudioUploadPanel from './StudioUploadPanel';
import { StudioImagesPanel } from './StudioImagesPanel';
import { StudioProfilePanel } from './StudioProfilePanel';

/**
 * Fotografen-Dashboard (Paket 2b/3b, neu strukturiert in Paket 15 - siehe
 * racepic-ux-redesign-plan.md): statt einer langen Spalte jetzt drei Bereiche als Tabs
 * (Hochladen/Meine Bilder/Profil), dazu die neue StudioLayout-Kopfzeile mit Abmelden.
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
    <StudioLayout profile={profile}>
      <h1 className="font-heading text-3xl font-black uppercase tracking-tight">RacePic Studio</h1>
      {loading && <Loader2 className="mt-8 h-8 w-8 animate-spin text-accent" />}
      {!loading && error && <p className="mt-4 text-destructive">Profil konnte nicht geladen werden.</p>}
      {!loading && profile && (
        <Tabs defaultValue="upload" className="mt-6">
          <TabsList>
            <TabsTrigger value="upload">Hochladen</TabsTrigger>
            <TabsTrigger value="images">Meine Bilder</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="pt-4">
            <StudioUploadPanel />
          </TabsContent>
          <TabsContent value="images" className="pt-4">
            <StudioImagesPanel />
          </TabsContent>
          <TabsContent value="profile" className="pt-4">
            <StudioProfilePanel profile={profile} onSaved={setProfile} />
          </TabsContent>
        </Tabs>
      )}
    </StudioLayout>
  );
}
