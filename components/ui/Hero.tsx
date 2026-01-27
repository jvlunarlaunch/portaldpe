import React from 'react';
import { Article } from '../../types';
import { ArticleCard } from './ArticleCard';
import { Button } from './Button';

interface HeroProps {
    articles: Article[];
    onOpenMembership: () => void;
}

export const Hero: React.FC<HeroProps> = ({ articles, onOpenMembership }) => {
    if (!articles || articles.length === 0) return null;

    const mainPost = articles[0];
    const sidePosts = articles.slice(1, 3); // Gets 2nd and 3rd posts

    return (
        <section className="pt-28 md:pt-32 pb-0 mb-10 md:mb-12 px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
                {/* Section Title */}
                <div className="flex items-center gap-2 mb-6">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                    <h2 className="text-xs font-bold tracking-widest uppercase text-slate-500">Em Destaque</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 h-auto lg:h-[500px]">
                    {/* Main Headline - Takes 2 cols */}
                    <div className="lg:col-span-2 h-auto min-h-[400px] lg:h-full">
                        <ArticleCard
                            article={mainPost}
                            variant="featured"
                            className="h-full"
                        />
                    </div>

                    {/* Secondary Headlines - Takes 1 col, stacked. */}
                    <div className="flex flex-col gap-4 md:gap-6 h-auto lg:h-full">
                        {sidePosts.map((article) => (
                            <div key={article.id} className="bg-white rounded-2xl p-2 border border-slate-100 hover:border-azure-100 transition-colors">
                                <ArticleCard
                                    article={article}
                                    variant="compact"
                                    className="items-center"
                                />
                            </div>
                        ))}

                        {/* Membership Box */}
                        <div
                            onClick={onOpenMembership}
                            className="flex-1 bg-slate-900 rounded-2xl p-6 flex flex-col justify-center items-start text-white relative overflow-hidden group cursor-pointer min-h-[160px] hover:scale-[1.02] transition-transform duration-300"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-azure-500 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative z-10 flex items-center gap-2 mb-2">
                                <span className="w-2 h-2 rounded-full bg-azure-400"></span>
                                <span className="text-azure-400 font-bold text-xs uppercase tracking-widest">Exclusivo</span>
                            </div>
                            <h3 className="font-bold text-lg mb-1 relative z-10">Seja Membro</h3>
                            <p className="text-sm text-slate-400 mb-4 relative z-10 line-clamp-2">Junte-se à nossa comunidade e fortaleça o movimento.</p>
                            <span className="text-xs font-bold text-white bg-azure-600 px-4 py-2 rounded-full group-hover:bg-azure-500 transition-colors relative z-10">Quero Ser Membro &rarr;</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
