import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Newspaper,
  CalendarDays,
  Users,
  Download,
  Image,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
} from 'lucide-react';

// Mock data for dashboard
const stats = [
  { label: 'Events', value: 12, icon: Trophy, href: '/admin/events', change: '+2' },
  { label: 'News-Artikel', value: 24, icon: Newspaper, href: '/admin/news', change: '+5' },
  { label: 'Termine', value: 18, icon: CalendarDays, href: '/admin/calendar', change: '+3' },
  { label: 'Sponsoren', value: 8, icon: Users, href: '/admin/sponsors', change: '0' },
];

const recentNews = [
  { id: 1, title: 'Vorbereitung für das 12. Oberlausitzer Dreieck läuft', date: '2024-01-15', status: 'published' },
  { id: 2, title: 'Neue Trainingszeiten für Motocross-Strecke', date: '2024-01-10', status: 'published' },
  { id: 3, title: 'Jahreshauptversammlung 2024 - Einladung', date: '2024-01-05', status: 'draft' },
];

const upcomingEvents = [
  { id: 1, title: 'Org-Team Sitzung', date: '2024-02-15', type: 'meeting' },
  { id: 2, title: '12. Oberlausitzer Dreieck', date: '2024-09-12', type: 'event' },
  { id: 3, title: 'Motocross Training', date: '2024-02-20', type: 'training' },
];

export default function DashboardPage() {
  const { user } = useAuth();

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change !== '0' && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stat.change}
                  </Badge>
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
            <div className="space-y-4">
              {recentNews.map((article) => (
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
                      <span className="text-xs text-muted-foreground">{article.date}</span>
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
                      <span className="text-xs text-muted-foreground">{event.date}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {event.type}
                      </Badge>
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

      {/* Info Banner */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Demo-Modus</p>
              <p className="text-sm text-muted-foreground">
                Dies ist ein statisches Admin-Interface. Änderungen werden nicht gespeichert.
                Für eine vollständige Lösung mit Datenpersistenz aktivieren Sie Lovable Cloud.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
