import { MainLayout } from '@/components/layout/MainLayout';
import {
  HeroSection,
  ClubTeaserSection,
  UpcomingEventsSection,
  NewsSection,
  NewsletterSection,
  SponsorsSection,
} from '@/components/home';

const Index = () => {
  return (
    <MainLayout>
      <HeroSection />
      <ClubTeaserSection />
      <UpcomingEventsSection />
      <NewsSection />
      <NewsletterSection />
      <SponsorsSection />
    </MainLayout>
  );
};

export default Index;
