import { useTranslation } from '@/i18n/LanguageContext';
import { Users } from 'lucide-react';
import DisciplinePage from '@/components/sections/DisciplinePage';

export default function TouringPage() {
  const t = useTranslation();

  return (
    <DisciplinePage
      pageKey="touring"
      categoryFilter="touring"
      fallbackTitle={t.nav.touring}
      defaultIcon={Users}
      fallbackHighlights={[
        { id: 'fallback-1', title: 'Touren', description: 'Noch keine Informationen hinterlegt.', icon: 'tour' },
        { id: 'fallback-2', title: 'Gemeinschaft', description: 'Noch keine Informationen hinterlegt.', icon: 'community' },
        { id: 'fallback-3', title: t.nav.touring, description: 'Noch keine Informationen hinterlegt.', icon: 'award' },
      ]}
    />
  );
}
