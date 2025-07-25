"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, Trophy, Award, Search, CheckCircle, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { generatePuzzle, levels, Level } from '@/lib/puzzle-generator';
import WordSearchGrid from '@/components/word-search-grid';
import WordList from '@/components/word-list';
import { useToast } from "@/hooks/use-toast";
import Confetti from 'react-confetti';

type GameState = 'start' | 'playing' | 'level-complete' | 'game-over';
type Puzzle = {
  grid: string[][];
  words: string[];
};

export default function HomePage() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selection, setSelection] = useState<[number, number][]>([]);
  const { toast } = useToast();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

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
    setGameState('playing');
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (gameState === 'playing' && timeLeft === 0) {
      setGameState('game-over');
    }
  }, [gameState, timeLeft]);

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
    if (!puzzle) return;

    let forwardWord = '';
    let backwardWord = '';
    for (const cell of selection) {
      forwardWord += puzzle.grid[cell[0]][cell[1]];
    }
    backwardWord = forwardWord.split('').reverse().join('');

    const wordToFind = puzzle.words.find(w => w === forwardWord || w === backwardWord);

    if (wordToFind) {
      handleWordFound(wordToFind);
    }
    setSelection([]);
  }, [selection, puzzle, handleWordFound]);

  const nextLevel = () => {
    if (level < levels.length) {
      startLevel(level + 1);
    } else {
      setGameState('game-over');
    }
  };
  
  const restartGame = () => {
    setScore(0);
    startLevel(1);
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
    if (gameState === 'game-over') {
      return (
        <Dialog open={true}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <XCircle className="text-destructive" /> Fim de Jogo!
              </DialogTitle>
              <DialogDescription>
                O tempo acabou ou você concluiu todos os níveis! Sua pontuação final é {score}.
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
        <div className="flex flex-col items-center justify-center h-full gap-8 text-center">
            <div className="flex flex-col items-center">
                <Search size={80} className="text-primary mb-4"/>
                <h1 className="text-5xl font-bold font-headline">Caça Time</h1>
                <p className="text-muted-foreground mt-2 text-lg">Encontre as palavras antes que o tempo acabe!</p>
            </div>
            <Button size="lg" onClick={restartGame}>Iniciar Jogo</Button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full p-4 md:p-8">
        <div className="lg:col-span-2">
            <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <CardTitle className="text-2xl font-headline">Encontre as Palavras</CardTitle>
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
                        foundWords={foundWords}
                        puzzleWords={puzzle.words}
                        selection={selection}
                        onSelectionChange={setSelection}
                        onSelectionEnd={handleSelectionEnd}
                    />
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
            <WordList words={puzzle.words} foundWords={foundWords} />
        </div>
      </div>
    );
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
      {renderDialog()}
      {renderGameContent()}
    </main>
  );
}
