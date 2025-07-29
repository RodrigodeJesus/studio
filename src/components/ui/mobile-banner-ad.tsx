"use client";

import { useEffect, useState } from 'react';

type MobileBannerAdProps = {
  adKey?: number;
  className?: string;
};

export default function MobileBannerAd({ adKey = 0, className = "" }: MobileBannerAdProps) {
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    try {
      // Simula carregamento do AdMob
      const timer = setTimeout(() => {
        setAdLoaded(true);
        // Em produção, aqui seria a inicialização do AdMob
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }, 1000);

      return () => clearTimeout(timer);
    } catch (err) {
      console.error("AdMob Banner Error:", err);
    }
  }, [adKey]);

  if (!adLoaded) {
    return (
      <div className={`h-[50px] bg-muted animate-pulse flex items-center justify-center ${className}`}>
        <span className="text-xs text-muted-foreground">Carregando anúncio...</span>
      </div>
    );
  }

  return (
    <div className={`h-[50px] bg-gray-100 flex items-center justify-center text-sm text-gray-600 ${className}`}>
      <ins 
        className="adsbygoogle"
        style={{ display: 'inline-block', width: '320px', height: '50px' }}
        data-ad-client="ca-pub-3940256099942544"
        data-ad-slot="9214589741"
      />
    </div>
  );
}