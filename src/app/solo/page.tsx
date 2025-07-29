
"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, Trophy, Award, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { generatePuzzle, levels } from '@/lib/puzzle-generator';
import WordSearchGrid from '@/components/word-search-grid';
import WordList from '@/components/word-list';
import { useToast } from "@/hooks/use-toast";
import Confetti from 'react-confetti';
import Logo from '@/components/icons/logo';
import { useSubscription } from '@/hooks/use-subscription';
import { useAdManager } from '@/hooks/use-ad-manager';
import MobileBannerAd from '@/components/ui/mobile-banner-ad';
import MobileInterstitialAd from '@/components/ui/mobile-interstitial-ad';
import SubscriptionModal from '@/components/ui/subscription-modal';

export default function SoloPage() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'level-complete' | 'game-over'>('start');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [puzzle, setPuzzle] = useState<{ grid: string[][]; words: { word: string; path: [number, number][]; }[]; } | null>(null);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selection, setSelection] = useState<[number, number][]>([]);
  const { toast } = useToast();
  const { isPremium, subscribe } = useSubscription();
  const { 
    shouldShowBanner, 
    shouldShowInterstitial, 
    bannerKey, 
    onGameFinished, 
    closeInterstitial 
  } = useAdManager();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  
  const currentLevelConfig = useMemo(() => levels.find(l => l.level === level) || levels[levels.length - 1], [level]);

  const startLevel = useCallback((levelNum: number) => {
    const config = levels.find(l => l.level === levelNum) || levels[levels.length - 1];
    setLevel(levelNum);
    setPuzzle(generatePuzzle(config));
    setTimeLeft(config.time);
    setFoundWords([]);
    setSelection([]);
    setIsGameOver(false);
    setGameState('playing');
    setAdKey(prev => prev + 1); // Refresh banner ad key
  }, []);

  const handleGameOver = useCallback(() => {
    setGameState('game-over');
    onGameFinished();
    setIsGameOver(true);
  }, [onGameFinished]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      handleGameOver();
    }
  }, [gameState, timeLeft, handleGameOver]);

  const handleWordFound = useCallback((word: string) => {
    if (!foundWords.includes(word)) {
      const newFoundWords = [...foundWords, word];
      setFoundWords(newFoundWords);
      const points = word.length * 10;
      setScore(s => s + points);

      toast({
        title: "Palavra encontrada!",
        description: `+${points} pontos por "${word.toUpperCase()}"`,
        duration: 2000,
      });

      if (puzzle && newFoundWords.length === puzzle.words.length) {
        setScore(s => s + timeLeft * 5); // Time bonus
        onGameFinished();
        setGameState('level-complete');
      }
    }
  }, [foundWords, puzzle, timeLeft, toast, onGameFinished]);

  const handleSelectionEnd = useCallback(() => {
    if (!puzzle || selection.length < 2) {
      setSelection([]);
      return;
    };

    const puzzleWords = puzzle.words;
    
    const isSamePath = (path1: [number, number][], path2: [number, number][]) => {
        if(path1.length !== path2.length) return false;
        // Check both directions
        const forwardMatch = path1.every((p, i) => p[0] === path2[i][0] && p[1] === path2[i][1]);
        if(forwardMatch) return true;
        const reversedPath2 = [...path2].reverse();
        const backwardMatch = path1.every((p, i) => p[0] === reversedPath2[i][0] && p[1] === reversedPath2[i][1]);
        return backwardMatch;
    }

    for(const puzzleWord of puzzleWords) {
        if(isSamePath(puzzleWord.path, selection)) {
            handleWordFound(puzzleWord.word);
            setSelection([]);
            return;
        }
    }

    setSelection([]);
  }, [selection, puzzle, handleWordFound]);

  const nextLevel = () => {
    if (level < levels.length) {
      startLevel(level + 1);
    } else {
      handleGameOver();
    }
  };
  
  const startGame = () => {
    const config = levels.find(l => l.level === 1)!;
    setLevel(1);
    setScore(0);
    setPuzzle(generatePuzzle(config));
    setTimeLeft(config.time);
    setFoundWords([]);
    setSelection([]);
    setIsGameOver(false);
    setGameState('playing');
  };

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    const result = await subscribe(plan);
    if (result.success) {
      toast({
        title: "Assinatura ativada!",
        description: "Agora você pode jogar sem anúncios!",
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

  const renderDialog = () => {
    if (gameState === 'level-complete') {
      return (
        <Dialog open={true}>
          {windowSize.width > 0 && <Confetti width={windowSize.width} height={windowSize.height} />}
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Trophy className="text-primary" /> Nível Concluído!
              </DialogTitle>
              <DialogDescription>
                Você é um mestre das palavras! Pontuação atual: {score}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={nextLevel}>
                {level < levels.length ? 'Próximo Nível' : 'Ver Pontuação Final'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }
    if (isGameOver && !shouldShowInterstitial) {
      return (
        <Dialog open={true} onOpenChange={(open) => !open && setGameState('start')}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                    Fim de Jogo!
                </DialogTitle>
                <DialogDescription>
                    {timeLeft === 0 ? "O tempo acabou!" : "Você completou todos os níveis!"} Sua pontuação final é {score}.
                </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button onClick={() => {
                      setIsGameOver(false);
                      setGameState('start');
                  }}>Voltar ao Início</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      );
    }
    return null;
  };
  
  const renderGameContent = () => {
    if (gameState === 'start' || !puzzle) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-8 text-center p-4">
            <div className="flex flex-col items-center">
                <Logo />
                {isPremium && (
                  <div className="flex items-center gap-1 mt-2 px-2 py-1 bg-primary/10 rounded-full">
                    <Crown className="text-primary" size={14} />
                    <span className="text-xs font-medium text-primary">Premium</span>
                  </div>
                )}
                <p className="text-muted-foreground mt-2 text-lg">Encontre as palavras antes que o tempo acabe!</p>
            </div>
            <div className="space-y-4 w-full max-w-xs">
              <Button size="lg" onClick={startGame} className="gap-2 w-full">
                <Search />
                Iniciar Jogo
              </Button>
              {!isPremium && (
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="w-full gap-2" 
                  onClick={() => setShowSubscriptionModal(true)}
                >
                  <Crown />
                  Jogar sem Anúncios
                </Button>
              )}
            </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 w-full max-w-7xl mx-auto p-4 mobile-optimized">
        <div className="lg:col-span-2">
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <CardTitle className="text-2xl font-headline flex items-center gap-3">
                           <Logo />
                           {isPremium && <Crown className="text-primary" size={20} />}
                        </CardTitle>
                        <div className="flex items-center gap-2 sm:gap-4 text-sm sm:text-lg">
                             <div className="flex items-center gap-2 font-bold text-primary">
                                <Clock size={16} className="sm:w-5 sm:h-5" />
                                <span>{Math.floor(timeLeft / 60)}:{('0' + timeLeft % 60).slice(-2)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Trophy size={16} className="sm:w-5 sm:h-5" />
                                <span>{score}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Award size={16} className="sm:w-5 sm:h-5" />
                                <span>Nível {level}</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <WordSearchGrid
                        grid={puzzle.grid}
                        puzzleWords={puzzle.words}
                        foundWords={foundWords}
                        selection={selection}
                        onSelectionChange={setSelection}
                        onSelectionEnd={handleSelectionEnd}
                    />
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
            <WordList words={puzzle.words.map(p => p.word)} foundWords={foundWords} />
        </div>
      </div>
    );
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background pb-16">
      <MobileInterstitialAd 
        open={shouldShowInterstitial} 
        onClose={closeInterstitial}
        adKey={bannerKey}
      />
      {renderDialog()}
      {renderGameContent()}
      
      {gameState === 'playing' && shouldShowBanner && (
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

    