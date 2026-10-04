import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CookieConsent } from './components/CookieConsent';
import { AuthRedirectHandler } from './components/AuthRedirectHandler';
import { HomePage } from './pages/HomePage';
import { GuidePage } from './pages/GuidePage';
import { EmployerGuidePage } from './pages/EmployerGuidePage';
import { CVBuilderPage } from './pages/CVBuilderPage';
import { CareerPathsPage } from './pages/CareerPathsPage';
import { AssistantPage } from './pages/AssistantPage';
import { DashboardPage } from './pages/DashboardPage';
import { CommunityPage } from './pages/CommunityPage';
import { MentorshipPage } from './pages/MentorshipPage';
import { PathwayHubPage } from './pages/pathway/PathwayHubPage';
import { PreArrivalPage } from './pages/pathway/PreArrivalPage';
import { JobsPage } from './pages/pathway/JobsPage';
import { FamilyPage } from './pages/pathway/FamilyPage';
import { InstitutionsPage } from './pages/pathway/InstitutionsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <AuthRedirectHandler />
            <div className="app">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/guide" element={<GuidePage />} />
                  <Route path="/employer-guide" element={<EmployerGuidePage />} />
                  <Route path="/cv-builder" element={<CVBuilderPage />} />
                  <Route path="/career-paths" element={<CareerPathsPage />} />
                  <Route path="/assistant" element={<AssistantPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/mentorship" element={<MentorshipPage />} />
                  <Route path="/pathway" element={<PathwayHubPage />} />
                  <Route path="/pathway/pre-arrival" element={<PreArrivalPage />} />
                  <Route path="/pathway/jobs" element={<JobsPage />} />
                  <Route path="/pathway/family" element={<FamilyPage />} />
                  <Route path="/pathway/institutions" element={<InstitutionsPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/privacy" element={<ComingSoon page="Privacy Policy" />} />
                  <Route path="/terms" element={<ComingSoon page="Terms of Service" />} />
                  <Route path="/contact" element={<ComingSoon page="Contact" />} />
                </Routes>
              </main>
              <Footer />
              <CookieConsent />
            </div>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

// Temporary Coming Soon component
const ComingSoon: React.FC<{ page: string }> = ({ page }) => {
  return (
    <div className="coming-soon">
      <div className="container">
        <div className="coming-soon-content">
          <div className="coming-soon-icon">🚀</div>
          <h1>{page}</h1>
          <p>This feature is currently under development and will be available soon.</p>
          <a href="/" className="btn btn-primary">
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default App;
