'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MembershipModal } from '../ui/MembershipModal';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;
  const isAdmin = pathname.startsWith('/admin');
  const textColor = isAdmin && !scrolled ? 'text-white' : 'text-slate-900';
  const navTextColor = isAdmin && !scrolled ? 'text-slate-300 hover:text-white' : 'text-slate-500 hover:text-slate-900';
  const logoBg = isAdmin && !scrolled ? 'bg-white text-azure-600' : 'bg-azure-600 text-white';

  return (
    <>
      <div className="fixed top-0 w-full z-50 flex justify-center pt-4 md:pt-6 px-4 pointer-events-none">
        <header
          className={`pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center justify-between px-6
            ${scrolled || mobileMenuOpen
              ? 'w-full max-w-2xl py-3 rounded-full glass-nav shadow-[0_8px_32px_rgba(0,0,0,0.04)] ring-1 ring-black/5 bg-white/80'
              : 'w-full max-w-6xl py-4 md:py-6 bg-transparent'
            }`}
        >
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="cursor-pointer flex items-center gap-3 group relative z-50"
          >
            <img
              src="/logo.png"
              alt="Logo Portal DPE"
              className={`transition-all duration-500 rounded-full object-contain shadow-lg shadow-azure-500/20 ${scrolled ? 'w-8 h-8' : 'w-10 h-10'}`}
            />
            <span className={`font-semibold tracking-tight transition-all duration-500 ${textColor} ${scrolled ? 'text-lg' : 'text-xl'}`}>
              Portal DPE
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 md:gap-4">
            <div className={`flex items-center rounded-full p-1 ${isAdmin && !scrolled ? 'bg-white/10 backdrop-blur-md border border-white/5' : 'bg-slate-100/50'}`}>
              <Link
                href="/"
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${isActive('/') ? 'bg-white shadow-sm text-slate-900' : navTextColor}`}
              >
                Início
              </Link>
              <Link
                href="/about"
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${isActive('/about') ? 'bg-white shadow-sm text-slate-900' : navTextColor}`}
              >
                Quem Somos
              </Link>
            </div>

            <button
              onClick={() => setIsMembershipOpen(true)}
              className={`text-sm font-medium px-5 py-2 rounded-full transition-all duration-300 shadow-lg shadow-azure-500/20 ${scrolled ? 'bg-slate-900 text-white' : 'bg-azure-600 text-white hover:bg-azure-700'}`}
            >
              Seja Membro
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden relative z-50 p-2 text-slate-800 focus:outline-none"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-white/95 backdrop-blur-xl z-40 flex flex-col justify-center px-8 md:hidden"
          >
            <nav className="flex flex-col gap-6 text-center">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-semibold text-slate-900 hover:text-azure-600 transition-colors"
              >
                Início
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-semibold text-slate-900 hover:text-azure-600 transition-colors"
              >
                Quem Somos
              </Link>

              <div className="h-px w-20 bg-slate-200 mx-auto my-4"></div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsMembershipOpen(true);
                }}
                className="text-lg font-medium bg-azure-600 text-white py-3 px-8 rounded-full shadow-lg shadow-azure-600/30 mx-auto w-full max-w-xs"
              >
                Seja Membro
              </button>
            </nav>

            <div className="absolute bottom-10 left-0 w-full text-center">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Portal DPE</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MembershipModal
        isOpen={isMembershipOpen}
        onClose={() => setIsMembershipOpen(false)}
      />
    </>
  );
};