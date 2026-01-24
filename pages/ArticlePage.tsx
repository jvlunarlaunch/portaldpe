import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next'; // Added import
import { ArrowLeft, Clock, Calendar, Tag, Share2, Bookmark, Loader2, Copy, Check } from 'lucide-react';
import { fetchArticleBySlug, fetchRelatedArticles } from '../api';
import { Article } from '../types';
import { Button } from '../components/ui/Button';
import { useLoading } from '../context/LoadingContext';

export const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { setIsNavigating } = useLoading();
  const [article, setArticle] = useState<Article | null>(location.state?.preloadedArticle || null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(!location.state?.preloadedArticle);
  const [copied, setCopied] = useState(false);
  const { t, i18n } = useTranslation();

  const handleRelatedClick = async (e: React.MouseEvent, relatedSlug: string) => {
    e.preventDefault();
    setIsNavigating(true);
    try {
      const startTime = Date.now();
      const fetchedArticle = await fetchArticleBySlug(relatedSlug);
      const endTime = Date.now();

      if (endTime - startTime < 400) {
        await new Promise(resolve => setTimeout(resolve, 400 - (endTime - startTime)));
      }

      setArticle(fetchedArticle); // Update locally for faster feel
      navigate(`/article/${relatedSlug}`, {
        state: { preloadedArticle: fetchedArticle }
      });
    } catch (error) {
      console.error("Failed to pre-load related article", error);
      navigate(`/article/${relatedSlug}`);
    } finally {
      setIsNavigating(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      // If we don't have an article or the slug changed and doesn't match the current article
      if (!article || article.slug !== slug) {
        setLoading(true);
        const targetSlug = slug;
        if (targetSlug) {
          const fetchedArticle = await fetchArticleBySlug(targetSlug);
          setArticle(fetchedArticle);

          if (fetchedArticle) {
            const related = await fetchRelatedArticles(fetchedArticle.id);
            setRelatedArticles(related as Article[]);
          }
        }
        setLoading(false);
      } else if (relatedArticles.length === 0 && article) {
        // We have the article (preloaded) but not the related ones
        const related = await fetchRelatedArticles(article.id);
        setRelatedArticles(related as Article[]);
        setLoading(false);
      }
      window.scrollTo(0, 0);
    };
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 text-white">
        <Helmet>
          <title>{t('article.article_not_found')} | LuxTech</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <h2 className="text-2xl font-bold mb-4">{t('article.article_not_found')}</h2>
        <Link to="/"><Button>{t('article.return_base')}</Button></Link>
      </div>
    );
  }

  const displayTitle = (i18n.language === 'pt' && article.title_pt) ? article.title_pt : article.title;
  const displayExcerpt = (i18n.language === 'pt' && article.excerpt_pt) ? article.excerpt_pt : article.excerpt;
  const displayContent = (i18n.language === 'pt' && article.content_pt) ? article.content_pt : (article.content || '<p>Content is being generated via neural link...</p>');
  const displayDate = article.date; // Date could be formatted by locale locally if needed

  return (
    <article className="relative min-h-screen w-full pt-32 pb-20 px-4 md:px-8">
      <Helmet>
        <title>{displayTitle} | LuxTech</title>
        <meta name="description" content={displayExcerpt} />
        <meta property="og:title" content={displayTitle} />
        <meta property="og:description" content={displayExcerpt} />
        {article.imageUrl && <meta property="og:image" content={article.imageUrl} />}
        <meta property="og:type" content="article" />
      </Helmet>

      {/* Background Glow specifically for article */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-4xl">
        {/* Navigation */}
        <div className="mb-12">
          <Link to="/">
            <Button variant="ghost" className="pl-0 gap-2 text-text-muted hover:text-white">
              <ArrowLeft size={16} />
              <span className="font-mono text-xs">{t('article.back_to_intelligence')}</span>
            </Button>
          </Link>
        </div>

        {/* Header */}
        <header className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap items-center gap-4 mb-6 text-sm"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">
              <Tag size={12} />
              {article.category}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-text-muted">
              <Calendar size={12} />
              {displayDate}
            </span>
            <span className="flex items-center gap-1.5 font-mono text-text-muted">
              <Clock size={12} />
              {article.readTime}
            </span>
            <div className="flex flex-col ml-auto sm:ml-0 gap-1 text-[10px] font-mono text-text-muted/70">
              <span>{t('article.published')}: {displayDate}</span>
              {article.updatedAt && article.updatedAt !== article.date && (
                <span className="text-primary/80">{t('article.updated')}: {article.updatedAt}</span>
              )}
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] text-white tracking-tight mb-8"
          >
            {displayTitle}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-body text-xl md:text-2xl text-text-muted leading-relaxed mb-12 max-w-3xl border-l-2 border-primary/30 pl-6"
          >
            {displayExcerpt}
          </motion.p>

          {article.showThumbnail !== false && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/10 shadow-[0_0_40px_-10px_rgba(124,58,237,0.2)]"
            >
              <img
                src={article.imageUrl}
                alt={displayTitle}
                className="h-full w-full object-cover"
              />
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
            </motion.div>
          )}
        </header>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Main Article Body */}
          <motion.div
            className="lg:col-span-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div
              className="prose prose-invert prose-lg max-w-none tiptap"
              dangerouslySetInnerHTML={{ __html: displayContent }}
            />

            {/* Author Block */}
            <div className="mt-16 border-t border-white/10 pt-10">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px] shrink-0">
                  <div className="h-full w-full rounded-full bg-black overflow-hidden">
                    <img
                      src={article.author?.avatarUrl || "https://picsum.photos/seed/author/200/200"}
                      alt={article.author?.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <div className="font-display text-xl font-bold text-white mb-2 text-center sm:text-left">{article.author?.name || 'LuxTech Architect'}</div>
                  <p className="text-text-muted text-sm leading-relaxed text-center sm:text-left italic">
                    {article.author?.bio || 'Passionate about the intersection of technology and design at LuxTech.'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="sticky top-32 space-y-6">
              <div className="rounded-2xl border border-white/5 bg-surface/50 p-6 backdrop-blur-md">
                <h3 className="font-display text-lg font-bold text-white mb-4">{t('article.share_transmission')}</h3>
                <Button
                  onClick={handleShare}
                  variant={copied ? "ghost" : "secondary"}
                  className={`w-full gap-3 transition-all duration-300 ${copied ? 'text-green-400 bg-green-400/10 border-green-400/20' : ''}`}
                >
                  {copied ? (
                    <>
                      <Check size={18} />
                      <span className="font-mono text-xs">{t('article.link_copied')}</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={18} />
                      <span className="font-mono text-xs">{t('article.transmit_data')}</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="rounded-2xl border border-white/5 bg-surface/50 p-6 backdrop-blur-md">
                <h3 className="font-display text-lg font-bold text-white mb-4">{t('article.related_data')}</h3>
                <div className="space-y-4">
                  {relatedArticles.map(related => {
                    const relatedTitle = (i18n.language === 'pt' && related.title_pt) ? related.title_pt : related.title;
                    return (
                      <div key={related.id} onClick={(e) => handleRelatedClick(e, related.slug)} className="group block cursor-pointer">
                        <div className="text-xs font-mono text-primary mb-1">{related.category}</div>
                        <div className="text-sm text-gray-300 group-hover:text-white transition-colors">
                          {relatedTitle}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </article>
  );
};