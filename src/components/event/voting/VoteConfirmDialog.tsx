import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import type { EventHubCandidate } from '@/lib/eventHubVoting';

interface VoteConfirmDialogProps {
  candidate: EventHubCandidate | null;
  submitting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function VoteConfirmDialog({ candidate, submitting, onConfirm, onCancel }: VoteConfirmDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={Boolean(candidate)} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.voting.confirmTitle}</DialogTitle>
          <DialogDescription>{t.voting.confirmBody}</DialogDescription>
        </DialogHeader>
        {candidate && (
          <p className="text-sm font-medium text-foreground">
            {candidate.startNumberNorm ? `#${candidate.startNumberNorm} · ` : ''}
            {candidate.driverName}
          </p>
        )}
        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
            {t.voting.cancelButton}
          </Button>
          <Button type="button" onClick={onConfirm} disabled={submitting}>
            {submitting ? t.voting.votingSubmitting : t.voting.confirmButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
