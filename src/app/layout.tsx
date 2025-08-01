import type {Metadata} from 'next';
import { Toaster } from "@/components/ui/toaster"
import BottomNavigation from '@/components/ui/bottom-navigation';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Caça Time',
  description: 'Um jogo de caça-palavras contra o relógio.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3940256099942544"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="font-body antialiased">
        {children}
        <BottomNavigation />
        <Toaster />
      </body>
    </html>
  );
}
