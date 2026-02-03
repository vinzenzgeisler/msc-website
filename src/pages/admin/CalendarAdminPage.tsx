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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Calendar, Users, Trophy, Wrench } from 'lucide-react';

const categoryConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  verein: { label: 'Verein', color: 'bg-blue-500', icon: Users },
  veranstaltung: { label: 'Veranstaltung', color: 'bg-green-500', icon: Trophy },
  training: { label: 'Training', color: 'bg-orange-500', icon: Calendar },
  orgteam: { label: 'Org-Team', color: 'bg-purple-500', icon: Wrench },
};

// Mock data
const mockCalendarEvents = [
  { id: 1, title: 'Org-Team Sitzung', date: '2024-02-15', time: '19:00', location: 'Vereinsheim', category: 'orgteam' },
  { id: 2, title: 'Motocross Training', date: '2024-02-20', time: '14:00', location: 'MX-Strecke Saalendorf', category: 'training' },
  { id: 3, title: 'Jahreshauptversammlung', date: '2024-03-10', time: '18:00', location: 'Gasthof Waltersdorf', category: 'verein' },
  { id: 4, title: 'Streckenbegehung', date: '2024-04-05', time: '10:00', location: 'Dreiländereck-Strecke', category: 'orgteam' },
  { id: 5, title: 'Trial Training', date: '2024-04-12', time: '09:00', location: 'Trial-Gelände', category: 'training' },
  { id: 6, title: '12. Oberlausitzer Dreieck', date: '2024-09-12', time: 'ganztägig', location: 'Saalendorf-Jonsdorf-Waltersdorf', category: 'veranstaltung' },
  { id: 7, title: 'Weihnachtsfeier', date: '2024-12-14', time: '18:00', location: 'Vereinsheim', category: 'verein' },
];

export default function CalendarAdminPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredEvents = mockCalendarEvents.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Terminkalender</h1>
          <p className="text-muted-foreground">Verwalten Sie alle Vereinstermine</p>
        </div>
        <Button asChild>
          <Link to="/admin/calendar/new">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Termin
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
                placeholder="Termin suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedCategory === null ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(null)}
              >
                Alle ({mockCalendarEvents.length})
              </Badge>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <Badge
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(key)}
                >
                  {config.label} ({mockCalendarEvents.filter(e => e.category === key).length})
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Termine</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Termin</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Uhrzeit</TableHead>
                <TableHead>Ort</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.map((event) => {
                const category = categoryConfig[event.category];
                const Icon = category?.icon || Calendar;
                return (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${category?.color}`} />
                        {event.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <Icon className="h-3 w-3" />
                        {category?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{event.time}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{event.location}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/calendar/${event.id}`}>
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
                );
              })}
            </TableBody>
          </Table>

          {filteredEvents.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Keine Termine gefunden
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
