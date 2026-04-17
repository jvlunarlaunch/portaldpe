import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Flag, Users, Newspaper, Zap, Check, Heart, History, TrendingUp } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/Button';
import { MembershipModal } from '../components/ui/MembershipModal';

export const About: React.FC = () => {
  const [isMembershipOpen, setIsMembershipOpen] = React.useState(false);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const pillars = [
    { icon: Shield, label: 'Valores', text: 'Defesa da família, da propriedade privada e da liberdade individual.' },
    { icon: Flag, label: 'Patriotismo', text: 'Amor por Pernambuco e pelo Brasil acima de tudo.' },
    { icon: Newspaper, label: 'Verdade', text: 'Informação sem as amarras do politicamente correto.' },
    { icon: Users, label: 'Comunidade', text: 'Unindo forças para um Pernambuco mais próspero e livre.' },
  ];

  const milestones = [
    {
      year: '2014',
      title: 'A Gênese Conservadora',
      desc: 'O despertar do movimento em Pernambuco sob a influência de Olavo de Carvalho, rompendo o silêncio ideológico.'
    },
    {
      year: '2016',
      title: 'O Poder das Ruas',
      desc: 'Protagonismo no impeachment e nas históricas recepções a Jair Bolsonaro no Nordeste, mudando o eixo político.'
    },
    {
      year: '2018',
      title: 'A Consolidação',
      desc: 'Braço forte na linha de frente da campanha presidencial, defendendo pautas conservadoras de base.'
    },
    {
      year: '2020',
      title: 'Combate ao PSB',
      desc: 'Oposição firme ao PSB em Pernambuco, combatendo o estatismo e defendendo as liberdades individuais.'
    },
    {
      year: '2022',
      title: 'Espaço na Política',
      desc: 'Consolidação como motor de mobilização em eleições decisivas, reafirmando os valores da direita cristã.'
    },
  ];

  return (
    <div className="w-full bg-[#fbfbfd]">
      <Helmet>
        <title>Quem Somos | Portal DPE</title>
        <meta name="description" content="Conheça a missão e os valores do maior portal conservador de Pernambuco: Portal DPE." />
      </Helmet>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-azure-50/50 -skew-x-12 transform origin-top-right -z-10"></div>
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-20 h-20 rounded-2xl shadow-xl shadow-azure-600/20 mb-8 overflow-hidden"
          >
            <img src="/logo.png" alt="Logo Portal DPE" className="w-full h-full object-contain" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight max-w-4xl"
          >
            Nossa missão é levar a <span className="text-azure-600 underline decoration-azure-100 underline-offset-8">vontade do povo</span> à frente.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed mb-10"
          >
            O Portal DPE nasceu da necessidade de uma informação livre,
            comprometido com os valores que fundaram nossa nação.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-4"
          >
            <Button size="lg">Seja Membro</Button>
            <Button variant="outline" size="lg">Nossas Notícias</Button>
          </motion.div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-24 bg-white border-y border-slate-100 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {pillars.map((pillar, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="flex flex-col items-center md:items-start text-center md:text-left"
              >
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-azure-600 mb-6 group-hover:bg-azure-600 group-hover:text-white transition-colors">
                  <pillar.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{pillar.label}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{pillar.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Manifesto / Long Text */}
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <div className="flex flex-col gap-12 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Por que existimos?</h2>
          <div className="prose prose-lg prose-slate max-w-none text-slate-600 font-light leading-loose">
            <p className="mb-8">
              Fundado em 2014 e inspirado pela filosofia de Olavo de Carvalho, o Movimento Direita Pernambuco nasceu como o primeiro grupo de militância conservadora do estado. Surgimos para romper a hegemonia de esquerda, resgatando o protagonismo da direita no cenário político e social brasileiro.
            </p>
            <p>
              Sob a liderança de Mateus Henrique, fomos pioneiros nas grandes mobilizações pelo impeachment e nas históricas recepções a Jair Bolsonaro. Nossa base é formada por cidadãos que dedicam sua atuação à defesa da civilização ocidental, da ordem e dos valores inegociáveis.
            </p>
            <div className="my-12 p-8 bg-slate-50 rounded-3xl border-l-4 border-azure-600 flex gap-6">
              <Heart className="text-azure-600 shrink-0 mt-1" />
              <p className="text-slate-700 italic font-medium m-0">
                "A cultura precede a política e a tradição é a democracia dos mortos."
              </p>
            </div>
            <p>
              Defendemos a vida, a família, o direito à autodefesa e a liberdade econômica com mínima interferência estatal. Somos a resistência contra propostas revolucionárias que ameaçam o nosso tecido social.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline / Journey */}
      <section className="py-24 bg-slate-900 text-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Nossa Jornada</h2>
              <p className="text-slate-400">Marcos históricos do movimento.</p>
            </div>
            <TrendingUp className="text-azure-500 w-12 h-12 opacity-50" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {milestones.map((m, idx) => (
              <div key={idx} className="relative pt-8 border-t border-slate-800">
                <div className="absolute top-0 -translate-y-1/2 w-4 h-4 bg-azure-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                <span className="text-azure-400 font-bold font-mono text-sm mb-2 block">{m.year}</span>
                <h4 className="text-xl font-bold mb-3">{m.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-azure-600 to-indigo-700 rounded-[3rem] p-12 md:p-20 text-white shadow-2xl shadow-azure-900/40 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
          <h2 className="text-3xl md:text-5xl font-bold mb-8 relative z-10">Faça parte desta história.</h2>
          <p className="text-azure-100 text-lg md:text-xl mb-12 relative z-10 max-w-xl mx-auto">
            Sua ajuda é fundamental para mantermos nossa independência e continuarmos levando a verdade a todos.
          </p>
          <div className="flex justify-center relative z-10">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setIsMembershipOpen(true)}
            >
              Seja Membro
            </Button>
          </div>
        </div>
      </section>

      <MembershipModal
        isOpen={isMembershipOpen}
        onClose={() => setIsMembershipOpen(false)}
      />

    </div>
  );
};