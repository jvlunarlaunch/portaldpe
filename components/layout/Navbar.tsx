import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Terminal, Sparkles, Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MembershipModal } from '../ui/MembershipModal';
import { useTranslation } from 'react-i18next';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'pt' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <>
      <nav className="fixed top-6 left-0 right-0 z-40 mx-auto w-full max-w-5xl px-4">
        <div className="relative flex items-center justify-between rounded-full border border-white/10 bg-black/20 px-6 py-3 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] z-50">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
              <Terminal size={18} />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-white">
              LUX<span className="text-text-muted">TECH</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/about"
              className={`text-sm font-medium transition-colors flex items-center gap-2 ${isActive('/about') ? 'text-white' : 'text-text-muted hover:text-white'}`}
            >
              {t('nav.about')}
            </Link>

            <button
              onClick={() => setIsMembershipOpen(true)}
              className="text-sm font-medium text-text-muted hover:text-primary transition-colors flex items-center gap-2 group"
            >
              <Sparkles size={12} className="group-hover:text-primary transition-colors" />
              {t('nav.membership')}
            </button>

            <button
              onClick={toggleLanguage}
              className="text-sm font-mono text-text-muted hover:text-white flex items-center gap-2"
            >
              <Globe size={14} />
              {i18n.language === 'en' ? 'PT' : 'EN'}
            </button>
          </div>

          {/* Mobile Toggle Button - Now Inside the Bar */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-text-muted hover:bg-white/10 hover:text-white transition-all active:scale-95"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute top-[calc(100%+0.5rem)] left-0 right-0 overflow-hidden rounded-3xl border border-white/10 bg-[#0A0A0A]/95 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] md:hidden"
            >
              <div className="flex flex-col p-4 gap-1">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-4 rounded-2xl font-display font-medium transition-all ${isActive('/') ? 'bg-white/10 text-white' : 'text-text-muted hover:bg-white/5 hover:text-white'}`}
                >
                  <Terminal size={18} className={isActive('/') ? 'text-primary' : ''} />
                  {t('nav.home')}
                </Link>

                <Link
                  to="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-4 rounded-2xl font-display font-medium transition-all ${isActive('/about') ? 'bg-white/10 text-white' : 'text-text-muted hover:bg-white/5 hover:text-white'}`}
                >
                  <Globe size={18} className={isActive('/about') ? 'text-primary' : ''} />
                  {t('nav.about')}
                </Link>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsMembershipOpen(true);
                  }}
                  className="flex items-center gap-3 p-4 rounded-2xl font-display font-medium text-left text-text-muted hover:bg-white/5 hover:text-white transition-all"
                >
                  <Sparkles size={18} className="text-primary" />
                  {t('nav.membership')}
                </button>

                <div className="my-2 h-[1px] bg-white/5 mx-4" />

                <button
                  onClick={() => {
                    toggleLanguage();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 p-4 rounded-2xl font-display font-medium text-left text-text-muted hover:bg-white/5 hover:text-white transition-all"
                >
                  <Globe size={18} className="text-text-muted" />
                  <div className="flex flex-col">
                    <span className="text-xs text-text-muted/60 uppercase tracking-widest font-mono">Language</span>
                    <span>{i18n.language === 'en' ? 'Mudar para Português' : 'Switch to English'}</span>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Membership Popup Modal */}
      <MembershipModal
        isOpen={isMembershipOpen}
        onClose={() => setIsMembershipOpen(false)}
      />
    </>
  );
};