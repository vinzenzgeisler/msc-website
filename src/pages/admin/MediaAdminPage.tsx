import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, FolderOpen, Image, Upload, Trash2, MoreHorizontal, Grid, List } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Mock data
const mockAlbums = [
  { id: 1, title: '11. Oberlausitzer Dreieck 2025', imageCount: 48, cover: '/placeholder.svg', year: 2025 },
  { id: 2, title: '10. Oberlausitzer Dreieck 2024', imageCount: 52, cover: '/placeholder.svg', year: 2024 },
  { id: 3, title: 'Motocross Training 2024', imageCount: 24, cover: '/placeholder.svg', year: 2024 },
  { id: 4, title: 'Vereinsfeier 2023', imageCount: 36, cover: '/placeholder.svg', year: 2023 },
  { id: 5, title: 'Trial-Meisterschaft 2023', imageCount: 18, cover: '/placeholder.svg', year: 2023 },
];

const mockImages = [
  { id: 1, filename: 'start-2025-01.jpg', size: '2.4 MB', dimensions: '1920x1080', album: '11. Oberlausitzer Dreieck 2025' },
  { id: 2, filename: 'seitenwagen-action.jpg', size: '1.8 MB', dimensions: '1920x1280', album: '11. Oberlausitzer Dreieck 2025' },
  { id: 3, filename: 'zuschauer-tribüne.jpg', size: '3.1 MB', dimensions: '2560x1440', album: '11. Oberlausitzer Dreieck 2025' },
  { id: 4, filename: 'siegerehrung.jpg', size: '2.0 MB', dimensions: '1920x1080', album: '11. Oberlausitzer Dreieck 2025' },
  { id: 5, filename: 'fahrerlager-panorama.jpg', size: '4.2 MB', dimensions: '3840x2160', album: null },
  { id: 6, filename: 'logo-msc.png', size: '120 KB', dimensions: '800x800', album: null },
];

export default function MediaAdminPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Medien</h1>
          <p className="text-muted-foreground">Verwalten Sie Bilder und Galerien</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FolderOpen className="mr-2 h-4 w-4" />
            Neues Album
          </Button>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Hochladen
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockAlbums.length}</p>
                <p className="text-sm text-muted-foreground">Alben</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/50 flex items-center justify-center">
                <Image className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockAlbums.reduce((sum, a) => sum + a.imageCount, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Bilder in Alben</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                <Image className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockImages.length}</p>
                <p className="text-sm text-muted-foreground">Dateien gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="albums" className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <TabsList>
            <TabsTrigger value="albums">Alben</TabsTrigger>
            <TabsTrigger value="all">Alle Dateien</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="albums">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {mockAlbums.map((album) => (
              <Card key={album.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                <div className="aspect-video bg-muted relative">
                  <img
                    src={album.cover}
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2">
                    {album.imageCount} Bilder
                  </Badge>
                </div>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium line-clamp-1">{album.title}</h3>
                      <p className="text-sm text-muted-foreground">{album.year}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add Album Card */}
            <Card className="overflow-hidden border-dashed hover:border-primary/50 transition-colors cursor-pointer">
              <div className="aspect-video bg-muted/50 flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                <Plus className="h-8 w-8 mb-2" />
                <span className="text-sm font-medium">Neues Album</span>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Alle Dateien</CardTitle>
              <CardDescription>Alle hochgeladenen Medien</CardDescription>
            </CardHeader>
            <CardContent>
              {viewMode === 'grid' ? (
                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                  {mockImages.map((image) => (
                    <div key={image.id} className="group relative">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        <img
                          src="/placeholder.svg"
                          alt={image.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Button variant="secondary" size="sm">
                          Auswählen
                        </Button>
                      </div>
                      <p className="mt-1 text-xs truncate">{image.filename}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {mockImages.map((image) => (
                    <div
                      key={image.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                        <img
                          src="/placeholder.svg"
                          alt={image.filename}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{image.filename}</p>
                        <p className="text-sm text-muted-foreground">
                          {image.dimensions} • {image.size}
                        </p>
                      </div>
                      {image.album && (
                        <Badge variant="outline" className="hidden sm:flex">
                          {image.album}
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Details</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Löschen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
