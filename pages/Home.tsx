import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, X, Loader2, MessageSquare } from 'lucide-react';
import { ArticleCard } from '../components/ui/ArticleCard';
import { Hero } from '../components/ui/Hero';
import { fetchArticles } from '../api';
import { Article } from '../types';
import { MembershipModal } from '../components/ui/MembershipModal';

export const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMembershipOpen, setIsMembershipOpen] = useState(false);

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

  // Extract unique categories and add 'Todos'
  const categoriesList = ['Todos', ...Array.from(new Set(articles.map(a => a.category)))];

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'Todos' || article.category === selectedCategory;

    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Featured articles for Hero
  const featuredArticles = articles.filter(a => a.main).slice(0, 3);
  // If no main articles, just take the latest 3
  const heroArticles = featuredArticles.length > 0 ? featuredArticles : articles.slice(0, 3);

  // Feed articles (excluding hero articles if on homepage/All)
  const feedArticles = selectedCategory === 'Todos' && !searchQuery
    ? filteredArticles.filter(a => !heroArticles.find(h => h.id === a.id))
    : filteredArticles;

  const opinionArticles = articles.filter(a => a.category?.toLowerCase() === 'opinião' || a.category?.toLowerCase() === 'coluna').slice(0, 5);
  const trendingArticles = articles.slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-[#fbfbfd]">
        <Loader2 className="animate-spin text-azure-600" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      <Helmet>
        <title>Portal DPE | Verdade e Liberdade</title>
        <meta name="description" content="O maior portal conservador de Pernambuco. Compromisso com a verdade e os valores tradicionais do Portal DPE." />
      </Helmet>

      <MembershipModal isOpen={isMembershipOpen} onClose={() => setIsMembershipOpen(false)} />

      <main className="w-full">
        {/* Hero Section - Only on main view with no filter/search */}
        {selectedCategory === 'Todos' && !searchQuery && (
          <Hero
            articles={heroArticles}
            onOpenMembership={() => setIsMembershipOpen(true)}
          />
        )}

        <section className={`max-w-7xl mx-auto px-4 md:px-6 pb-24 ${selectedCategory !== 'Todos' || searchQuery ? "pt-32 md:pt-40" : ""}`}>

          {/* Category Nav & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12 border-b border-slate-200 pb-6">
            <div className="flex overflow-x-auto no-scrollbar items-center gap-2">
              {categoriesList.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-500 hover:text-azure-600 hover:bg-slate-100'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <div className="relative flex items-center bg-white border border-slate-200 rounded-full px-4 py-2 focus-within:border-azure-400 transition-all duration-300 shadow-sm">
                <Search size={16} className="text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar notícias..."
                  className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-900 placeholder-slate-400 px-3 py-0.5 focus:outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Main Content Column */}
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                  {searchQuery ? "Resultados da busca" : (selectedCategory === "Todos" ? "Últimas Notícias" : selectedCategory)}
                </h2>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium hidden sm:block">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {feedArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    variant="standard"
                  />
                ))}
              </div>

              {feedArticles.length === 0 && (
                <div className="py-20 text-center text-slate-400 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  Sem notícias nesta categoria no momento.
                </div>
              )}

              {feedArticles.length > 0 && (
                <div className="mt-12 text-center">
                  <button className="px-8 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all text-sm shadow-sm">
                    Carregar Mais Notícias
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar Column */}
            <aside className="lg:col-span-4 space-y-12">

              {/* Opinion Widget */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-900">
                  <MessageSquare className="w-5 h-5 text-azure-600" />
                  Opinião & Análise
                </h3>
                <div className="flex flex-col gap-1">
                  {opinionArticles.length > 0 ? opinionArticles.map(article => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      variant="compact"
                      className="py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 rounded-xl px-2 -mx-2 transition-colors"
                    />
                  )) : (
                    <p className="text-sm text-slate-400">Nenhum artigo de opinião recente.</p>
                  )}
                </div>
                <button className="w-full mt-4 text-center text-xs font-bold text-azure-600 hover:text-azure-700 py-2 uppercase tracking-wider">
                  Ver todos os colunistas
                </button>
              </div>

              {/* Trending Widget */}
              <div>
                <h3 className="font-bold text-lg mb-6 text-slate-900">Mais Lidas</h3>
                <div className="flex flex-col">
                  {trendingArticles.map((article, index) => (
                    <Link to={`/article/${article.slug}`} key={article.id} className="flex gap-4 items-center py-4 border-b border-slate-100 group cursor-pointer hover:bg-slate-50 transition-colors px-2 -mx-2 rounded-lg">
                      <span className="text-2xl md:text-3xl font-bold text-slate-200 group-hover:text-azure-300 transition-colors font-serif italic shrink-0 w-8">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-azure-600 uppercase mb-1 block">{article.category}</span>
                        <h4 className="text-sm font-semibold text-slate-800 group-hover:text-azure-600 transition-colors line-clamp-2 leading-snug">
                          {article.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Join CTA */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-azure-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
                <h3 className="font-bold text-xl mb-3 relative z-10">Faça Parte</h3>
                <p className="text-sm text-slate-300 mb-6 relative z-10 leading-relaxed">
                  Ajude a construir o maior portal conservador de Pernambuco.
                </p>
                <button
                  onClick={() => setIsMembershipOpen(true)}
                  className="w-full py-4 bg-azure-600 hover:bg-azure-500 rounded-full font-bold text-sm transition-all shadow-lg shadow-azure-900/50 relative z-10 active:scale-95"
                >
                  Quero Ser Membro
                </button>
              </div>

            </aside>
          </div>
        </section>
      </main>
    </div>
  );
};