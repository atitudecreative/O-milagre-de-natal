import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';

// Fontes embutidas no projeto (OFL): o build não depende do Google Fonts.
const display = localFont({ src: './fonts/BowlbyOne-latin.woff2', weight: '400', variable: '--font-display', display: 'swap' });
const serif = localFont({ src: './fonts/Fraunces-BlackItalic-latin.woff2', weight: '900', style: 'italic', variable: '--font-serif', display: 'swap' });
const sans = localFont({ src: './fonts/InterTight-latin.woff2', weight: '100 900', variable: '--font-sans', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};

export const viewport: Viewport = {
  themeColor: '#F1EBDD',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable} ${serif.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
