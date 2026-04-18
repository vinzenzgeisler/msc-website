import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminHealth, useRepairAdminHealth } from '@/hooks/useAdminHealth';
import { getPocketBaseErrorMessage } from '@/lib/pocketbase-errors';

export function AdminHealthBanner() {
  const { user } = useAuth();
  const { data, isLoading } = useAdminHealth();
  const repairMutation = useRepairAdminHealth();

  if (isLoading || !data || data.ok) {
    return null;
  }

  const failing = data.checks.filter((item) => !item.ok);
  const canRepair = user?.role === 'admin' || user?.role === 'super_admin';

  const handleRepair = async () => {
    try {
      const result = await repairMutation.mutateAsync();
      toast.success(result.message || 'PocketBase-Konfiguration repariert');
    } catch (error) {
      toast.error(getPocketBaseErrorMessage(error, 'Konfiguration konnte nicht repariert werden'));
    }
  };

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
          {canRepair ? (
            <div className="pt-2">
              <Button
                type="button"
                variant="destructive"
                onClick={handleRepair}
                disabled={repairMutation.isPending}
              >
                {repairMutation.isPending ? 'Repariere Konfiguration...' : 'CMS-Konfiguration reparieren'}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
