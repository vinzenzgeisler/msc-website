import { MainLayout } from '@/components/layout/MainLayout';
import { Helmet } from 'react-helmet-async';
import { useSettings } from '@/hooks/useSettings';
import {
  HeroSection,
  ClubTeaserSection,
  UpcomingEventsSection,
  NewsSection,
  SponsorsSection,
} from '@/components/home';

const Index = () => {
  const { data: settings } = useSettings();

  return (
    <>
      <Helmet>
        <title>{settings?.meta_title || settings?.site_name || 'MSC Oberlausitzer Dreiländereck e.V.'}</title>
        <meta name="description" content={settings?.meta_description || settings?.description || ''} />
        <meta property="og:title" content={settings?.meta_title || settings?.site_name || 'MSC Oberlausitzer Dreiländereck e.V.'} />
        <meta property="og:description" content={settings?.meta_description || settings?.description || ''} />
        {settings?.default_og_image_url && (
          <meta property="og:image" content={settings.default_og_image_url} />
        )}
        <meta property="og:type" content="website" />
      </Helmet>

      <MainLayout>
        <HeroSection />
        <ClubTeaserSection />
        <UpcomingEventsSection />
        <NewsSection />
        <SponsorsSection />
      </MainLayout>
    </>
  );
};

export default Index;