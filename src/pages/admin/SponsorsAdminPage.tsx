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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, ExternalLink, Image } from 'lucide-react';

const tierConfig: Record<string, { label: string; color: string }> = {
  main: { label: 'Hauptsponsor', color: 'bg-yellow-500' },
  partner: { label: 'Partner', color: 'bg-blue-500' },
  supporter: { label: 'Unterstützer', color: 'bg-gray-500' },
};

// Mock data
const mockSponsors = [
  { id: 1, name: 'Havlat', tier: 'main', website: 'https://havlat.de', hasLogo: true, active: true },
  { id: 2, name: 'DEKRA', tier: 'main', website: 'https://dekra.de', hasLogo: true, active: true },
  { id: 3, name: 'Bergquell Brauerei', tier: 'partner', website: 'https://bergquell.de', hasLogo: true, active: true },
  { id: 4, name: 'Auto-Fit', tier: 'partner', website: 'https://autofit.de', hasLogo: true, active: true },
  { id: 5, name: 'Kummer', tier: 'partner', website: 'https://kummer.de', hasLogo: true, active: true },
  { id: 6, name: 'Auto Jahn', tier: 'supporter', website: 'https://autojahn.de', hasLogo: false, active: true },
  { id: 7, name: 'Sparkasse Oberlausitz', tier: 'supporter', website: 'https://sparkasse.de', hasLogo: true, active: false },
];

export default function SponsorsAdminPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSponsors = mockSponsors.filter((sponsor) =>
    sponsor.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sponsoren</h1>
          <p className="text-muted-foreground">Verwalten Sie alle Sponsoren und Partner</p>
        </div>
        <Button asChild>
          <Link to="/admin/sponsors/new">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Sponsor
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Object.entries(tierConfig).map(([key, config]) => (
          <Card key={key}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-12 rounded-full ${config.color}`} />
                <div>
                  <p className="text-2xl font-bold">
                    {mockSponsors.filter(s => s.tier === key && s.active).length}
                  </p>
                  <p className="text-sm text-muted-foreground">{config.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Sponsor suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Sponsoren</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sponsor</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>Logo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSponsors.map((sponsor) => {
                const tier = tierConfig[sponsor.tier];
                return (
                  <TableRow key={sponsor.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${tier?.color}`} />
                        {sponsor.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{tier?.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <a
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        Link
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell>
                      {sponsor.hasLogo ? (
                        <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                          <Image className="h-3 w-3" />
                          Vorhanden
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Fehlt
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={sponsor.active ? 'default' : 'secondary'}>
                        {sponsor.active ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/sponsors/${sponsor.id}`}>
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
        </CardContent>
      </Card>
    </div>
  );
}
