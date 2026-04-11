import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CONSENT_KEY = 'msc_cookie_consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = (level: 'all' | 'necessary') => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({ level, date: new Date().toISOString() }));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card p-4 shadow-lg md:p-6">
      <div className="container flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 text-sm text-muted-foreground">
          Diese Website verwendet Cookies, um die bestmögliche Funktionalität zu gewährleisten.{' '}
          <Link to="/privacy" className="text-primary underline hover:no-underline">
            Datenschutzerklärung
          </Link>
        </div>
        <div className="flex shrink-0 gap-3">
          <Button variant="outline" size="sm" onClick={() => accept('necessary')}>
            Nur notwendige
          </Button>
          <Button size="sm" onClick={() => accept('all')}>
            Alle akzeptieren
          </Button>
        </div>
      </div>
    </div>
  );
}
