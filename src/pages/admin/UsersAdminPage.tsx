import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Shield, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const roleConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  admin: { label: 'Administrator', color: 'bg-red-500', icon: Shield },
  editor: { label: 'Redakteur', color: 'bg-blue-500', icon: User },
};

// Mock data
const mockUsers = [
  { id: 1, name: 'Max Mustermann', email: 'admin@msc-dreilaendereck.de', role: 'admin', lastLogin: '2024-01-20', active: true },
  { id: 2, name: 'Anna Schmidt', email: 'redaktion@msc-dreilaendereck.de', role: 'editor', lastLogin: '2024-01-18', active: true },
  { id: 3, name: 'Thomas Müller', email: 'thomas@msc-dreilaendereck.de', role: 'editor', lastLogin: '2024-01-15', active: true },
  { id: 4, name: 'Petra Weber', email: 'petra@msc-dreilaendereck.de', role: 'editor', lastLogin: '2023-12-10', active: false },
];

export default function UsersAdminPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { user: currentUser, hasPermission } = useAuth();

  // Only admins can access this page
  if (!hasPermission('admin')) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Zugriff verweigert</h2>
            <p className="text-muted-foreground">
              Sie benötigen Administratorrechte, um die Benutzerverwaltung zu öffnen.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredUsers = mockUsers.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Benutzer</h1>
          <p className="text-muted-foreground">Verwalten Sie Benutzerkonten und Berechtigungen</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Benutzer
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockUsers.length}</p>
                <p className="text-sm text-muted-foreground">Benutzer gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockUsers.filter(u => u.role === 'admin').length}
                </p>
                <p className="text-sm text-muted-foreground">Administratoren</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {mockUsers.filter(u => u.role === 'editor').length}
                </p>
                <p className="text-sm text-muted-foreground">Redakteure</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Benutzer suchen..."
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
          <CardTitle>Alle Benutzer</CardTitle>
          <CardDescription>
            Übersicht aller registrierten Benutzer und deren Berechtigungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Benutzer</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Letzter Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const role = roleConfig[user.role];
                const Icon = role?.icon || User;
                const isCurrentUser = user.email === currentUser?.email;
                
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                          {user.name.charAt(0)}
                        </div>
                        <span>{user.name}</span>
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-xs">Sie</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <Icon className="h-3 w-3" />
                        {role?.label}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.lastLogin}</TableCell>
                    <TableCell>
                      <Badge variant={user.active ? 'default' : 'secondary'}>
                        {user.active ? 'Aktiv' : 'Inaktiv'}
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
                          <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </DropdownMenuItem>
                          {!isCurrentUser && (
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Löschen
                            </DropdownMenuItem>
                          )}
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

      {/* Roles Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Rollen & Berechtigungen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="font-medium">Administrator</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Vollzugriff auf alle Inhalte</li>
                <li>• Benutzerverwaltung</li>
                <li>• System-Einstellungen</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="font-medium">Redakteur</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• News & Termine verwalten</li>
                <li>• Medien hochladen</li>
                <li>• Keine Benutzerverwaltung</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
