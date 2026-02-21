import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Marketplace } from './components/Marketplace';
import { Footer } from './components/Footer';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { PianoDetailPage } from './pages/PianoDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { LoginAdmin } from './pages/LoginAdmin';
import { MarketplacePage } from './pages/MarketplacePage';
import { LearnPage } from './pages/LearnPage';
import { PartnersPage } from './pages/PartnersPage';
import { AboutPage } from './pages/AboutPage';
import WalletPage from './pages/WalletPage';
import AdminWithdrawalsPage from './pages/AdminWithdrawalsPage';
import CooperationPage from './pages/CooperationPage';
import { useAffiliateTracking } from './hooks/useAffiliateTracking';

/**
 * Component nội bộ – phải nằm BÊN TRONG <BrowserRouter> để dùng useSearchParams
 * Chạy hook tracking trên mọi page, không render gì cả
 */
function AffiliateTracker() {
  useAffiliateTracking();
  return null;
}

function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-grow">
        <Hero />
        <Marketplace />
      </main>
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col font-body">
          {/* Luôn chạy – bắt ?ref= từ URL và lưu vào localStorage */}
          <AffiliateTracker />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/piano/:id" element={<PianoDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
            <Route path="/learn/courses/:id" element={<CourseDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/partners" element={<PartnersPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/login-admin" element={<LoginAdmin />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/admin/withdrawals" element={<AdminWithdrawalsPage />} />
            <Route path="/cooperation" element={<CooperationPage />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
