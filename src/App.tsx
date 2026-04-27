import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConsentProvider } from "@/contexts/ConsentContext";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { CookieBanner } from "@/components/layout/CookieBanner";
import { AnalyticsManager } from "@/components/analytics/AnalyticsManager";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";
import EventPage from "./pages/EventPage";
import AccommodationPage from "./pages/event/AccommodationPage";
import CalendarPage from "./pages/CalendarPage";
import CalendarDetailPage from "./pages/CalendarDetailPage";
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

// Admin Pages
import LoginPage from "./pages/admin/LoginPage";
import ForgotPasswordPage from "./pages/admin/ForgotPasswordPage";
import ResetPasswordPage from "./pages/admin/ResetPasswordPage";
import DashboardPage from "./pages/admin/DashboardPage";
import NewsAdminPage from "./pages/admin/NewsAdminPage";
import NewsFormPage from "./pages/admin/NewsFormPage";
import EventsAdminPage from "./pages/admin/EventsAdminPage";
import CalendarAdminPage from "./pages/admin/CalendarAdminPage";
import CalendarFormPage from "./pages/admin/CalendarFormPage";
import SponsorsAdminPage from "./pages/admin/SponsorsAdminPage";
import SponsorFormPage from "./pages/admin/SponsorFormPage";
import DownloadsAdminPage from "./pages/admin/DownloadsAdminPage";
import DownloadsFormPage from "./pages/admin/DownloadsFormPage";
import MediaAdminPage from "./pages/admin/MediaAdminPage";
import ContentAdminPage from "./pages/admin/ContentAdminPage";
import StructuredContentAdminPage from "./pages/admin/StructuredContentAdminPage";
import BoardAdminPage from "./pages/admin/BoardAdminPage";
import PartnerClubsAdminPage from "./pages/admin/PartnerClubsAdminPage";
import UsersAdminPage from "./pages/admin/UsersAdminPage";
import SettingsAdminPage from "./pages/admin/SettingsAdminPage";
import EventGalleryArchivePage from "./pages/admin/EventGalleryArchivePage";
import { AdminLayout } from "./components/admin/AdminLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <ConsentProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <AnalyticsManager />
              <Analytics />
              <Routes>
              {/* Main Pages */}
              <Route path="/" element={<Index />} />
              <Route path="/event" element={<EventPage />} />
              <Route path="/event/accommodation" element={<AccommodationPage />} />
              <Route path="/old" element={<Navigate to="/event" replace />} />
              <Route path="/old/accommodation" element={<Navigate to="/event/accommodation" replace />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/calendar/:slug" element={<CalendarDetailPage />} />
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
              
              {/* Admin Pages */}
              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/admin/reset-password" element={<ResetPasswordPage />} />
              <Route path="/admin" element={<AdminLayout><DashboardPage /></AdminLayout>} />
              <Route path="/admin/news" element={<AdminLayout><NewsAdminPage /></AdminLayout>} />
              <Route path="/admin/news/new" element={<AdminLayout><NewsFormPage /></AdminLayout>} />
              <Route path="/admin/news/:id" element={<AdminLayout><NewsFormPage /></AdminLayout>} />
              <Route path="/admin/events" element={<AdminLayout><EventsAdminPage /></AdminLayout>} />
              <Route path="/admin/events/gallery-archive" element={<AdminLayout><EventGalleryArchivePage /></AdminLayout>} />
              <Route path="/admin/calendar" element={<AdminLayout><CalendarAdminPage /></AdminLayout>} />
              <Route path="/admin/calendar/new" element={<AdminLayout><CalendarFormPage /></AdminLayout>} />
              <Route path="/admin/calendar/:id" element={<AdminLayout><CalendarFormPage /></AdminLayout>} />
              <Route path="/admin/sponsors" element={<AdminLayout><SponsorsAdminPage /></AdminLayout>} />
              <Route path="/admin/sponsors/new" element={<AdminLayout><SponsorFormPage /></AdminLayout>} />
              <Route path="/admin/sponsors/:id" element={<AdminLayout><SponsorFormPage /></AdminLayout>} />
              <Route path="/admin/downloads" element={<AdminLayout><DownloadsAdminPage /></AdminLayout>} />
              <Route path="/admin/downloads/new" element={<AdminLayout><DownloadsFormPage /></AdminLayout>} />
              <Route path="/admin/downloads/:id" element={<AdminLayout><DownloadsFormPage /></AdminLayout>} />
              <Route path="/admin/media" element={<AdminLayout><MediaAdminPage /></AdminLayout>} />
              <Route path="/admin/content" element={<AdminLayout><ContentAdminPage /></AdminLayout>} />
              <Route path="/admin/board" element={<AdminLayout><BoardAdminPage /></AdminLayout>} />
              <Route path="/admin/partner-clubs" element={<AdminLayout><PartnerClubsAdminPage /></AdminLayout>} />
              <Route path="/admin/structured" element={<AdminLayout><StructuredContentAdminPage /></AdminLayout>} />
              <Route path="/admin/users" element={<AdminLayout><UsersAdminPage /></AdminLayout>} />
              <Route path="/admin/settings" element={<AdminLayout><SettingsAdminPage /></AdminLayout>} />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
              </Routes>
              <CookieBanner />
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ConsentProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
