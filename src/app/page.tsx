"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Logo from '@/components/icons/logo';
import { Crown, Gamepad2, Users } from 'lucide-react';
import { useSubscription } from '@/hooks/use-subscription';
import SubscriptionModal from '@/components/ui/subscription-modal';
import MobileBannerAd from '@/components/ui/mobile-banner-ad';
import { useAdManager } from '@/hooks/use-ad-manager';

export default function HomePage() {
  const [roomCode, setRoomCode] = useState('');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { isPremium, subscribe } = useSubscription();
  const { shouldShowBanner, bannerKey } = useAdManager();

  const handleCreateRoom = async () => {
    // In a real scenario, we'd call a server function to create a room
    // and get a unique code. For this prototype, we'll generate a simple one.
    const newRoomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    router.push(`/sala/${newRoomCode}`);
  };

  const handleJoinRoom = () => {
    if (roomCode.trim().length === 4) {
      router.push(`/sala/${roomCode.trim().toUpperCase()}`);
    } else {
      toast({
        title: "Código Inválido",
        description: "O código da sala deve ter 4 caracteres.",
        variant: "destructive",
      });
    }
  };

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    const result = await subscribe(plan);
    if (result.success) {
      toast({
        title: "Assinatura ativada!",
        description: "Bem-vindo ao Caça Time Premium!",
      });
      setShowSubscriptionModal(false);
    } else {
      toast({
        title: "Erro na assinatura",
        description: result.error || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 mobile-optimized">
      <div className="flex flex-col items-center text-center mb-8">
        <Logo />
        {isPremium && (
          <div className="flex items-center gap-1 mt-2 px-2 py-1 bg-primary/10 rounded-full">
            <Crown className="text-primary" size={14} />
            <span className="text-xs font-medium text-primary">Premium</span>
          </div>
        )}
        <p className="text-muted-foreground mt-2 text-lg">Desafie seus amigos em uma caça alucinante!</p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        <Button size="lg" className="w-full" onClick={() => router.push('/solo')}>
          <Gamepad2 className="mr-2" />
          Modo um Jogador
        </Button>
        <Button size="lg" className="w-full" onClick={handleCreateRoom}>
          <Users className="mr-2" />
          Criar Sala Competitiva
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Entrar em uma Sala</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Input
              placeholder="Digite o código da sala"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              maxLength={4}
              className="text-center uppercase"
            />
            <Button onClick={handleJoinRoom}>Entrar na Sala</Button>
          </CardContent>
        </Card>

        <Button size="lg" variant="outline" className="w-full" onClick={() => router.push('/ranking')}>
            <Crown className="mr-2" />
            Ver Ranking Geral
        </Button>
        
        {!isPremium && (
          <Button 
            size="lg" 
            variant="secondary" 
            className="w-full" 
            onClick={() => setShowSubscriptionModal(true)}
          >
            <Crown className="mr-2" />
            Remover Anúncios - R$ 1,99/mês
          </Button>
        )}
      </div>
      
      {shouldShowBanner && (
        <div className="fixed bottom-16 left-0 right-0 z-40">
          <MobileBannerAd adKey={bannerKey} />
        </div>
      )}
      
      <SubscriptionModal
        open={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={handleSubscribe}
      />
    </main>
  );
}
