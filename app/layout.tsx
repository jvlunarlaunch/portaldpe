import type { Metadata } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import { BackgroundWrapper } from '@/components/layout/BackgroundWrapper';
import { Navbar } from '@/components/layout/Navbar';
import { PageViewTracker } from '@/components/layout/PageViewTracker';
import './globals.css';

const SITE_URL = 'https://portaldpe.com.br';
const SITE_DESCRIPTION =
  'O maior portal conservador de Pernambuco. Compromisso com a verdade, defesa da família e os valores tradicionais.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Portal DPE | Verdade e Liberdade',
  description: SITE_DESCRIPTION,
  authors: [{ name: 'Portal DPE' }],
  icons: {
    icon: '/logo.png',
  },
  openGraph: {
    siteName: 'Portal DPE',
    type: 'website',
    title: 'Portal DPE | Verdade e Liberdade',
    description: SITE_DESCRIPTION,
    images: ['/logo.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portal DPE | Verdade e Liberdade',
    description: SITE_DESCRIPTION,
    images: ['/logo.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Inter+Tight:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
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
                  <img src="/logo.png" alt="Logo Portal DPE" className="w-8 h-8 rounded-full object-contain shadow-lg shadow-azure-500/20" />
                  <span className="font-bold text-slate-800">Portal DPE</span>
                </div>
                <p className="text-slate-500 text-sm max-w-xs text-center md:text-left">
                  O maior portal conservador de Pernambuco. Compromisso com a verdade e os valores tradicionais do Portal DPE.
                </p>
              </div>

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
