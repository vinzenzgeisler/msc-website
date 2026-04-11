import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useContentWithFallback } from '@/hooks/usePageContent';
import { usePartnerClubs } from '@/hooks/useStructuredContent';

export default function PartnerClubsPage() {
  const t = useTranslation();
  const { data: clubs } = usePartnerClubs();
  const intro = useContentWithFallback('partner_clubs', 'intro', {
    title: t.nav.partnerClubs,
    subtitle: 'Gemeinsam für den Motorsport in der Region',
    content: '',
  });

  return (
    <MainLayout>
      <PageHeader title={intro.title} subtitle={intro.subtitle || undefined} imageUrl={intro.image_url} imageAlt={intro.image_alt || intro.title} />

      <section className="py-16">
        <div className="container">
          {intro.content ? (
            <div className="mb-8">
              <Card>
                <CardContent className="prose prose-slate dark:prose-invert max-w-none p-8 text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: intro.content.replace(/\n/g, '<br />') }} />
              </Card>
            </div>
          ) : null}

          {clubs && clubs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {clubs.map((club) => (
                <Card key={club.id}>
                  <CardContent className="space-y-4 p-6">
                    {club.logo_url ? (
                      <img src={club.logo_url} alt={club.name} className="h-20 w-full object-contain" />
                    ) : (
                      <div className="flex h-20 items-center justify-center bg-muted"><Users className="h-8 w-8 text-muted-foreground" /></div>
                    )}
                    <div>
                      <h2 className="text-xl font-semibold">{club.name}</h2>
                      {club.location ? <p className="text-sm text-muted-foreground">{club.location}</p> : null}
                    </div>
                    {club.description ? <p className="text-sm text-muted-foreground">{club.description}</p> : null}
                    {club.website ? <a href={club.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">Website ansehen</a> : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center text-muted-foreground">
                <Users className="h-10 w-10" />
                <p className="font-medium">Noch keine Partnervereine hinterlegt.</p>
                <p className="text-sm">Partnervereine können im Admin-Bereich gepflegt werden.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
