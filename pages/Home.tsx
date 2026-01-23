import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { ArrowDown, Filter, Search, X, ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArticleCard } from '../components/ui/ArticleCard';
import { Button } from '../components/ui/Button';
import { fetchArticles } from '../api';
import { Article } from '../types';

export const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Data State
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchArticles();
        setArticles(data);
      } catch (error) {
        console.error("Failed to load articles", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Extract unique categories and add 'ALL'
  const CATEGORIES = ['ALL', ...Array.from(new Set(articles.map(a => a.category)))];

  // Carousel State
  const mainArticles = articles.filter(a => a.main);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Auto-rotate Carousel
  useEffect(() => {
    if (mainArticles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % mainArticles.length);
    }, 8000); // 8 seconds per slide
    return () => clearInterval(interval);
  }, [mainArticles.length]);

  const nextSlide = () => {
    setCurrentHeroIndex((prev) => (prev + 1) % mainArticles.length);
  };

  const prevSlide = () => {
    setCurrentHeroIndex((prev) => (prev - 1 + mainArticles.length) % mainArticles.length);
  };

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'ALL' || article.category === selectedCategory;

    const displayTitle = (i18n.language === 'pt' && article.title_pt) ? article.title_pt : article.title;
    const displayExcerpt = (i18n.language === 'pt' && article.excerpt_pt) ? article.excerpt_pt : article.excerpt;

    const matchesSearch =
      displayTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      displayExcerpt.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="font-mono text-primary animate-pulse">CONNECTING_TO_DATABASE...</div>
      </div>
    );
  }

  // Get current main article data based on language
  const currentHeroArticle = mainArticles[currentHeroIndex];
  const heroTitle = currentHeroArticle ? ((i18n.language === 'pt' && currentHeroArticle.title_pt) ? currentHeroArticle.title_pt : currentHeroArticle.title) : '';
  const heroExcerpt = currentHeroArticle ? ((i18n.language === 'pt' && currentHeroArticle.excerpt_pt) ? currentHeroArticle.excerpt_pt : currentHeroArticle.excerpt) : '';


  return (
    <div className="relative w-full pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      <Helmet>
        <title>LuxTech | High-End Tech Blog</title>
        <meta name="description" content="Explorations in high-performance rendering, interface design, and the philosophical implications of software engineering." />
        <meta property="og:title" content="LuxTech | High-End Tech Blog" />
        <meta property="og:description" content="Explorations in high-performance rendering, interface design, and the philosophical implications of software engineering." />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* 
        HERO SECTION - SPLIT LAYOUT 
        Left: Branding (H1/H2)
        Right: Carousel (Featured Articles)
      */}
      <section className="mb-24 flex flex-col lg:grid lg:grid-cols-12 gap-12 items-center min-h-[65vh] relative">

        {/* LEFT COLUMN: Branding & Manifesto */}
        <motion.div
          className="lg:col-span-7 flex flex-col items-start z-10 relative"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block mb-6 font-mono text-sm text-primary tracking-widest uppercase bg-primary/10 px-3 py-1 rounded border border-primary/20">
            // Digital Garden v1.0
          </span>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6 leading-[0.95]">
            {t('home.hero_title').split(' ').slice(0, 1)} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40">
              {t('home.hero_title').split(' ').slice(1).join(' ')}
            </span>
          </h1>
          <h2 className="max-w-xl text-lg md:text-xl text-text-muted font-body leading-relaxed mb-8 border-l-2 border-white/10 pl-6">
            {t('home.hero_subtitle')}
          </h2>

          <div className="hidden lg:block">
            <div className="flex items-center gap-4 text-text-muted/50 font-mono text-xs">
              <div className="h-[1px] w-12 bg-white/20"></div>
              SCROLL_TO_TRANSMISSIONS
              <ArrowDown size={14} className="animate-bounce" />
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Featured Carousel */}
        <div className="lg:col-span-5 w-full h-[500px] lg:h-[600px] relative z-20">
          {mainArticles.length > 0 ? (
            <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10 bg-surface shadow-2xl group">
              {/* Carousel Slides */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentHeroIndex}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0"
                >
                  <img
                    src={currentHeroArticle.imageUrl}
                    alt={heroTitle}
                    className="w-full h-full object-cover opacity-70"
                  />
                  {/* Gradient Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
                </motion.div>
              </AnimatePresence>

              {/* Carousel Content (Inside Card) */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <motion.div
                  key={`content-${currentHeroIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-primary font-mono text-xs tracking-wider uppercase bg-black/50 backdrop-blur-md px-2 py-1 rounded border border-white/10">
                      {currentHeroArticle.category}
                    </span>
                    <span className="text-white/60 font-mono text-xs">
                      {currentHeroIndex + 1} / {mainArticles.length}
                    </span>
                  </div>

                  <Link to={`/article/${currentHeroArticle.id}`} className="group/link block">
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight mb-3 group-hover/link:underline decoration-1 underline-offset-4 transition-all">
                      {heroTitle}
                    </h3>
                  </Link>

                  <p className="font-body text-text-muted text-sm line-clamp-2 mb-6">
                    {heroExcerpt}
                  </p>

                  {/* Carousel Controls */}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      onClick={prevSlide}
                      className="!p-2 !rounded-full bg-white/5 hover:bg-white/20 border border-white/5"
                    >
                      <ChevronLeft size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={nextSlide}
                      className="!p-2 !rounded-full bg-white/5 hover:bg-white/20 border border-white/5"
                    >
                      <ChevronRight size={18} />
                    </Button>
                    <Link to={`/article/${currentHeroArticle.id}`} className="ml-auto">
                      <Button className="!px-4 !py-2 !text-xs gap-2">
                        {t('home.read_more')} <ArrowUpRight size={14} />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          ) : (
            // Fallback decorative box if no main articles
            <div className="w-full h-full rounded-3xl border border-white/10 bg-white/5 flex items-center justify-center">
              <p className="font-mono text-text-muted text-sm">NO_SIGNAL_FOUND</p>
            </div>
          )}
        </div>
      </section>

      {/* Filter & Search Bar (Sticky) */}
      <section className="mb-12 sticky top-24 z-30 py-4 -mx-4 px-4 bg-background/80 backdrop-blur-xl border-y border-white/5 md:static md:bg-transparent md:border-none md:p-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

          {/* Categories */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-4 order-2 md:order-1 flex-1">
            <div className="flex items-center gap-2 text-white/50 pr-4 border-r border-white/10 hidden md:flex shrink-0">
              <Filter size={14} />
              <span className="font-mono text-xs tracking-wider">{t('home.filter')}</span>
            </div>

            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  relative px-4 py-2 md:px-5 rounded-full font-mono text-xs tracking-wider transition-all duration-300 whitespace-nowrap border shrink-0
                  ${selectedCategory === category
                    ? 'bg-white text-black border-white shadow-[0_0_20px_-5px_rgba(255,255,255,0.5)] scale-105 z-10'
                    : 'bg-white/5 text-text-muted border-white/5 hover:border-white/20 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64 lg:w-80 group order-1 md:order-2 shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-focus-within:opacity-100 blur-md transition-opacity duration-500" />
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-2 focus-within:bg-black/80 focus-within:border-white/20 transition-all duration-300">
              <Search size={14} className="text-text-muted group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('home.search_placeholder')}
                className="w-full bg-transparent border-none focus:ring-0 text-sm font-mono text-white placeholder-white/20 px-3 py-0.5 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-text-muted hover:text-white transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <section>
        <div className="flex items-end justify-between mb-8 border-b border-white/10 pb-4">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
            {searchQuery
              ? `${t('home.search_results')}: "${searchQuery}"`
              : (selectedCategory === 'ALL' ? t('home.latest_transmissions') : `${selectedCategory} ${t('home.archives')}`)
            }
          </h2>
          <span className="font-mono text-xs text-text-muted">
            {t('home.found_nodes', { count: filteredArticles.length })}
          </span>
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode='popLayout'>
            {filteredArticles.map((article, index) => {
              // Bento Grid Logic
              const isSearching = !!searchQuery;
              const isFeatured = index === 0 && !isSearching;
              const spanClass = isFeatured ? "md:col-span-2 lg:col-span-2" : "col-span-1";

              return (
                <ArticleCard
                  key={article.id}
                  article={article}
                  className={spanClass}
                />
              );
            })}
          </AnimatePresence>

          {filteredArticles.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/5">
              <Search size={48} className="text-white/10 mb-4" />
              <p className="font-mono text-text-muted text-lg">{t('home.no_results')}</p>
              <p className="text-sm text-text-muted/50 mt-2">{t('home.adjust_filters')}</p>
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
};