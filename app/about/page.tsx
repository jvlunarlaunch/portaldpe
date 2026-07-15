import type { Metadata } from 'next';
import { AboutView } from './AboutView';

export const metadata: Metadata = {
  title: 'Quem Somos | Portal DPE',
  description: 'Conheça a missão e os valores do maior portal conservador de Pernambuco: Portal DPE.',
};

export default function AboutPage() {
  return <AboutView />;
}
