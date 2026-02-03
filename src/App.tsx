import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import Index from "./pages/Index";
import EventPage from "./pages/EventPage";
import CalendarPage from "./pages/CalendarPage";
import NewsPage from "./pages/NewsPage";
import NewsDetailPage from "./pages/NewsDetailPage";
import AboutPage from "./pages/club/AboutPage";
import BoardPage from "./pages/club/BoardPage";
import HistoryPage from "./pages/club/HistoryPage";
import MembershipPage from "./pages/club/MembershipPage";
import TouringPage from "./pages/sections/TouringPage";
import MotocrossPage from "./pages/sections/MotocrossPage";
import TrialPage from "./pages/sections/TrialPage";
import SponsorsPage from "./pages/partners/SponsorsPage";
import PartnerClubsPage from "./pages/partners/PartnerClubsPage";
import ContactPage from "./pages/ContactPage";
import ImprintPage from "./pages/ImprintPage";
import PrivacyPage from "./pages/PrivacyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Main Pages */}
            <Route path="/" element={<Index />} />
            <Route path="/event" element={<EventPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:slug" element={<NewsDetailPage />} />
            
            {/* Club Pages */}
            <Route path="/club/about" element={<AboutPage />} />
            <Route path="/club/board" element={<BoardPage />} />
            <Route path="/club/history" element={<HistoryPage />} />
            <Route path="/club/membership" element={<MembershipPage />} />
            
            {/* Sections Pages */}
            <Route path="/sections/touring" element={<TouringPage />} />
            <Route path="/sections/motocross" element={<MotocrossPage />} />
            <Route path="/sections/trial" element={<TrialPage />} />
            
            {/* Partner Pages */}
            <Route path="/partners/sponsors" element={<SponsorsPage />} />
            <Route path="/partners/clubs" element={<PartnerClubsPage />} />
            
            {/* Contact & Legal */}
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/imprint" element={<ImprintPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
