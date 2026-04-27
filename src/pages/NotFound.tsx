import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <MainLayout noindex title="Seite nicht gefunden">
      <section className="flex min-h-[60vh] items-center justify-center py-16">
        <div className="container text-center">
          <h1 className="mb-4 text-8xl font-black text-primary">404</h1>
          <h2 className="mb-4 text-2xl font-semibold">Seite nicht gefunden</h2>
          <p className="mb-8 text-muted-foreground">
            Die gesuchte Seite existiert leider nicht oder wurde verschoben.
          </p>
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Zur Startseite
            </Link>
          </Button>
        </div>
      </section>
    </MainLayout>
  );
};

export default NotFound;
