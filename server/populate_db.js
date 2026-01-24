const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { initDatabase } = require('./database');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const articles = [
  {
    title: "The Ghost in the Machine: Ethics of Generative AI",
    title_pt: "O Fantasma na Máquina: Ética da IA Generativa",
    excerpt: "Exploring the blurred lines between creation and curation in the age of large language models.",
    excerpt_pt: "Explorando as linhas tênues entre criação e curadoria na era dos grandes modelos de linguagem.",
    category: "ENGINEERING",
    read_time: "7 min read",
    image_url: "https://picsum.photos/seed/ghost/800/600",
    featured: 1,
    main: 1,
    status: 'published',
    content: `
      <h2>The New Creative Frontier</h2>
      <p>As generative AI models become more sophisticated, we face a fundamental question: <strong>Who owns the creativity?</strong></p>
      <p>The implications for copyright, authenticity, and human expression are profound. We are not just building tools; we are building collaborators.</p>
      <blockquote>"Artificial Intelligence is not a replacement for human creativity, but a lever to amplify it."</blockquote>
      <p>However, the ethical considerations cannot be ignored. Bias in training data, the potential for misinformation, and the displacement of repetitive cognitive tasks are challenges we must address head-on.</p>
    `,
    content_pt: `
      <h2>A Nova Fronteira Criativa</h2>
      <p>À medida que os modelos de IA generativa se tornam mais sofisticados, enfrentamos uma questão fundamental: <strong>De quem é a criatividade?</strong></p>
      <p>As implicações para direitos autorais, autenticidade e expressão humana são profundas. Não estamos apenas construindo ferramentas; estamos construindo colaboradores.</p>
      <blockquote>"A Inteligência Artificial não é um substituto para a criatividade humana, mas uma alavanca para amplificá-la."</blockquote>
      <p>No entanto, as considerações éticas não podem ser ignoradas. Viés nos dados de treinamento, o potencial para desinformação e o deslocamento de tarefas cognitivas repetitivas são desafios que devemos enfrentar de frente.</p>
    `
  },
  {
    title: "Optimizing the Critical Rendering Path in 2026",
    title_pt: "Otimizando o Caminho Crítico de Renderização em 2026",
    excerpt: "Web performance techniques have evolved. Learn how to achieve sub-100ms FCP on modern networks.",
    excerpt_pt: "As técnicas de desempenho web evoluíram. Aprenda como atingir FCP abaixo de 100ms em redes modernas.",
    category: "REACT",
    read_time: "10 min read",
    image_url: "https://picsum.photos/seed/perf/800/600",
    featured: 1,
    main: 0,
    status: 'published',
    content: `
      <h2>Beyond Minification</h2>
      <p>In 2026, simply minifying your bundles is table stakes. The real performance gains come from <strong>streaming server components</strong>, intelligent prefetching, and edge-caching strategies.</p>
      <p>We need to stop thinking about pages and start thinking about <em>flows</em>. The user journey should be seamless, with zero layout shifts.</p>
      <pre><code>// Example of an optimized transition structure
      const transition = useTransition();
      // Implementation details...</code></pre>
    `,
    content_pt: `
      <h2>Além da Minificação</h2>
      <p>Em 2026, simplesmente minificar seus bundles é o básico. Os ganhos reais de desempenho vêm de <strong>componentes de servidor via streaming</strong>, pré-carregamento inteligente e estratégias de cache na borda (edge).</p>
      <p>Precisamos parar de pensar em páginas e começar a pensar em <em>fluxos</em>. A jornada do usuário deve ser contínua, sem mudanças repentinas de layout.</p>
      <pre><code>// Exemplo de uma estrutura de transição otimizada
      const transition = useTransition();
      // Detalhes da implementação...</code></pre>
    `
  },
  {
    title: "Zero Trust Architecture: A Paradigm Shift",
    title_pt: "Arquitetura Zero Trust: Uma Mudança de Paradigma",
    excerpt: "Why 'verify, never trust' is the only viable security posture for distributed systems.",
    excerpt_pt: "Por que 'verifique, nunca confie' é a única postura de segurança viável para sistemas distribuídos.",
    category: "BACKEND",
    read_time: "5 min read",
    image_url: "https://picsum.photos/seed/security/800/600",
    featured: 0,
    main: 0,
    status: 'published',
    content: `
      <p>The perimeter is dead. With remote work and cloud-native architectures, we can no longer rely on firewalls to keep bad actors out.</p>
      <p><strong>Zero Trust</strong> assumes that the network is always hostile. Every request, whether from inside or outside, must be authenticated, authorized, and encrypted.</p>
    `,
    content_pt: `
      <p>O perímetro está morto. Com o trabalho remoto e arquiteturas nativas da nuvem, não podemos mais depender de firewalls para manter agentes mal-intencionados fora.</p>
      <p><strong>Zero Trust</strong> assume que a rede é sempre hostil. Toda solicitação, seja interna ou externa, deve ser autenticada, autorizada e criptografada.</p>
    `
  },
  {
    title: "React Native vs Flutter: The Final Verdict",
    title_pt: "React Native vs Flutter: O Veredito Final",
    excerpt: "A comprehensive comparison of the two giants in cross-platform mobile development.",
    excerpt_pt: "Uma comparação abrangente dos dois gigantes no desenvolvimento móvel multiplataforma.",
    category: "ENGINEERING",
    read_time: "8 min read",
    image_url: "https://picsum.photos/seed/mobile/800/600",
    featured: 0,
    main: 0,
    status: 'published',
    content: `
      <p>After years of debate, the ecosystem has settled. Both frameworks have matured, but they serve different masters.</p>
      <p>Use <strong>React Native</strong> if you rely heavily on the JS ecosystem and want seamless over-the-air updates. Use <strong>Flutter</strong> if you need absolute pixel perfection and rendering performance close to metal.</p>
    `,
    content_pt: `
      <p>Após anos de debate, o ecossistema se estabilizou. Ambos os frameworks amadureceram, mas servem a mestres diferentes.</p>
      <p>Use <strong>React Native</strong> se você depende muito do ecossistema JS e deseja atualizações over-the-air perfeitas. Use <strong>Flutter</strong> se você precisa de perfeição absoluta de pixels e desempenho de renderização próximo ao metal.</p>
    `
  },
  {
    title: "Micro-interactions: The Secret to Engagement",
    title_pt: "Micro-interações: O Segredo para o Engajamento",
    excerpt: "How subtle animations and feedback loops create emotional connections with users.",
    excerpt_pt: "Como animações sutis e ciclos de feedback criam conexões emocionais com os usuários.",
    category: "UX",
    read_time: "4 min read",
    image_url: "https://picsum.photos/seed/ux/800/600",
    featured: 1,
    main: 0,
    status: 'published',
    content: `
      <p>It's not just about looking good. It's about feeling right. A button press that <em>feels</em> tactile, a loading state that entertains—these are the details that turn a user into a fan.</p>
      <p>Attention to detail demonstrates respect for the user's time and attention.</p>
    `,
    content_pt: `
      <p>Não se trata apenas de parecer bom. É sobre se sentir certo. Um toque de botão que <em>parece</em> tátil, um estado de carregamento que entretém—esses são os detalhes que transformam um usuário em um fã.</p>
      <p>A atenção aos detalhes demonstra respeito pelo tempo e atenção do usuário.</p>
    `
  },
  {
    title: "Designing for Dark Mode First",
    title_pt: "Projetando para o Modo Escuro Primeiro",
    excerpt: "Color theory adjustments and accessibility concerns when your primary canvas is #050505.",
    excerpt_pt: "Ajustes na teoria das cores e preocupações de acessibilidade quando sua tela principal é #050505.",
    category: "DESIGN",
    read_time: "6 min read",
    image_url: "https://picsum.photos/seed/darkmode/800/600",
    featured: 0,
    main: 0,
    status: 'published',
    content: `
      <p>Dark mode is more than just inverting colors. It requires a fundamental rethink of hierarchy, depth, and saturation.</p>
      <p>Avoid pure black (#000000) to prevent smearing on OLED screens. Use elevation to denote depth instead of shadows.</p>
    `,
    content_pt: `
      <p>O modo escuro é mais do que apenas inverter cores. Requer uma reformulação fundamental da hierarquia, profundidade e saturação.</p>
      <p>Evite preto puro (#000000) para evitar manchas em telas OLED. Use elevação para denotar profundidade em vez de sombras.</p>
    `
  },
  {
    title: "Why TypeScript Won the Web",
    title_pt: "Por que TypeScript Ganhou a Web",
    excerpt: "Tracing the history of type systems in JavaScript and why TS emerged victorious.",
    excerpt_pt: "Traçando a história dos sistemas de tipos no JavaScript e por que o TS saiu vitorioso.",
    category: "ENGINEERING",
    read_time: "12 min read",
    image_url: "https://picsum.photos/seed/ts/800/600",
    featured: 0,
    main: 1,
    status: 'published',
    content: `
      <p>The developer experience benefits of static typing cannot be overstated. Refactoring without fear, self-documenting code, and catching bugs at compile time.</p>
      <p>TypeScript didn't just add types; it added a culture of reliability to the web ecosystem.</p>
    `,
    content_pt: `
      <p>Os benefícios da experiência do desenvolvedor com tipagem estática não podem ser exagerados. Refatoração sem medo, código autodocumentado e captura de bugs em tempo de compilação.</p>
      <p>TypeScript não apenas adicionou tipos; adicionou uma cultura de confiabilidade ao ecossistema da web.</p>
    `
  },
  {
    title: "Glassmorphism: A Deep Dive",
    title_pt: "Glassmorphism: Um Mergulho Profundo",
    excerpt: "Technical breakdown of performance implications when using heavy blur effects.",
    excerpt_pt: "Análise técnica das implicações de desempenho ao usar efeitos de desfoque pesados.",
    category: "DESIGN",
    read_time: "5 min read",
    image_url: "https://picsum.photos/seed/glass/800/600",
    featured: 0,
    main: 0,
    status: 'published',
    content: `
      <p>The frosted glass effect adds a sense of depth and modernity, but at what cost?</p>
      <p>We analyze the GPU rendering cost of <code>backdrop-filter: blur()</code> and how to optimize it for lower-end devices.</p>
    `,
    content_pt: `
      <p>O efeito de vidro fosco adiciona uma sensação de profundidade e modernidade, mas a que custo?</p>
      <p>Analisamos o custo de renderização de GPU do <code>backdrop-filter: blur()</code> e como otimizá-lo para dispositivos de baixo custo.</p>
    `
  }
];

