import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
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

// Admin Pages
import LoginPage from "./pages/admin/LoginPage";
import ForgotPasswordPage from "./pages/admin/ForgotPasswordPage";
import ResetPasswordPage from "./pages/admin/ResetPasswordPage";
import DashboardPage from "./pages/admin/DashboardPage";
import NewsAdminPage from "./pages/admin/NewsAdminPage";
import EventsAdminPage from "./pages/admin/EventsAdminPage";
import CalendarAdminPage from "./pages/admin/CalendarAdminPage";
import SponsorsAdminPage from "./pages/admin/SponsorsAdminPage";
import DownloadsAdminPage from "./pages/admin/DownloadsAdminPage";
import MediaAdminPage from "./pages/admin/MediaAdminPage";
import UsersAdminPage from "./pages/admin/UsersAdminPage";
import SettingsAdminPage from "./pages/admin/SettingsAdminPage";
import { AdminLayout } from "./components/admin/AdminLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
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
              
              {/* Admin Pages */}
              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/admin/reset-password" element={<ResetPasswordPage />} />
              <Route path="/admin" element={<AdminLayout><DashboardPage /></AdminLayout>} />
              <Route path="/admin/news" element={<AdminLayout><NewsAdminPage /></AdminLayout>} />
              <Route path="/admin/events" element={<AdminLayout><EventsAdminPage /></AdminLayout>} />
              <Route path="/admin/calendar" element={<AdminLayout><CalendarAdminPage /></AdminLayout>} />
              <Route path="/admin/sponsors" element={<AdminLayout><SponsorsAdminPage /></AdminLayout>} />
              <Route path="/admin/downloads" element={<AdminLayout><DownloadsAdminPage /></AdminLayout>} />
              <Route path="/admin/media" element={<AdminLayout><MediaAdminPage /></AdminLayout>} />
              <Route path="/admin/users" element={<AdminLayout><UsersAdminPage /></AdminLayout>} />
              <Route path="/admin/settings" element={<AdminLayout><SettingsAdminPage /></AdminLayout>} />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
