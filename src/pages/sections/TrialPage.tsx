import { useTranslation } from '@/i18n/LanguageContext';
import { Target } from 'lucide-react';
import DisciplinePage from '@/components/sections/DisciplinePage';
import heroTrial from '@/assets/event-start-2.jpg';

export default function TrialPage() {
  const t = useTranslation();
  return (
    <DisciplinePage
      pageKey="trial"
      categoryFilter="trial"
      fallbackTitle={t.nav.trial}
      defaultIcon={Target}
      fallbackImage={heroTrial}
      fallbackHighlights={[
        { id: 'fallback-1', title: 'Training', description: 'Noch keine Informationen hinterlegt.', icon: 'training' },
        { id: 'fallback-2', title: 'Veranstaltungen', description: 'Noch keine Informationen hinterlegt.', icon: 'events' },
        { id: 'fallback-3', title: t.nav.trial, description: 'Noch keine Informationen hinterlegt.', icon: 'award' },
      ]}
    />
  );
}
