"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Search, Crown } from 'lucide-react';
import { useSubscription } from '@/hooks/use-subscription';
import { useAdManager } from '@/hooks/use-ad-manager';
import MobileBannerAd from '@/components/ui/mobile-banner-ad';

// Mock data para salas ativas
const activeSalas = [
  { id: 'ABC1', players: 2, maxPlayers: 4, host: 'Jogador_Mestre' },
  { id: 'XYZ2', players: 3, maxPlayers: 4, host: 'CaçadorDePalavras' },
  { id: 'DEF3', players: 1, maxPlayers: 4, host: 'Miss_Letrinhas' },
];

export default function SalasPage() {
  const [roomCode, setRoomCode] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const { isPremium } = useSubscription();
  const { shouldShowBanner, bannerKey } = useAdManager();

  const handleCreateRoom = async () => {
    const newRoomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    router.push(`/sala/${newRoomCode}`);
  };

  const handleJoinRoom = (code?: string) => {
    const codeToJoin = code || roomCode.trim();
    if (codeToJoin.length === 4) {
      router.push(`/sala/${codeToJoin.toUpperCase()}`);
    } else {
      toast({
        title: "Código Inválido",
        description: "O código da sala deve ter 4 caracteres.",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col bg-background p-4 mobile-optimized">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2 mb-2">
            <Users className="text-primary" />
            Salas Competitivas
            {isPremium && <Crown className="text-primary" size={24} />}
          </h1>
          <p className="text-muted-foreground">Desafie outros jogadores em tempo real</p>
        </div>

        {/* Criar Nova Sala */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus size={20} />
              Criar Nova Sala
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleCreateRoom} className="w-full" size="lg">
              <Plus className="mr-2" />
              Criar Sala Privada
            </Button>
          </CardContent>
        </Card>

        {/* Entrar em Sala */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search size={20} />
              Entrar em uma Sala
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Digite o código da sala (4 caracteres)"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={4}
              className="text-center text-lg font-mono"
            />
            <Button onClick={() => handleJoinRoom()} className="w-full">
              Entrar na Sala
            </Button>
          </CardContent>
        </Card>

        {/* Salas Ativas */}
        <Card>
          <CardHeader>
            <CardTitle>Salas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeSalas.map((sala) => (
                <div
                  key={sala.id}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-mono font-bold text-lg">{sala.id}</div>
                    <div className="text-sm text-muted-foreground">
                      Host: {sala.host}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm">
                      {sala.players}/{sala.maxPlayers}
                      <Users size={14} className="inline ml-1" />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleJoinRoom(sala.id)}
                      disabled={sala.players >= sala.maxPlayers}
                    >
                      {sala.players >= sala.maxPlayers ? 'Cheia' : 'Entrar'}
                    </Button>
                  </div>
                </div>
              ))}
              
              {activeSalas.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Nenhuma sala ativa no momento</p>
                  <p className="text-sm">Seja o primeiro a criar uma!</p>
                </div>
              )}
            </div>
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