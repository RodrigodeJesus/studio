"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import RankingList from "@/components/ranking-list";
import { useSubscription } from '@/hooks/use-subscription';
import { useAdManager } from '@/hooks/use-ad-manager';
import MobileBannerAd from '@/components/ui/mobile-banner-ad';

// Mock data, will be replaced with Firebase data
const mockRanking = [
  { id: '1', name: 'Jogador_Mestre', score: 10500 },
  { id: '2', name: 'CaçadorDePalavras', score: 9800 },
  { id: '3', name: 'Miss_Letrinhas', score: 9750 },
  { id: '4', name: 'User123', score: 8500 },
  { id: '5', name: 'Novato', score: 7200 },
];

export default function RankingPage() {
  const router = useRouter();
  const { isPremium } = useSubscription();
  const { shouldShowBanner, bannerKey } = useAdManager();

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-6 mobile-optimized">
      <div className="w-full max-w-2xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft />
          </Button>
          <h1 className="text-3xl font-bold text-center flex-1 flex items-center justify-center gap-2">
            <Crown className="text-primary" size={32} />
            Ranking Geral
            {isPremium && <Crown className="text-primary" size={20} />}
          </h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Jogadores</CardTitle>
          </CardHeader>
          <CardContent>
            <RankingList players={mockRanking} />
          </CardContent>
        </Card>
      </div>
      
      {shouldShowBanner && (
        <div className="fixed bottom-16 left-0 right-0 z-40">
          <MobileBannerAd adKey={bannerKey} />
        </div>
      )}
    </main>
  );
}
