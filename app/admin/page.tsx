import type { Metadata } from 'next';
import { AdminView } from './AdminView';

export const metadata: Metadata = {
  title: 'Painel de Controle | Portal DPE',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminView />;
}
