import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BackgroundWrapper } from './components/layout/BackgroundWrapper';
import { Navbar } from './components/layout/Navbar';
import { Home } from './pages/Home';
import { Admin } from './pages/Admin';
import { ArticlePage } from './pages/ArticlePage';
import { About } from './pages/About';
import { LoadingProvider } from './context/LoadingContext';

const PageViewTracker: React.FC = () => {
  const location = useLocation();
  useEffect(() => {
    gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
    });
  }, [location]);
  return null;
};

const App: React.FC = () => {
  return (
    <HelmetProvider>
      <Router>
        <PageViewTracker />
        <LoadingProvider>
          <BackgroundWrapper>
            <Navbar />
            <main className="min-h-screen">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/article/:slug" element={<ArticlePage />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-100 py-16 px-6">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex flex-col items-center md:items-start">
                  <div className="flex items-center gap-2 mb-4">
                    <img src="/logo.png" alt="Logo Portal DPE" className="w-8 h-8 rounded-full object-contain shadow-lg shadow-azure-500/20" />
                    <span className="font-bold text-slate-800">Portal DPE</span>
                  </div>
                  <p className="text-slate-500 text-sm max-w-xs text-center md:text-left">
                    O maior portal conservador de Pernambuco. Compromisso com a verdade e os valores tradicionais do Portal DPE.
                  </p>
                </div>

                <div className="flex flex-col items-center md:items-end">
                  <FooterContent />
                </div>
              </div>
            </footer>
          </BackgroundWrapper>
        </LoadingProvider>
      </Router>
    </HelmetProvider>
  );
};

// Helper component
const FooterContent = () => {
  return (
    <div className="text-center md:text-right">
      <div className="flex gap-6 mb-4 justify-center md:justify-end">
        <a
          href="https://www.instagram.com/direita.pernambuco/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-azure-600 transition-colors"
        >
          Instagram
        </a>
      </div>
      <p className="text-xs text-slate-400">
        © {new Date().getFullYear()} Portal DPE. Todos os direitos reservados.
      </p>
    </div>
  );
}

export default App;