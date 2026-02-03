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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';

// Mock data
const mockNews = [
  {
    id: 1,
    title: 'Vorbereitung für das 12. Oberlausitzer Dreieck läuft',
    category: 'Veranstaltung',
    status: 'published',
    author: 'Administrator',
    date: '2024-01-15',
    views: 245,
  },
  {
    id: 2,
    title: 'Neue Trainingszeiten für Motocross-Strecke',
    category: 'Verein',
    status: 'published',
    author: 'Redakteur',
    date: '2024-01-10',
    views: 128,
  },
  {
    id: 3,
    title: 'Jahreshauptversammlung 2024 - Einladung',
    category: 'Verein',
    status: 'draft',
    author: 'Administrator',
    date: '2024-01-05',
    views: 0,
  },
  {
    id: 4,
    title: 'Rückblick: Erfolgreiche Trial-Saison 2023',
    category: 'Sparten',
    status: 'published',
    author: 'Redakteur',
    date: '2023-12-20',
    views: 312,
  },
  {
    id: 5,
    title: 'Sponsoren-Partner für 2024 bestätigt',
    category: 'Partner',
    status: 'published',
    author: 'Administrator',
    date: '2023-12-15',
    views: 189,
  },
];

export default function NewsAdminPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNews = mockNews.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">News</h1>
          <p className="text-muted-foreground">Verwalten Sie alle News-Artikel</p>
        </div>
        <Button asChild>
          <Link to="/admin/news/new">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Artikel
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
                placeholder="Artikel suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                Alle ({mockNews.length})
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                Veröffentlicht ({mockNews.filter(n => n.status === 'published').length})
              </Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                Entwürfe ({mockNews.filter(n => n.status === 'draft').length})
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Artikel</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNews.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium max-w-xs truncate">
                    {article.title}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{article.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={article.status === 'published' ? 'default' : 'secondary'}
                    >
                      {article.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
                    </Badge>
                  </TableCell>
                  <TableCell>{article.author}</TableCell>
                  <TableCell>{article.date}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/news/${article.id}`} target="_blank">
                            <Eye className="mr-2 h-4 w-4" />
                            Vorschau
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/admin/news/${article.id}`}>
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

          {filteredNews.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Keine Artikel gefunden
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
