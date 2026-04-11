import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useBoardMembers } from '@/hooks/useBoardMembers';
import { useContentWithFallback } from '@/hooks/usePageContent';

export default function BoardPage() {
  const t = useTranslation();
  const { data: boardMembers, isLoading } = useBoardMembers();
  const intro = useContentWithFallback('board', 'intro', {
    title: t.nav.board,
    subtitle: 'Unser Vorstandsteam',
  });

  return (
    <MainLayout>
      <PageHeader title={intro.title} subtitle={intro.subtitle || 'Unser Vorstandsteam'} imageUrl={intro.image_url} imageAlt={intro.image_alt || intro.title} />

      {intro.content && (
        <section className="py-10">
          <div className="container">
            <div className="mx-auto max-w-3xl prose prose-lg dark:prose-invert text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: intro.content.replace(/\n/g, '<br />') }} />
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="container">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <Card key={item} className="overflow-hidden">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <CardContent className="space-y-3 p-6"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-4 w-1/2" /></CardContent>
                </Card>
              ))}
            </div>
          ) : boardMembers && boardMembers.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {boardMembers.map((member) => (
                <Card key={member.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.name}
                        className="h-full w-full object-cover object-top transition-transform duration-300 hover:scale-105" loading="lazy" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="flex h-24 w-24 items-center justify-center bg-primary text-3xl font-bold text-primary-foreground">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="space-y-3 p-6 text-center">
                    <div>
                      <h3 className="text-xl font-semibold">{member.name}</h3>
                      <p className="text-sm font-medium text-primary">{member.role}</p>
                    </div>
                    {member.email && (
                      <a href={`mailto:${member.email}`}
                        className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <Mail className="h-4 w-4" />{member.email}
                      </a>
                    )}
                    {member.phone && (
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />{member.phone}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
                <Users className="h-12 w-12" />
                <p className="text-lg font-medium">Noch keine Vorstandsmitglieder hinterlegt.</p>
                <p className="text-sm">Der Vorstand kann im Admin-Bereich gepflegt werden.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
