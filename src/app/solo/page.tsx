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

const BannerAd = () => {
    useEffect(() => {
        try {
            ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
        } catch (err) {
            console.error("AdSense Banner Error:", err);
        }
    }, []);

    return (
        <div className="fixed bottom-0 left-0 w-full h-[50px] bg-gray-200 flex items-center justify-center text-sm text-gray-600 z-50">
            <ins className="adsbygoogle"
                 style={{ display: 'inline-block', width: '320px', height: '50px' }}
                 data-ad-client="ca-pub-3940256099942544"
                 data-ad-slot="9214589741"></ins>
        </div>
    );
};

const InterstitialAd = ({ open, onClose }: { open: boolean, onClose: () => void }) => {
    useEffect(() => {
        if (open) {
            try {
                // We are trying to push the ad only when the dialog is open.
                ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            } catch (err) {
                console.error("AdSense Interstitial Error:", err);
            }
        }
    }, [open]);

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-sm w-full" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="text-center">Anúncio</DialogTitle>
                </DialogHeader>
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500 rounded-md my-4">
                   <ins className="adsbygoogle"
                        style={{ display: 'block' }}
                        data-ad-client="ca-pub-3940256099942544"
                        data-ad-slot="1033173712"
                        data-ad-format="auto"
                        data-full-width-responsive="true"></ins>
                </div>
                <DialogFooter>
                    <Button onClick={onClose} variant="outline" className="w-full">
                        Fechar Anúncio
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function SoloPage() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'level-complete' | 'game-over'>('start');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [puzzle, setPuzzle] = useState<{ grid: string[][]; words: { word: string; path: [number, number][]; }[]; } | null>(null);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selection, setSelection] = useState<[number, number][]>([]);
  const { toast } = useToast();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [matchesFinished, setMatchesFinished] = useState(0);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [isFirstGame, setIsFirstGame] = useState(true);

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
  }, []);

  const handleGameOver = useCallback(() => {
    setGameState('game-over');
    const newMatchesFinished = matchesFinished + 1;
    setMatchesFinished(newMatchesFinished);
    if (newMatchesFinished > 0 && newMatchesFinished % 3 === 0) {
        setShowInterstitial(true);
    } else {
        setIsGameOver(true);
    }
  }, [matchesFinished]);

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
        setGameState('level-complete');
      }
    }
  }, [foundWords, puzzle, timeLeft, toast]);

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
    if (isFirstGame) {
      setIsFirstGame(false);
    }
  };

  const restartGame = () => {
    if (isFirstGame) {
        setShowInterstitial(true);
    } else {
        startGame();
    }
  };

  const closeInterstitialAndHandleState = () => {
    setShowInterstitial(false);
    // If it was the "app open" ad, start the game.
    if(isFirstGame) {
        startGame();
    }
    // Otherwise, it was a regular interstitial, just show the game over dialog.
    else {
        setIsGameOver(true);
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
    if (isGameOver && !showInterstitial) {
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
                      setMatchesFinished(0); // Reset for ads
                      setIsFirstGame(true); // Reset for app-open ad logic
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
                <p className="text-muted-foreground mt-2 text-lg">Encontre as palavras antes que o tempo acabe!</p>
            </div>
            <Button size="lg" onClick={restartGame} className="gap-2">
                <Search />
                Iniciar Jogo
            </Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto p-4 md:p-8 mb-[50px]">
        <div className="lg:col-span-2">
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <CardTitle className="text-2xl font-headline flex items-center gap-3">
                           <Logo />
                        </CardTitle>
                        <div className="flex items-center gap-4 text-lg">
                             <div className="flex items-center gap-2 font-bold text-primary">
                                <Clock size={20} />
                                <span>{Math.floor(timeLeft / 60)}:{('0' + timeLeft % 60).slice(-2)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Trophy size={20} />
                                <span>{score}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Award size={20} />
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
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
      <InterstitialAd open={showInterstitial} onClose={closeInterstitialAndHandleState} />
      {renderDialog()}
      {renderGameContent()}
      {gameState === 'playing' && <BannerAd />}
    </main>
  );
}
