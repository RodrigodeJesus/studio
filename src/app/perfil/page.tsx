"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Crown, Trophy, Target, Clock, Settings, LogOut } from 'lucide-react';
import { useSubscription } from '@/hooks/use-subscription';
import { useAdManager } from '@/hooks/use-ad-manager';
import MobileBannerAd from '@/components/ui/mobile-banner-ad';
import SubscriptionModal from '@/components/ui/subscription-modal';
import { useToast } from '@/hooks/use-toast';

// Mock data do usuário
const userData = {
  name: 'Jogador_Mestre',
  level: 15,
  totalScore: 12450,
  gamesPlayed: 87,
  wordsFound: 342,
  averageTime: '2:34',
  bestScore: 1850,
  achievements: [
    { name: 'Primeira Vitória', icon: '🏆', unlocked: true },
    { name: 'Caçador Expert', icon: '🎯', unlocked: true },
    { name: 'Velocista', icon: '⚡', unlocked: false },
    { name: 'Mestre das Palavras', icon: '📚', unlocked: false },
  ]
};

export default function PerfilPage() {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { isPremium, plan, subscribe, cancelSubscription } = useSubscription();
  const { shouldShowBanner, bannerKey } = useAdManager();
  const { toast } = useToast();

  const handleSubscribe = async (selectedPlan: 'monthly' | 'yearly') => {
    const result = await subscribe(selectedPlan);
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

  const handleCancelSubscription = async () => {
    const result = await cancelSubscription();
    if (result.success) {
      toast({
        title: "Assinatura cancelada",
        description: "Você ainda pode usar os benefícios até o final do período.",
      });
    } else {
      toast({
        title: "Erro ao cancelar",
        description: result.error || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col bg-background p-4 mobile-optimized">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        
        {/* Header do Perfil */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="text-primary" size={32} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{userData.name}</h1>
                  {isPremium && (
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      <Crown size={12} className="mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">Nível {userData.level}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="text-primary" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-secondary rounded-lg">
                <div className="text-2xl font-bold text-primary">{userData.totalScore}</div>
                <div className="text-sm text-muted-foreground">Pontuação Total</div>
              </div>
              <div className="text-center p-3 bg-secondary rounded-lg">
                <div className="text-2xl font-bold text-primary">{userData.gamesPlayed}</div>
                <div className="text-sm text-muted-foreground">Jogos</div>
              </div>
              <div className="text-center p-3 bg-secondary rounded-lg">
                <div className="text-2xl font-bold text-primary">{userData.wordsFound}</div>
                <div className="text-sm text-muted-foreground">Palavras</div>
              </div>
              <div className="text-center p-3 bg-secondary rounded-lg">
                <div className="text-2xl font-bold text-primary">{userData.averageTime}</div>
                <div className="text-sm text-muted-foreground">Tempo Médio</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conquistas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="text-primary" />
              Conquistas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {userData.achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border text-center ${
                    achievement.unlocked
                      ? 'bg-primary/5 border-primary/20'
                      : 'bg-muted/50 border-muted opacity-50'
                  }`}
                >
                  <div className="text-2xl mb-1">{achievement.icon}</div>
                  <div className="text-sm font-medium">{achievement.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Assinatura */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="text-primary" />
              {isPremium ? 'Assinatura Premium' : 'Upgrade para Premium'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPremium ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium">Plano {plan === 'monthly' ? 'Mensal' : 'Anual'}</p>
                    <p className="text-sm text-muted-foreground">
                      {plan === 'monthly' ? 'R$ 1,99/mês' : 'R$ 19,99/ano'}
                    </p>
                  </div>
                  <Badge variant="secondary">Ativo</Badge>
                </div>
                <Button
                  variant="outline"
                  onClick={handleCancelSubscription}
                  className="w-full"
                >
                  Cancelar Assinatura
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Remova os anúncios e desbloqueie recursos exclusivos
                </p>
                <Button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="w-full"
                >
                  <Crown className="mr-2" />
                  Assinar Premium - R$ 1,99/mês
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Configurações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="text-primary" />
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Settings className="mr-2" size={16} />
              Preferências do Jogo
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <User className="mr-2" size={16} />
              Editar Perfil
            </Button>
            <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
              <LogOut className="mr-2" size={16} />
              Sair da Conta
            </Button>
          </CardContent>
        </Card>
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