import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Article } from '../../types';
import { useLoading } from '../../context/LoadingContext';
import { fetchArticleBySlug } from '../../api';

interface ArticleCardProps {
  article: Article;
  variant?: 'standard' | 'compact' | 'featured' | 'minimal';
  className?: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, variant = 'standard', className = '' }) => {
  const navigate = useNavigate();
  const { setIsNavigating } = useLoading();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsNavigating(true);
    try {
      const startTime = Date.now();
      const fetchedArticle = await fetchArticleBySlug(article.slug);
      const endTime = Date.now();

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

  if (variant === 'featured') {
    return (
      <div
        onClick={handleClick}
        className={`group cursor-pointer relative overflow-hidden rounded-3xl h-full min-h-[400px] w-full ${className}`}
      >
        <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/30 transition-colors z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-20"></div>
        <img
          src={article.imageUrl}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 p-6 md:p-8 z-30 w-full md:w-3/4">
          <span className="inline-block px-3 py-1 bg-azure-600 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-full mb-3 md:mb-4 shadow-lg shadow-azure-900/20">
            {article.category}
          </span>
          <h2 className="text-2xl md:text-3xl lg:text-5xl font-bold text-white mb-2 md:mb-3 leading-tight drop-shadow-sm">
            {article.title}
          </h2>
          <p className="text-slate-200 text-sm md:text-lg line-clamp-2 md:line-clamp-3 leading-relaxed drop-shadow-sm font-medium">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-3 mt-4 text-white/90 text-xs md:text-sm font-medium">
            <span>{article.showAuthor ? (article.author?.name || 'Redação') : 'Redação Portal DPE'}</span>
            <span className="w-1 h-1 bg-white/50 rounded-full"></span>
            <span>{article.date}</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        onClick={handleClick}
        className={`group cursor-pointer flex gap-3 md:gap-4 items-start ${className}`}
      >
        <div className="w-20 h-20 md:w-32 md:h-24 flex-shrink-0 overflow-hidden rounded-xl">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>
        <div className="flex flex-col flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold text-azure-600 uppercase tracking-wider">{article.category}</span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">{article.date}</span>
          </div>
          <h3 className="text-sm md:text-base font-semibold text-slate-900 leading-snug group-hover:text-azure-600 transition-colors line-clamp-3">
            {article.title}
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`group cursor-pointer flex flex-col h-full bg-white transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      <div className="relative overflow-hidden rounded-3xl aspect-[3/2] mb-4">
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2 py-1 bg-white/95 backdrop-blur rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-900 shadow-sm">
            {article.category}
          </span>
        </div>
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-col flex-grow">
        <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
          <span>{article.date}</span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span>{article.readTime}</span>
        </div>
        <h3 className="font-bold text-lg md:text-xl text-slate-900 mb-2 leading-tight group-hover:text-azure-600 transition-colors">
          {article.title}
        </h3>
        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">
          {article.excerpt}
        </p>
        <div className="mt-auto flex items-center gap-2">
          {article.showAuthor ? (
            <>
              {article.author?.avatarUrl ? (
                <img src={article.author.avatarUrl} alt={article.author.name} className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                  {article.author?.name?.charAt(0) || 'D'}
                </div>
              )}
              <span className="text-xs font-medium text-slate-700">{article.author?.name || 'Redação'}</span>
            </>
          ) : (
            <span className="text-xs font-medium text-slate-700">Redação Portal DPE</span>
          )}
        </div>
      </div>
    </div>
  );
};