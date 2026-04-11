import { AlertCircle } from 'lucide-react';
import { useAdminHealth } from '@/hooks/useAdminHealth';

export function AdminHealthBanner() {
  const { data, isLoading } = useAdminHealth();

  if (isLoading || !data || data.ok) {
    return null;
  }

  const failing = data.checks.filter((item) => !item.ok);

  return (
    <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
        <div className="space-y-2">
          <p className="font-medium text-destructive">PocketBase-Konfiguration unvollständig</p>
          <p className="text-sm text-muted-foreground">
            Mindestens eine kritische Collection oder ein Singleton ist auf der laufenden Instanz nicht in erwartbarem Zustand.
          </p>
          <div className="space-y-1 text-sm text-muted-foreground">
            {failing.map((item) => (
              <p key={item.key}>{item.message}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
