import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock, Calendar, Tag, Share2, Check, Loader2 } from 'lucide-react';
import { fetchArticleBySlug, fetchRelatedArticles } from '../api';
import { Article } from '../types';
import { Button } from '../components/ui/Button';
import { useLoading } from '../context/LoadingContext';
import { ArticleCard } from '../components/ui/ArticleCard';

export const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { setIsNavigating } = useLoading();
  const [article, setArticle] = useState<Article | null>(location.state?.preloadedArticle || null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(!location.state?.preloadedArticle);
  const [copied, setCopied] = useState(false);

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
      if (!article || article.slug !== slug) {
        setLoading(true);
        if (slug) {
          const fetchedArticle = await fetchArticleBySlug(slug);
          setArticle(fetchedArticle);

          if (fetchedArticle) {
            const related = await fetchRelatedArticles(fetchedArticle.id);
            setRelatedArticles(related as Article[]);
          }
        }
        setLoading(false);
      } else if (relatedArticles.length === 0 && article) {
        const related = await fetchRelatedArticles(article.id);
        setRelatedArticles(related as Article[]);
      }
      window.scrollTo(0, 0);
    };
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-white">
        <Loader2 className="animate-spin text-azure-600" size={40} />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 bg-white px-4 text-center">
        <Helmet>
          <title>Artigo não encontrado | Portal DPE</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <h2 className="text-2xl font-bold mb-4 text-slate-900">Artigo não encontrado</h2>
        <Link to="/"><Button>Voltar ao Início</Button></Link>
      </div>
    );
  }
  return (
    <article className="min-h-screen w-full bg-white pt-32 md:pt-40 pb-24">
      <Helmet>
        <title>{article.title} | Portal DPE</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        {article.imageUrl && <meta property="og:image" content={article.imageUrl} />}
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="max-w-3xl mx-auto px-6">
        {/* Breadcrumb / Back button */}
        <div className="mb-8 flex justify-center md:justify-start">
          <Link to="/">
            <button className="flex items-center gap-2 text-slate-400 hover:text-azure-600 transition-colors font-medium text-sm group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Voltar para as notícias
            </button>
          </Link>
        </div>

        {/* Header Info */}
        <div className="text-center md:text-left mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 mb-6 justify-center md:justify-start"
          >
            <span className="px-3 py-1 rounded-full bg-azure-600 text-white text-xs font-bold tracking-widest uppercase">
              {article.category}
            </span>
            <span className="text-slate-500 text-xs font-medium tracking-wide uppercase flex items-center gap-1.5">
              <Clock size={12} />
              {article.readTime}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-slate-900 leading-tight tracking-tight"
          >
            {article.title}
          </motion.h1>

          {/* Subtitle / Excerpt */}
          <p className="text-xl md:text-2xl text-slate-500 font-normal leading-relaxed mb-8">
            {article.excerpt}
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center md:justify-start gap-4"
          >
            {article.showAuthor && (
              article.author?.avatarUrl ? (
                <img src={article.author.avatarUrl} alt={article.author.name} className="w-12 h-12 rounded-full border border-slate-200" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-azure-100 flex items-center justify-center font-bold text-azure-700">
                  {article.author?.name?.charAt(0) || 'D'}
                </div>
              )
            )}
            <div className="text-left">
              <p className="text-base font-bold text-slate-900 leading-none mb-1">
                {article.showAuthor ? (article.author?.name || 'Redação') : 'Redação Portal DPE'}
              </p>
              <p className="text-xs text-slate-500 capitalize">
                {article.date}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Main Image */}
        {article.imageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full mb-16 rounded-3xl overflow-hidden shadow-xl shadow-slate-200"
          >
            <img src={article.imageUrl} alt={article.title} className="w-full h-auto object-cover" />
          </motion.div>
        )}

        {/* Content Body */}
        <div
          className="prose prose-lg prose-slate max-w-none
          prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900
          prose-p:text-slate-600 prose-p:leading-loose prose-p:font-light
          prose-a:text-azure-600 prose-a:font-medium prose-a:no-underline hover:prose-a:text-azure-700
          prose-strong:font-bold prose-strong:text-slate-900
          prose-img:rounded-3xl prose-img:shadow-xl prose-img:my-12
          marker:text-azure-500 tiptap"
          dangerouslySetInnerHTML={{ __html: article.content || '<p>Conteúdo não disponível.</p>' }}
        />

        {/* Footer Actions */}
        <div className="mt-24 pt-10 border-t border-slate-100 flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-4">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Compartilhe este artigo</span>
            <div className="flex gap-4">
              <Button
                onClick={handleShare}
                variant={copied ? "outline" : "primary"}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check size={18} />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Share2 size={18} />
                    Compartilhar
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Author Block */}
          {article.showAuthor && (
            <div className="w-full bg-slate-50 rounded-3xl p-8 flex flex-col md:flex-row items-center md:items-start gap-6 mt-8">
              {article.author?.avatarUrl ? (
                <img src={article.author.avatarUrl} alt={article.author.name} className="w-20 h-20 rounded-full shadow-lg" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-400">
                  {article.author?.name?.charAt(0) || 'D'}
                </div>
              )}
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{article.author?.name || 'Redação Portal DPE'}</h3>
                <p className="text-slate-500 leading-relaxed text-sm italic">
                  {article.author?.bio || 'Compromisso com a verdade e a defesa da liberdade em Pernambuco.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-24">
            <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">Leituras Relacionadas</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map(related => (
                <ArticleCard
                  key={related.id}
                  article={related}
                  variant="standard"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};