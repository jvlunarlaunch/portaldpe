import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Página não encontrada | Portal DPE',
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center pt-20 bg-white px-4 text-center">
      <h2 className="text-2xl font-bold mb-4 text-slate-900">Página não encontrada</h2>
      <Link href="/"><Button>Voltar ao Início</Button></Link>
    </div>
  );
}
