"use client";

import { useState, useEffect, useRef, memo, useMemo } from 'react';
import { cn } from "@/lib/utils";

type PuzzleWord = { word: string, path: [number, number][] };

type WordSearchGridProps = {
  grid: string[][];
  foundWords: string[];
  puzzleWords: PuzzleWord[];
  selection: [number, number][];
  onSelectionChange: (selection: [number, number][]) => void;
  onSelectionEnd: () => void;
};

const WordSearchGrid = ({
  grid,
  foundWords,
  puzzleWords,
  selection,
  onSelectionChange,
  onSelectionEnd,
}: WordSearchGridProps) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  
  const foundWordPaths = useMemo(() => {
    const paths = new Set<string>();
    puzzleWords.forEach(puzzleWord => {
      if (foundWords.includes(puzzleWord.word)) {
        puzzleWord.path.forEach(([r, c]) => paths.add(`${r}-${c}`));
      }
    });
    return paths;
  }, [foundWords, puzzleWords]);


  const getCellCoordsFromEvent = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();

    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const row = Math.floor((y / rect.height) * grid.length);
    const col = Math.floor((x / rect.width) * grid[0].length);

    if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
      return [row, col] as [number, number];
    }
    return null;
  };

  const handleInteractionStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const coords = getCellCoordsFromEvent(e);
    if(coords) {
        setIsSelecting(true);
        onSelectionChange([coords]);
    }
  };

  const handleInteractionMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isSelecting || !selection[0]) return;
    
    const startCell = selection[0];
    const endCoords = getCellCoordsFromEvent(e);

    if (startCell && endCoords) {
        const path: [number, number][] = [];
        const [startY, startX] = startCell;
        const [endY, endX] = endCoords;
        const dx = endX - startX;
        const dy = endY - startY;

        // Straight lines (horizontal, vertical, or 45-degree diagonal)
        if (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) {
            const steps = Math.max(Math.abs(dx), Math.abs(dy));
            const xInc = dx === 0 ? 0 : dx / steps;
            const yInc = dy === 0 ? 0 : dy / steps;
            
            for (let i = 0; i <= steps; i++) {
                const nextY = startY + Math.round(i * yInc);
                const nextX = startX + Math.round(i * xInc);
                // Check to prevent duplicate cells in the path
                if (!path.find(p => p[0] === nextY && p[1] === nextX)) {
                    path.push([nextY, nextX]);
                }
            }
            onSelectionChange(path);
        }
    }
  };
  
  const handleInteractionEnd = () => {
    if (isSelecting) {
      setIsSelecting(false);
      onSelectionEnd();
    }
  };
  
  useEffect(() => {
    const upListener = (e: MouseEvent | TouchEvent) => handleInteractionEnd();
    
    window.addEventListener('mouseup', upListener);
    window.addEventListener('touchend', upListener);

    return () => {
      window.removeEventListener('mouseup', upListener);
      window.removeEventListener('touchend', upListener);
    };
  }, [isSelecting, onSelectionEnd]);
  
  const isCellInSelection = (row: number, col: number) => {
    return selection.some(cell => cell[0] === row && cell[1] === col);
  };
  
  const isCellInFoundWord = (row: number, col: number) => {
    return foundWordPaths.has(`${row}-${col}`);
  };

  return (
    <div
      ref={gridRef}
      className="grid aspect-square w-full touch-none select-none rounded-lg border bg-card p-1 sm:p-2 shadow-inner mobile-grid"
      style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}
      onMouseDown={handleInteractionStart}
      onMouseMove={handleInteractionMove}
      onTouchStart={handleInteractionStart}
      onTouchMove={handleInteractionMove}
    >
      {grid.map((row, rowIndex) =>
        row.map((letter, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={cn(
              "flex aspect-square items-center justify-center rounded-md text-sm sm:text-lg md:text-xl font-bold font-mono transition-colors duration-150",
              isCellInSelection(rowIndex, colIndex) 
                ? "bg-primary text-primary-foreground scale-110 shadow-lg" 
                : isCellInFoundWord(rowIndex, colIndex)
                ? "bg-primary/30 text-primary-foreground"
                : "bg-background",
            )}
            data-row={rowIndex}
            data-col={colIndex}
          >
            {letter}
          </div>
        ))
      )}
    </div>
  );
};

export default memo(WordSearchGrid);
