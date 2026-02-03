import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { usePosts } from '@/hooks/usePosts';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useSponsors } from '@/hooks/useSponsors';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Trophy,
  Newspaper,
  CalendarDays,
  Users,
  Image,
  Plus,
  ArrowRight,
  Clock,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: posts, isLoading: postsLoading } = usePosts();
  const { data: events, isLoading: eventsLoading } = useCalendarEvents();
  const { data: sponsors, isLoading: sponsorsLoading } = useSponsors();

  const recentPosts = posts?.slice(0, 3) || [];
  const upcomingEvents = events?.filter(e => new Date(e.start_dt) >= new Date()).slice(0, 3) || [];

  const stats = [
    { 
      label: 'News-Artikel', 
      value: posts?.length || 0, 
      icon: Newspaper, 
      href: '/admin/news',
      loading: postsLoading 
    },
    { 
      label: 'Termine', 
      value: events?.length || 0, 
      icon: CalendarDays, 
      href: '/admin/calendar',
      loading: eventsLoading 
    },
    { 
      label: 'Sponsoren', 
      value: sponsors?.filter(s => s.active).length || 0, 
      icon: Users, 
      href: '/admin/sponsors',
      loading: sponsorsLoading 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Willkommen zurück, {user?.name}!
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/admin/news/new">
              <Plus className="mr-2 h-4 w-4" />
              Neuer Artikel
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                {stat.loading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
              </div>
              <Link
                to={stat.href}
                className="mt-2 inline-flex items-center text-xs text-primary hover:underline"
              >
                Alle anzeigen
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent News */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Neueste Artikel</CardTitle>
                <CardDescription>Zuletzt bearbeitete News-Beiträge</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/news">Alle anzeigen</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-4 p-3">
                    <Skeleton className="w-10 h-10 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentPosts.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Keine Artikel vorhanden</p>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Newspaper className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{article.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(article.created_at), 'dd.MM.yyyy', { locale: de })}
                        </span>
                        <Badge
                          variant={article.status === 'published' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {article.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/admin/news/${article.id}`}>
                        Bearbeiten
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Kommende Termine</CardTitle>
                <CardDescription>Nächste anstehende Veranstaltungen</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/calendar">Alle anzeigen</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-4 p-3">
                    <Skeleton className="w-10 h-10 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">Keine anstehenden Termine</p>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded bg-accent/50 flex items-center justify-center flex-shrink-0">
                      <CalendarDays className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{event.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(event.start_dt), 'dd.MM.yyyy', { locale: de })}
                        </span>
                        {event.category && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {event.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/admin/calendar/${event.id}`}>
                        Details
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Schnellzugriff</CardTitle>
          <CardDescription>Häufig verwendete Aktionen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link to="/admin/news/new">
                <Newspaper className="h-6 w-6 mb-2" />
                <span>Neuer Artikel</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link to="/admin/calendar/new">
                <CalendarDays className="h-6 w-6 mb-2" />
                <span>Neuer Termin</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link to="/admin/sponsors/new">
                <Users className="h-6 w-6 mb-2" />
                <span>Neuer Sponsor</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col" asChild>
              <Link to="/admin/media">
                <Image className="h-6 w-6 mb-2" />
                <span>Medien verwalten</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
