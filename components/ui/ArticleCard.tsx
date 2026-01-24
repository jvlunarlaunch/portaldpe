import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Article } from '../../types';
import { useLoading } from '../../context/LoadingContext';
import { fetchArticleBySlug } from '../../api';

interface ArticleCardProps {
  article: Article;
  className?: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, className = '' }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { setIsNavigating } = useLoading();

  const displayTitle = (i18n.language === 'pt' && article.title_pt) ? article.title_pt : article.title;
  const displayExcerpt = (i18n.language === 'pt' && article.excerpt_pt) ? article.excerpt_pt : article.excerpt;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigating(true);
    try {
      // Small artificial delay for premium feel if loading is too fast
      const startTime = Date.now();
      const fetchedArticle = await fetchArticleBySlug(article.slug);
      const endTime = Date.now();

      // Ensure loader visible for at least 400ms for visual feedback
      if (endTime - startTime < 400) {
        await new Promise(resolve => setTimeout(resolve, 400 - (endTime - startTime)));
      }

      navigate(`/article/${article.slug}`, {
        state: { preloadedArticle: fetchedArticle }
      });
    } catch (error) {
      console.error("Failed to pre-load article", error);
      navigate(`/article/${article.slug}`);
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <div onClick={handleClick} className={`block h-full cursor-pointer ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="group relative flex flex-col h-full overflow-hidden rounded-3xl bg-surface border border-white/5 p-6 transition-all duration-300 hover:border-white/10"
      >
        {/* Inner Top Light Highlight */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" />

        {/* Hover Background Glow */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 transition-opacity duration-500 group-hover:from-primary/5 group-hover:to-secondary/5 opacity-0 group-hover:opacity-100" />

        {/* Image Area */}
        <div className="relative mb-6 h-48 w-full flex-none overflow-hidden rounded-2xl bg-white/5">
          <img
            src={article.imageUrl}
            alt={displayTitle}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs font-mono text-white backdrop-blur-md">
              {article.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-primary">{article.date}</span>
              <div className="flex items-center gap-1 text-xs text-text-muted">
                <Clock size={12} />
                <span>{article.readTime}</span>
              </div>
            </div>

            <h3 className="mb-3 font-display text-xl font-bold leading-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-colors">
              {displayTitle}
            </h3>

            <p className="font-body text-sm leading-relaxed text-text-muted line-clamp-3">
              {displayExcerpt}
            </p>
          </div>

          {/* Footer / Action */}
          <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
            <span className="font-mono text-xs text-text-muted group-hover:text-white transition-colors">
              READ_ARTICLE
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white transition-all duration-300 group-hover:bg-white group-hover:text-black">
              <ArrowUpRight size={16} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};