const categoriesMap = {
  'ENGINEERING': 1,
  'DESIGN': 2,
  'BACKEND': 3,
  'REACT': 4,
  'UX': 5
};

async function seed() {
  console.log("Ensuring database tables exist...");
  await new Promise((resolve) => {
    initDatabase();
    // initDatabase uses serialize so we need to wait a bit or better yet, serialize here
    setTimeout(resolve, 1000);
  });

  db.serialize(() => {
    // 1. Clear existing articles
    db.run("DELETE FROM articles", (err) => {
      if (err) console.error("Error clearing articles:", err);
      else console.log("Cleared existing articles.");
    });

    // 3. Insert new articles
    console.log("Inserting new articles...");
    const stmt = db.prepare(`
    INSERT INTO articles (
      title, title_pt, slug, excerpt, excerpt_pt, 
      content, content_pt, category_id, read_time, 
      image_url, featured, main, author_id, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    articles.forEach(article => {
      const slug = article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substr(2, 5);
      const catId = categoriesMap[article.category] || 1;
      const authorId = 1;

      stmt.run(
        article.title, article.title_pt, slug, article.excerpt, article.excerpt_pt,
        article.content, article.content_pt, catId, article.read_time,
        article.image_url, article.featured, article.main, authorId, article.status || 'published',
        (err) => {
          if (err) console.error(`Failed to insert ${article.title}: `, err.message);
          else console.log(`Inserted: ${article.title}`);
        }
      );
    });

    stmt.finalize(() => {
      console.log("Done inserting articles.");
      db.close();
    });
  });
}

seed();
