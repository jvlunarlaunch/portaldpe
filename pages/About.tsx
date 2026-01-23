import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Cpu, Globe, Layers, Zap, Github, Twitter, Mail, ArrowUpRight, History } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/Button';
import { useTranslation } from 'react-i18next'; // Added import

export const About: React.FC = () => {
  const { t } = useTranslation(); // Hook

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const techStack = [
    { icon: Code2, label: 'Frontend', text: t('about.tech_frontend') },
    { icon: Layers, label: 'Styling', text: t('about.tech_styling') },
    { icon: Cpu, label: 'Backend', text: t('about.tech_backend') },
    { icon: Globe, label: 'Deployment', text: t('about.tech_deploy') },
  ];

  const timeline = [
    {
      year: '2024',
      title: t('about.timeline_2024_title'),
      company: t('about.timeline_2024_company'),
      desc: t('about.timeline_2024_desc')
    },
    {
      year: '2022',
      title: t('about.timeline_2022_title'),
      company: t('about.timeline_2022_company'),
      desc: t('about.timeline_2022_desc')
    },
    {
      year: '2019',
      title: t('about.timeline_2019_title'),
      company: t('about.timeline_2019_company'),
      desc: t('about.timeline_2019_desc')
    },
    {
      year: '2016',
      title: 'Hello World',
      company: t('about.timeline_2016_company'),
      desc: t('about.timeline_2016_desc')
    },
  ];

  return (
    <div className="w-full pt-32 pb-20 px-4 md:px-8 max-w-5xl mx-auto">
      <Helmet>
        <title>{t('about.hero_title_1')} {t('about.hero_title_2')} | LuxTech</title>
        <meta name="description" content={t('about.hero_desc')} />
      </Helmet>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-24"
      >
        {/* Profile / Hero Section */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <motion.div variants={itemVariants} className="md:col-span-5 relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-white/10 bg-surface">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=800&q=80"
                alt="Profile"
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-7">
            <span className="inline-block mb-6 font-mono text-sm text-primary tracking-widest uppercase bg-primary/10 px-3 py-1 rounded border border-primary/20">
              {t('about.role_label')}
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {t('about.hero_title_1')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/40">
                {t('about.hero_title_2')}
              </span>
            </h1>
            <p className="font-body text-text-muted text-lg leading-relaxed mb-8">
              {t('about.hero_desc')}
            </p>

            <div className="flex flex-wrap gap-4">
              <Button className="gap-2">
                <Mail size={16} /> {t('about.contact_me')}
              </Button>
              <Button variant="secondary" className="gap-2">
                <Github size={16} /> GitHub
              </Button>
              <Button variant="ghost" className="gap-2">
                <Twitter size={16} /> @luxtech_dev
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Stats Grid */}
        <motion.section variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t('about.stat_years'), value: '08+' },
            { label: t('about.stat_projects'), value: '42' },
            { label: t('about.stat_contributions'), value: '1.2k' },
            { label: t('about.stat_coffee'), value: '∞' },
          ].map((stat, i) => (
            <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm text-center hover:bg-white/10 transition-colors">
              <div className="font-display text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="font-mono text-xs text-text-muted uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </motion.section>

        {/* Timeline / Journey Section */}
        <section>
          <motion.div variants={itemVariants} className="mb-12 flex items-center gap-3 border-b border-white/10 pb-4">
            <History className="text-primary" size={24} />
            <h2 className="font-display text-3xl font-bold text-white">{t('about.journey_title')}</h2>
          </motion.div>

          <div className="relative border-l border-white/10 ml-3 md:ml-6 space-y-12 pb-4">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative pl-8 md:pl-12 group"
              >
                {/* Timeline Dot */}
                <div className="absolute -left-[5px] top-2 h-2.5 w-2.5 rounded-full bg-black border border-primary shadow-[0_0_12px_rgba(124,58,237,0.6)] group-hover:scale-125 transition-transform duration-300" />

                {/* Content */}
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-2">
                  <span className="font-mono text-primary text-sm font-bold tracking-wider">{item.year}</span>
                  <h3 className="font-display text-xl font-bold text-white group-hover:text-primary transition-colors duration-300">
                    {item.title}
                  </h3>
                  <span className="font-mono text-xs text-text-muted bg-white/5 px-2 py-0.5 rounded border border-white/5">
                    {item.company}
                  </span>
                </div>
                <p className="font-body text-text-muted text-sm leading-relaxed max-w-2xl border-l-2 border-transparent pl-0 group-hover:border-white/5 group-hover:pl-4 transition-all duration-300">
                  {item.desc}
                </p>
              </motion.div>
            ))}

            {/* Fade out bottom of line */}
            <div className="absolute bottom-0 left-[-1px] h-20 w-0.5 bg-gradient-to-b from-white/10 to-transparent" />
          </div>
        </section>

        {/* The Arsenal (Tech Stack) */}
        <section>
          <motion.div variants={itemVariants} className="mb-10 flex items-end justify-between border-b border-white/10 pb-4">
            <h2 className="font-display text-3xl font-bold text-white">{t('about.arsenal_title')}</h2>
            <span className="font-mono text-xs text-text-muted">CURRENT_STACK_V2.0</span>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {techStack.map((tech, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-surface p-8 transition-all hover:border-primary/30"
              >
                <div className="absolute right-0 top-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight size={20} className="text-primary" />
                </div>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <tech.icon size={24} />
                </div>
                <h3 className="mb-2 font-display text-xl font-bold text-white">{tech.label}</h3>
                <p className="font-mono text-sm text-text-muted">{tech.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Manifesto */}
        <motion.section variants={itemVariants} className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-surface to-black p-8 md:p-12 overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-secondary/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 text-secondary">
              <Zap size={20} />
              <span className="font-mono text-sm tracking-widest uppercase">{t('about.philosophy_label')}</span>
            </div>
            <blockquote className="font-display text-2xl md:text-4xl font-bold text-white leading-tight mb-8 max-w-3xl">
              "{t('about.philosophy_quote')}"
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="font-mono text-xs text-text-muted">END_OF_FILE</span>
            </div>
          </div>
        </motion.section>

      </motion.div>
    </div>
  );
};