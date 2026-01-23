import { Article } from "./types";

export const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'The Future of AI Interfaces in Web Development',
    excerpt: 'How Large Language Models are reshaping the way we construct user interfaces and the paradox of generated code.',
    category: 'ENGINEERING',
    readTime: '5 min',
    date: 'OCT 24',
    imageUrl: 'https://picsum.photos/seed/ai-tech/800/600',
    featured: true,
    main: true,
    content: `
      <p>In a world where digital interfaces are becoming increasingly complex, the need for <strong>simplification through intelligent design</strong> has never been more critical. We are standing on the precipice of a new era in frontend architecture.</p>
      
      <h2>The Paradox of Generated Interfaces</h2>
      
      <p>As we integrate more Large Language Models into our development workflows, the code we ship is becoming less human-readable but more machine-optimized. This creates a dichotomy: <em>how do we maintain the soul of the software?</em></p>

      <pre><code class="language-javascript">const NeuralInterface = ({ data }) => {
  // The bridge between biological and digital
  const opacity = useTransform(
    data.synapse, 
    [0, 1], 
    [0.2, 1.0]
  );

  return (
    <motion.div style={{ opacity }}>
      {data.thoughts.map(thought => (
        <ThoughtNode key={thought.id} />
      ))}
    </motion.div>
  );
};</code></pre>

      <p>This snippet demonstrates a hypothetical connection between state management and visual feedback loops. The styling is not just aesthetic; it's functional data visualization.</p>

      <h2>Design Systems in the Age of AI</h2>

      <p>We must move beyond Atomic Design. The components of the future are molecular structures that adapt to context, user intent, and environmental lighting conditions.</p>

      <blockquote>"The interface is no longer a static canvas. It is a living, breathing entity that reacts to observation."</blockquote>

      <p>Conclusion? Embrace the darkness. Let the content shine through the void.</p>
    `
  },
  {
    id: '2',
    title: 'Glassmorphism: A Deep Dive into CSS Backdrop Filters',
    excerpt: 'Technical breakdown of performance implications when using heavy blur effects in React applications.',
    category: 'DESIGN',
    readTime: '8 min',
    date: 'OCT 22',
    imageUrl: 'https://picsum.photos/seed/glass/800/600',
    main: false
  },
  {
    id: '3',
    title: 'Rust for JavaScript Developers',
    excerpt: 'Why the memory safety and concurrency model of Rust makes it the perfect companion for modern frontend tooling.',
    category: 'BACKEND',
    readTime: '12 min',
    date: 'OCT 18',
    imageUrl: 'https://picsum.photos/seed/rust/800/600',
    main: true
  },
  {
    id: '4',
    title: 'Understanding React Server Components',
    excerpt: 'Moving beyond the client-side waterfall. A practical guide to Next.js 14 architecture.',
    category: 'REACT',
    readTime: '6 min',
    date: 'OCT 15',
    imageUrl: 'https://picsum.photos/seed/react/800/600',
    main: true
  },
  {
    id: '5',
    title: 'Designing for Dark Mode First',
    excerpt: 'Color theory adjustments and accessibility concerns when your primary canvas is #050505.',
    category: 'UX',
    readTime: '4 min',
    date: 'OCT 10',
    imageUrl: 'https://picsum.photos/seed/darkmode/800/600',
    main: false
  }
];