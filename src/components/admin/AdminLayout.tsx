import { ReactNode } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LayoutDashboard,
  Newspaper,
  CalendarDays,
  Users,
  Download,
  Image,
  Settings,
  LogOut,
  ChevronRight,
  Trophy,
  Menu,
  X,
  Loader2,
  FileText,
  FolderTree,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AdminHealthBanner } from '@/components/admin/AdminHealthBanner';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/events', label: 'Veranstaltungen', icon: Trophy },
  { href: '/admin/news', label: 'News', icon: Newspaper },
  { href: '/admin/calendar', label: 'Terminkalender', icon: CalendarDays },
  { href: '/admin/content', label: 'Seiten & Texte', icon: FileText },
  { href: '/admin/structured', label: 'Strukturierte Inhalte', icon: FolderTree },
  { href: '/admin/sponsors', label: 'Sponsoren', icon: Users },
  { href: '/admin/downloads', label: 'Downloads', icon: Download },
  { href: '/admin/media', label: 'Medien', icon: Image },
];

const settingsItems = [
  { href: '/admin/users', label: 'Benutzer', icon: Users },
  { href: '/admin/settings', label: 'Einstellungen', icon: Settings },
];

const roleLabels: Record<string, string> = {
  super_admin: 'Admin',
  admin: 'Admin',
  editor: 'Bearbeiter',
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) => {
    const isActive = location.pathname === href || 
      (href !== '/admin' && location.pathname.startsWith(href));
    
    return (
      <Link
        to={href}
        onClick={() => setSidebarOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
        {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
      </Link>
    );
  };

  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="p-4 border-b">
        <Link to="/admin" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            MSC
          </div>
          <div>
            <div className="font-semibold text-sm">Admin-Bereich</div>
            <div className="text-xs text-muted-foreground">MSC Dreiländereck</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground px-3 mb-2">INHALTE</p>
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>

        {(user?.role === 'super_admin' || user?.role === 'admin') && (
          <div className="mt-6 space-y-1">
            <Separator className="mb-4" />
            <p className="text-xs font-medium text-muted-foreground px-3 mb-2">VERWALTUNG</p>
            {settingsItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* User section */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            {user?.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.name}</div>
            <div className="text-xs text-muted-foreground">
              {user?.role ? roleLabels[user.role] || user.role : ''}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            asChild
          >
            <a href="/" target="_blank">Website</a>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-background border-b z-40 flex items-center px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <span className="ml-3 font-semibold">MSC Admin</span>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-64 bg-card border-r flex flex-col transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Main content */}
      <main className="lg:pl-64 pt-14 lg:pt-0">
        <div className="p-6">
          <AdminHealthBanner />
          {children}
        </div>
      </main>
    </div>
  );
}
