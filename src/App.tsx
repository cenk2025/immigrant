import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CookieConsent } from './components/CookieConsent';
import { HomePage } from './pages/HomePage';
import { GuidePage } from './pages/GuidePage';
import { EmployerGuidePage } from './pages/EmployerGuidePage';
import { CVBuilderPage } from './pages/CVBuilderPage';
import { AssistantPage } from './pages/AssistantPage';
import { DashboardPage } from './pages/DashboardPage';
import { CommunityPage } from './pages/CommunityPage';
import { MentorshipPage } from './pages/MentorshipPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <div className="app">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/guide" element={<GuidePage />} />
                  <Route path="/employer-guide" element={<EmployerGuidePage />} />
                  <Route path="/cv-builder" element={<CVBuilderPage />} />
                  <Route path="/assistant" element={<AssistantPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/mentorship" element={<MentorshipPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
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
