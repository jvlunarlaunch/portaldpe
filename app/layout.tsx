import type { Metadata } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import Image from 'next/image';
import localFont from 'next/font/local';
import { BackgroundWrapper } from '@/components/layout/BackgroundWrapper';
import { Navbar } from '@/components/layout/Navbar';
import { PageViewTracker } from '@/components/layout/PageViewTracker';
import { fetchActiveCategories } from '@/lib/categories';
import { HOME_TITLE, SITE_DESCRIPTION, SITE_URL, categoryPath } from '@/lib/seo';
import './globals.css';

// Inter servida pelo próprio site (sem pedido ao Google Fonts bloqueando a
// renderização). Só é baixada se algum texto usar a fonte, por isso sem preload.
// As antigas Inter Tight e JetBrains Mono não eram usadas em nenhum lugar.
const inter = localFont({
  src: '../node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
  preload: false,
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: HOME_TITLE,
  description: SITE_DESCRIPTION,
  authors: [{ name: 'Portal DPE' }],
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    siteName: 'Portal DPE',
    type: 'website',
    locale: 'pt_BR',
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/logo.png'],
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await fetchActiveCategories();

  return (
    <html lang="pt-BR" className={`light ${inter.variable}`}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XBCNSFN71F"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XBCNSFN71F');
          `}
        </Script>
      </head>
      <body style={{ backgroundColor: '#fbfbfd', color: '#0f172a' }}>
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <BackgroundWrapper>
          <Navbar />
          <main className="min-h-screen">{children}</main>

          <footer className="bg-white border-t border-slate-100 py-16 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center gap-2 mb-4">
                  <Image src="/logo.png" alt="Logo Portal DPE" width={32} height={32} className="w-8 h-8 rounded-full object-contain shadow-lg shadow-azure-500/20" />
                  <span className="font-bold text-slate-800">Portal DPE</span>
                </div>
                <p className="text-slate-500 text-sm max-w-xs text-center md:text-left">
                  O maior portal conservador de Pernambuco. Compromisso com a verdade e os valores tradicionais do Portal DPE.
                </p>
              </div>

              {categories.length > 0 && (
                <nav aria-label="Editorias" className="flex flex-col items-center md:items-start">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Editorias</span>
                  <ul className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-2 max-w-sm">
                    {categories.map((c) => (
                      <li key={c.slug}>
                        <a href={categoryPath(c.slug)} className="text-sm text-slate-500 hover:text-azure-600 transition-colors">
                          {c.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}

              <div className="flex flex-col items-center md:items-end">
                <div className="text-center md:text-right">
                  <div className="flex gap-6 mb-4 justify-center md:justify-end">
                    <a
                      href="https://www.instagram.com/direita.pernambuco/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-azure-600 transition-colors"
                    >
                      Instagram
                    </a>
                  </div>
                  <p className="text-xs text-slate-400">
                    &copy; {new Date().getFullYear()} Portal DPE. Todos os direitos reservados.
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </BackgroundWrapper>
      </body>
    </html>
  );
}
