import { MainLayout } from '@/components/layout/MainLayout';
import {
  HeroSection,
  ClubTeaserSection,
  UpcomingEventsSection,
  NewsSection,
  SponsorsSection,
} from '@/components/home';

const Index = () => {
  return (
    <MainLayout>
      <HeroSection />
      <ClubTeaserSection />
      <UpcomingEventsSection />
      <NewsSection />
      <SponsorsSection />
    </MainLayout>
  );
};

export default Index;
