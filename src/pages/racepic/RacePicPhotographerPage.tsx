import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { fetchPhotographerProfile, toCdnUrl, type RacePicPhotographerProfile } from '@/integrations/racepic/publicClient';

/**
 * Öffentliches Fotografenprofil (Paket 12), siehe docs/memory-bank/racepic-architecture.md
 * Abschnitt H/J. Bilder verlinken bewusst auf die Event-Galerie statt auf eine einzelne
 * Teilnehmerseite: ein Bild kann mehreren Fahrern zugeordnet sein (Abschnitt C), eine eindeutige
 * "richtige" Teilnehmerseite gibt es dafür nicht. Verlinkt daher (seit dem Wegfall der
 * separaten Event-Übersichtsseite, Feedback 2026-09-22) auf die RacePic-Startseite mit
 * gesetztem Event-Filter statt auf eine eigene Event-Route.
 */
export default function RacePicPhotographerPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [profile, setProfile] = useState<RacePicPhotographerProfile | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchPhotographerProfile(slug)
      .then(setProfile)
      .catch(() => setError(true));
  }, [slug]);

  const socialEntries = profile ? Object.entries(profile.social).filter(([, value]) => value) : [];

  return (
    <MainLayout
      title={profile ? `RacePic – ${profile.displayName}` : 'RacePic'}
      description="Alle veröffentlichten Bilder dieser Fotografin bzw. dieses Fotografen bei RacePic."
      canonicalPath={`/racepic/fotografen/${slug}`}
    >
      <section className="container max-w-5xl py-16">
        <p className="text-sm text-muted-foreground">
          <Link to="/racepic" className="hover:underline">
            RacePic
          </Link>
        </p>

        {!profile && !error && <Loader2 className="mt-8 h-8 w-8 animate-spin text-accent" />}
        {error && <p className="mt-6 text-muted-foreground">Dieses Fotografenprofil wurde nicht gefunden.</p>}

        {profile && (
          <>
            <h1 className="mt-2 font-heading text-3xl font-black uppercase tracking-tight">{profile.displayName}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {profile.copyrightLine && <span>{profile.copyrightLine}</span>}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noreferrer" className="underline hover:no-underline">
                  Website
                </a>
              )}
              {socialEntries.map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noreferrer" className="underline hover:no-underline">
                  {platform}
                </a>
              ))}
            </div>

            <p className="mt-4 text-sm font-medium">{profile.imageCount} veröffentlichte(s) Bild(er)</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-3 md:grid-cols-4">
              {profile.images.map((image) => (
                <Link
                  key={image.imageId}
                  to={`/racepic?event=${image.eventSlug}`}
                  className="group overflow-hidden rounded-lg border bg-muted"
                  title={image.eventTitle}
                >
                  <img
                    src={toCdnUrl(image.thumbUrl)}
                    alt=""
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
              ))}
              {profile.images.length === 0 && <p className="text-muted-foreground">Noch keine veröffentlichten Bilder.</p>}
            </div>
          </>
        )}
      </section>
    </MainLayout>
  );
}
