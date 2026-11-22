'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MembershipModal } from '../ui/MembershipModal';
import { categoryPath } from '@/lib/seo';

interface NavbarProps {
  /** Editorias com artigos publicados (vêm do layout, no servidor). */
  categories?: { name: string; slug: string }[];
}

export const Navbar: React.FC<NavbarProps> = ({ categories = [] }) => {
  const pathname = usePathname();
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Fecha os menus ao trocar de página.
  useEffect(() => {
    setCategoriesOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  // Fecha a lista de editorias ao clicar fora dela ou apertar Esc.
  useEffect(() => {
    if (!categoriesOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node)) setCategoriesOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCategoriesOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [categoriesOpen]);

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
            <Image
              src="/logo.png"
              width={40}
              height={40}
              loading="eager"
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
              {categories.length > 0 && (
                <div ref={categoriesRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setCategoriesOpen((v) => !v)}
                    aria-expanded={categoriesOpen}
                    aria-controls="menu-editorias"
                    className={`flex items-center gap-1 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${pathname.startsWith('/categoria/') ? 'bg-white shadow-sm text-slate-900' : navTextColor}`}
                  >
                    Editorias
                    <ChevronDown size={14} className={`transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {/* Sempre no HTML (só escondido) para o Google seguir os links. */}
                  <div
                    id="menu-editorias"
                    className={`${categoriesOpen ? 'block' : 'hidden'} absolute left-1/2 -translate-x-1/2 top-full mt-3 w-64 max-h-[70vh] overflow-y-auto rounded-2xl bg-white p-2 shadow-xl ring-1 ring-black/5`}
                  >
                    <ul>
                      {categories.map((c) => (
                        <li key={c.slug}>
                          <Link
                            href={categoryPath(c.slug)}
                            onClick={() => setCategoriesOpen(false)}
                            className={`block px-4 py-2 rounded-xl text-sm transition-colors ${pathname === categoryPath(c.slug) ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-azure-600'}`}
                          >
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
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
            className="fixed inset-0 bg-white/95 backdrop-blur-xl z-40 overflow-y-auto md:hidden"
          >
            <div className="min-h-full flex flex-col justify-center px-8 pt-28 pb-12">
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

              {categories.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Editorias</p>
                  <ul className="flex flex-wrap justify-center gap-2">
                    {categories.map((c) => (
                      <li key={c.slug}>
                        <Link
                          href={categoryPath(c.slug)}
                          onClick={() => setMobileMenuOpen(false)}
                          className="inline-block px-4 py-2 rounded-full bg-slate-100 text-sm font-medium text-slate-700 hover:bg-azure-50 hover:text-azure-600 transition-colors"
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

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

            <p className="mt-12 text-center text-slate-400 text-xs font-medium uppercase tracking-widest">Portal DPE</p>
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