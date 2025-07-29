"use client";

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Copy, User, Check, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useSubscription } from '@/hooks/use-subscription';
import { useAdManager } from '@/hooks/use-ad-manager';
import MobileBannerAd from '@/components/ui/mobile-banner-ad';

// Mock data
const mockPlayers = [
  { id: '1', name: 'Jogador_Mestre', isHost: true },
  { id: '2', name: 'CaçadorDePalavras', isHost: false },
  { id: '3', name: 'Miss_Letrinhas', isHost: false },
];

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const { isPremium } = useSubscription();
  const { shouldShowBanner, bannerKey } = useAdManager();
  const roomCode = Array.isArray(params.id) ? params.id[0] : params.id;

  const copyLink = () => {
    const link = window.location.href;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      toast({ title: 'Link copiado!' });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const copyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode.toUpperCase()).then(() => {
        setCopied(true);
        toast({ title: 'Código copiado!' });
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-6 mobile-optimized">
      <div className="w-full max-w-2xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
            <ArrowLeft />
          </Button>
          <h1 className="text-3xl font-bold text-center flex-1">
            Sala de Espera
            {isPremium && <Crown className="text-primary ml-2" size={24} />}
          </h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">Convide seus Amigos!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">Código da Sala:</p>
            <div
              className="text-4xl font-bold tracking-widest text-primary cursor-pointer"
              onClick={copyCode}
            >
              {roomCode?.toUpperCase()}
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={copyLink}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                Copiar Link
              </Button>
               <Button onClick={copyCode}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                Copiar Código
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jogadores na Sala ({mockPlayers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {mockPlayers.map(player => (
                <li key={player.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <span className="flex items-center gap-2 font-semibold">
                    <User />
                    {player.name}
                  </span>
                  {player.isHost && (
                    <span className="flex items-center gap-1 text-xs text-primary font-bold">
                      <Crown size={14} />
                      Dono da Sala
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
            {/* This button will be enabled for the host */}
            <Button size="lg" className="w-full max-w-xs">
                Iniciar Jogo para Todos
            </Button>
        </div>
      </div>
      
      {shouldShowBanner && (
        <div className="fixed bottom-16 left-0 right-0 z-40">
          <MobileBannerAd adKey={bannerKey} />
        </div>
      )}
    </main>
  );
}
