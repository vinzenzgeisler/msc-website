import { useEffect, useState } from 'react';
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';
import { hasDismissedVoteHint, markVoteHintDismissed } from '@/lib/voterIdentity';

interface VoteHintSheetProps {
  eventId: string;
  /** true once the visitor has opened the voting UI or already cast a vote — suppresses the hint. */
  hasInteracted: boolean;
}

const HINT_DELAY_MS = 20_000;

export function VoteHintSheet({ eventId, hasInteracted }: VoteHintSheetProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (hasInteracted || hasDismissedVoteHint(eventId)) return;
    const timer = window.setTimeout(() => {
      if (!hasInteracted) setOpen(true);
    }, HINT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [eventId, hasInteracted]);

  const dismiss = () => {
    setOpen(false);
    markVoteHintDismissed(eventId);
  };

  return (
    <Drawer open={open} onOpenChange={(next) => !next && dismiss()}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t.voting.hintTitle}</DrawerTitle>
          <DrawerDescription>{t.voting.hintBody}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <Button type="button" onClick={dismiss}>
            {t.voting.hintDismiss}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
