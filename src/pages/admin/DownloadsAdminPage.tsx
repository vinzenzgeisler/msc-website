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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Download, FileText, FileImage, File } from 'lucide-react';

const fileTypeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  pdf: { label: 'PDF', icon: FileText, color: 'text-red-500' },
  image: { label: 'Bild', icon: FileImage, color: 'text-blue-500' },
  other: { label: 'Datei', icon: File, color: 'text-gray-500' },
};

// Mock data
const mockDownloads = [
  { id: 1, title: 'Programmheft 2026', filename: 'programmheft-2026.pdf', type: 'pdf', size: '2.4 MB', downloads: 156, year: 2026 },
  { id: 2, title: 'Ausschreibung 2026', filename: 'ausschreibung-2026.pdf', type: 'pdf', size: '1.2 MB', downloads: 89, year: 2026 },
  { id: 3, title: 'Streckenplan', filename: 'streckenplan.pdf', type: 'pdf', size: '850 KB', downloads: 234, year: null },
  { id: 4, title: 'Anmeldeformular', filename: 'anmeldung.pdf', type: 'pdf', size: '120 KB', downloads: 312, year: null },
  { id: 5, title: 'Programmheft 2025', filename: 'programmheft-2025.pdf', type: 'pdf', size: '2.1 MB', downloads: 445, year: 2025 },
  { id: 6, title: 'Ergebnisliste 2025', filename: 'ergebnisse-2025.pdf', type: 'pdf', size: '340 KB', downloads: 178, year: 2025 },
];

export default function DownloadsAdminPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDownloads = mockDownloads.filter((download) =>
    download.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    download.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDownloads = mockDownloads.reduce((sum, d) => sum + d.downloads, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Downloads</h1>
          <p className="text-muted-foreground">Verwalten Sie alle Download-Dateien</p>
        </div>
        <Button asChild>
          <Link to="/admin/downloads/new">
            <Plus className="mr-2 h-4 w-4" />
            Neue Datei
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockDownloads.length}</p>
                <p className="text-sm text-muted-foreground">Dateien</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/50 flex items-center justify-center">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalDownloads}</p>
                <p className="text-sm text-muted-foreground">Downloads gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockDownloads.filter(d => d.type === 'pdf').length}
                </p>
                <p className="text-sm text-muted-foreground">PDF-Dokumente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Datei suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Dateien</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titel</TableHead>
                <TableHead>Dateiname</TableHead>
                <TableHead>Typ</TableHead>
                <TableHead>Größe</TableHead>
                <TableHead>Jahr</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDownloads.map((download) => {
                const fileType = fileTypeConfig[download.type] || fileTypeConfig.other;
                const Icon = fileType.icon;
                return (
                  <TableRow key={download.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${fileType.color}`} />
                        {download.title}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {download.filename}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{fileType.label}</Badge>
                    </TableCell>
                    <TableCell>{download.size}</TableCell>
                    <TableCell>
                      {download.year ? (
                        <Badge variant="secondary">{download.year}</Badge>
                      ) : (
                        <span className="text-muted-foreground">–</span>
                      )}
                    </TableCell>
                    <TableCell>{download.downloads}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Herunterladen
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/downloads/${download.id}`}>
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
