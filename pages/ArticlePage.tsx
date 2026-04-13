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

  const handleWhatsAppShare = () => {
    const url = window.location.href;
    const text = `${article?.title}\n\n${article?.excerpt}\n\n${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
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
        <meta property="og:site_name" content="Portal DPE" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        {article.imageUrl && <meta property="og:image" content={article.imageUrl} />}
        {article.imageUrl && <meta property="og:image:width" content="1200" />}
        {article.imageUrl && <meta property="og:image:height" content="630" />}
        {article.imageUrl && <meta property="og:image:alt" content={article.title} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt} />
        {article.imageUrl && <meta name="twitter:image" content={article.imageUrl} />}
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
            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
              {article.categories?.map(cat => (
                <span key={cat} className="px-3 py-1 rounded-full bg-azure-600 text-white text-xs font-bold tracking-widest uppercase">
                  {cat}
                </span>
              ))}
            </div>
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
            <div className="flex flex-wrap gap-3 justify-center">
              {/* Botão WhatsApp */}
              <button
                onClick={handleWhatsAppShare}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#25D366] hover:bg-[#1da851] text-white text-sm font-semibold tracking-tight transition-all duration-300 shadow-md shadow-green-500/20 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                WhatsApp
              </button>

              {/* Botão copiar link / compartilhar nativo */}
              <Button
                onClick={handleShare}
                variant={copied ? "outline" : "outline"}
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
                    Copiar link
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