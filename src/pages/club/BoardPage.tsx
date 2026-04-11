import { MainLayout } from '@/components/layout/MainLayout';
import { useTranslation } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useBoardMembers } from '@/hooks/useBoardMembers';
import { useContentWithFallback } from '@/hooks/usePageContent';

export default function BoardPage() {
  const t = useTranslation();
  const { data: boardMembers, isLoading } = useBoardMembers();
  const intro = useContentWithFallback('board', 'intro');

  return (
    <MainLayout>
      {/* Header */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container">
          <h1 className="mb-2 text-4xl font-black uppercase md:text-5xl">
            {t.nav.board}
          </h1>
          <p className="text-lg text-primary-foreground/80">
            {intro.subtitle || 'Vorstand'}
          </p>
        </div>
      </section>

      {intro.content && (
        <section className="py-10">
          <div className="container">
            <div
              className="mx-auto max-w-3xl prose prose-lg dark:prose-invert text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: intro.content.replace(/\n/g, '<br />') }}
            />
          </div>
        </section>
      )}

      {/* Board Members */}
      <section className="py-16">
        <div className="container">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <Card key={item} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="space-y-3 p-6">
                    <Skeleton className="h-6 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : boardMembers && boardMembers.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {boardMembers.map((member) => (
                <Card key={member.id} className="overflow-hidden">
                  <div className="flex h-48 items-center justify-center bg-muted">
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="space-y-3 p-6 text-center">
                    <div>
                      <h3 className="text-xl font-semibold">{member.name}</h3>
                      <p className="text-primary">{member.role}</p>
                    </div>
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <Mail className="h-4 w-4" />
                        {member.email}
                      </a>
                    )}
                    {member.phone && (
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {member.phone}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center text-muted-foreground">
                <Users className="h-10 w-10" />
                <p>Noch keine Vorstandsmitglieder hinterlegt.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
