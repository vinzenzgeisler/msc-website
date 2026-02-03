import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye, Calendar, MapPin } from 'lucide-react';

// Mock data
const mockEvents = [
  {
    id: 1,
    title: '12. Oberlausitzer Dreieck',
    year: 2026,
    date: '12./13. September 2026',
    location: 'Saalendorf - Jonsdorf - Waltersdorf',
    status: 'upcoming',
    participants: 120,
  },
  {
    id: 2,
    title: '11. Oberlausitzer Dreieck',
    year: 2025,
    date: '13./14. September 2025',
    location: 'Saalendorf - Jonsdorf - Waltersdorf',
    status: 'completed',
    participants: 115,
  },
  {
    id: 3,
    title: '10. Oberlausitzer Dreieck',
    year: 2024,
    date: '07./08. September 2024',
    location: 'Saalendorf - Jonsdorf - Waltersdorf',
    status: 'completed',
    participants: 108,
  },
  {
    id: 4,
    title: '9. Oberlausitzer Dreieck',
    year: 2023,
    date: '09./10. September 2023',
    location: 'Saalendorf - Jonsdorf - Waltersdorf',
    status: 'completed',
    participants: 95,
  },
];

export default function EventsAdminPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = mockEvents.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.year.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Veranstaltungen</h1>
          <p className="text-muted-foreground">Verwalten Sie die Hauptveranstaltung und vergangene Events</p>
        </div>
        <Button asChild>
          <Link to="/admin/events/new">
            <Plus className="mr-2 h-4 w-4" />
            Neue Veranstaltung
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Veranstaltung suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockEvents.length}</p>
                <p className="text-sm text-muted-foreground">Veranstaltungen</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/50 flex items-center justify-center">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">5,9 km</p>
                <p className="text-sm text-muted-foreground">Streckenlänge</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockEvents.reduce((sum, e) => sum + e.participants, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Teilnehmer gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Veranstaltungen</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Veranstaltung</TableHead>
                <TableHead>Jahr</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Teilnehmer</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{event.year}</TableCell>
                  <TableCell>{event.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={event.status === 'upcoming' ? 'default' : 'secondary'}
                    >
                      {event.status === 'upcoming' ? 'Bevorstehend' : 'Abgeschlossen'}
                    </Badge>
                  </TableCell>
                  <TableCell>{event.participants}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to="/event" target="_blank">
                            <Eye className="mr-2 h-4 w-4" />
                            Vorschau
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/events/${event.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
