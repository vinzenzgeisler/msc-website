import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { RacePicWordmark } from '@/components/racepic/RacePicWordmark';
import { clearPhotographerSession } from '@/integrations/racepic/session';
import type { PhotographerProfile } from '@/integrations/racepic/client';

/**
 * Studio-Kopfzeile (Paket 15), siehe racepic-ux-redesign-plan.md. Umschließt alle
 * `/racepic/studio/*`-Unterseiten nach dem Login mit einer eigenen, schlanken Kopfzeile statt der
 * einzigen langen Spalte aus Paket 2/3 - Wortmarke, Fotografenname, Abmelden (bisher nirgends
 * aufrufbar).
 *
 * Bewusst **kein** globaler Event-Switcher hier: `StudioUploadPanel` hat bereits eine eigene
 * Event-/Lizenzauswahl für den Upload-Zielort, ein zweiter, redundanter Auswahl-Zustand in der
 * Kopfzeile würde nur verwirren. Die "Meine Bilder"-Ansicht hat stattdessen einen eigenen,
 * unabhängigen Event-Filter (siehe StudioImagesPanel.tsx).
 */
export function StudioLayout({ profile, children }: { profile: PhotographerProfile | null; children: ReactNode }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearPhotographerSession();
    navigate('/racepic/studio/login');
  };

  return (
    <MainLayout title="RacePic Studio" noindex>
      <div className="border-b bg-muted/30">
        <div className="container flex items-center justify-between py-4">
          <Link to="/racepic/studio">
            <RacePicWordmark size="sm" />
          </Link>
          {profile && (
            <div className="flex items-center gap-4">
              <span className="hidden text-sm text-muted-foreground sm:inline">{profile.displayName}</span>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
                <LogOut className="h-3.5 w-3.5" />
                Abmelden
              </Button>
            </div>
          )}
        </div>
      </div>
      <section className="container max-w-4xl py-10">{children}</section>
    </MainLayout>
  );
}
