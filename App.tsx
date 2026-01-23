import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next'; // Added import
import { BackgroundWrapper } from './components/layout/BackgroundWrapper';
import { Navbar } from './components/layout/Navbar';
import { Home } from './pages/Home';
import { Admin } from './pages/Admin';
import { ArticlePage } from './pages/ArticlePage';
import { About } from './pages/About';

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <Router>
        <BackgroundWrapper>
          <Navbar />
          <main className="min-h-screen">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/article/:id" element={<ArticlePage />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="border-t border-white/5 bg-black py-12 text-center">
            <FooterContent />
          </footer>
        </BackgroundWrapper>
      </Router>
    </HelmetProvider>
  );
};

// Helper component to use hook
const FooterContent = () => {
  const { t } = useTranslation();
  return (
    <p className="font-mono text-xs text-text-muted">
      {t('footer.designed_by')} <br />
      © {new Date().getFullYear()} {t('footer.copy')}
    </p>
  );
}

export default App;