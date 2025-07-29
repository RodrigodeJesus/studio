"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Logo from '@/components/icons/logo';
import { Crown, Gamepad2, Users } from 'lucide-react';

export default function HomePage() {
  const [roomCode, setRoomCode] = useState('');
  const router = useRouter();
  const { toast } = useToast();

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

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center text-center mb-8">
        <Logo />
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
      </div>
    </main>
  );
}
