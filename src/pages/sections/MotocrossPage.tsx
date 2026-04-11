import { useTranslation } from '@/i18n/LanguageContext';
import { Trophy } from 'lucide-react';
import DisciplinePage from '@/components/sections/DisciplinePage';

export default function MotocrossPage() {
  const t = useTranslation();

  return (
    <DisciplinePage
      pageKey="motocross"
      categoryFilter="motocross"
      fallbackTitle={t.nav.motocross}
      defaultIcon={Trophy}
      fallbackHighlights={[
        { id: 'fallback-1', title: 'Training', description: 'Noch keine Informationen hinterlegt.', icon: 'training' },
        { id: 'fallback-2', title: 'Veranstaltungen', description: 'Noch keine Informationen hinterlegt.', icon: 'events' },
        { id: 'fallback-3', title: t.nav.motocross, description: 'Noch keine Informationen hinterlegt.', icon: 'award' },
      ]}
    />
  );
}
