"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, Trophy, Award, Search, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { generatePuzzle, levels } from '@/lib/puzzle-generator';
import WordSearchGrid from '@/components/word-search-grid';
import WordList from '@/components/word-list';
import { useToast } from "@/hooks/use-toast";
import Confetti from 'react-confetti';
import Logo from '@/components/icons/logo';

type GameState = 'start' | 'playing' | 'level-complete' | 'game-over';
type Puzzle = {
  grid: string[][];
  words: { word: string, path: [number, number][] }[];
};

const BannerAd = () => (
    <div className="fixed bottom-0 left-0 w-full h-[50px] bg-gray-200 flex items-center justify-center text-sm text-gray-600 z-50">
        <p>Publicidade (Banner 320x50)</p>
    </div>
);

const InterstitialAd = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
        <div className="bg-background rounded-lg p-6 text-center relative max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Anúncio</h3>
            <p className="text-muted-foreground mb-4">Obrigado por jogar! O jogo continuará após este anúncio.</p>
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-500 rounded-md mb-4">
                Conteúdo do anúncio em tela cheia
            </div>
            <Button onClick={onClose} variant="outline">
                Fechar Anúncio
            </Button>
        </div>
    </div>
);


export default function SoloPage() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selection, setSelection] = useState<[number, number][]>([]);
  const { toast } = useToast();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [matchesFinished, setMatchesFinished] = useState(0);
  const [showInterstitial, setShowInterstitial] = useState(false);

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
    setIsGameOver(true);
    const newMatchesFinished = matchesFinished + 1;
    setMatchesFinished(newMatchesFinished);
    if (newMatchesFinished % 3 === 0) {
        setShowInterstitial(true);
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
  
  const restartGame = () => {
    setScore(0);
    startLevel(1);
  };

  const closeInterstitialAndRestart = () => {
    setShowInterstitial(false);
    restartGame();
  };

  const renderDialog = () => {
    if (showInterstitial) {
        return <InterstitialAd onClose={() => {
            setShowInterstitial(false);
            // After closing ad, show the game over dialog
            setIsGameOver(true);
        }} />;
    }
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
        <Dialog open={true} onOpenChange={(open) => !open && setIsGameOver(false)}>
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
                <Button onClick={restartGame}>Jogar Novamente</Button>
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
      {renderDialog()}
      {renderGameContent()}
      {gameState === 'playing' && <BannerAd />}
    </main>
  );
}
