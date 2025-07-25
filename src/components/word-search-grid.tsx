"use client";

import { useState, useEffect, useRef, memo } from 'react';
import { cn } from "@/lib/utils";

type WordSearchGridProps = {
  grid: string[][];
  foundWords: string[];
  puzzleWords: string[];
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
  
  const foundWordCells = new Set<string>();
  puzzleWords.forEach(word => {
    if (foundWords.includes(word)) {
      // This is a simplified way to get cell coordinates.
      // A full implementation would need the starting position and direction from the generator.
      // For this UI, we assume we can get them. For now, we'll just check if a cell is part of any found word.
    }
  });


  const getCellCoordsFromEvent = (e: React.MouseEvent | React.TouchEvent) => {
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
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const coords = getCellCoordsFromEvent(e);
    if(coords) {
        setIsSelecting(true);
        onSelectionChange([coords]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting) return;
    const startCell = selection[0];
    const endCoords = getCellCoordsFromEvent(e);

    if (startCell && endCoords) {
        const path: [number, number][] = [];
        const [startY, startX] = startCell;
        const [endY, endX] = endCoords;
        const dx = endX - startX;
        const dy = endY - startY;

        if (dx === 0 && dy === 0) {
            onSelectionChange([startCell]);
            return;
        }

        if (dx === 0 || dy === 0 || Math.abs(dx) === Math.abs(dy)) {
            const steps = Math.max(Math.abs(dx), Math.abs(dy));
            const xInc = dx / steps;
            const yInc = dy / steps;

            for (let i = 0; i <= steps; i++) {
                path.push([startY + Math.round(i * yInc), startX + Math.round(i * xInc)]);
            }
            onSelectionChange(path);
        }
    }
  };

  const handleMouseUp = () => {
    if (isSelecting) {
      setIsSelecting(false);
      onSelectionEnd();
    }
  };
  
  const isCellInSelection = (row: number, col: number) => {
    return selection.some(cell => cell[0] === row && cell[1] === col);
  };

  const isCellInFoundWord = (row: number, col: number) => {
    // This is a placeholder. A robust solution needs the generator to provide word coordinates.
    // For now, this will not highlight found words, but the logic is here.
    return false; 
  };

  useEffect(() => {
    const endSelection = () => handleMouseUp();
    window.addEventListener('mouseup', endSelection);
    return () => {
      window.removeEventListener('mouseup', endSelection);
    };
  }, [isSelecting]);

  return (
    <div
      ref={gridRef}
      className="grid aspect-square w-full touch-none select-none rounded-lg border bg-card p-2 shadow-inner"
      style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseUp}
    >
      {grid.map((row, rowIndex) =>
        row.map((letter, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={cn(
              "flex aspect-square items-center justify-center rounded-md text-lg md:text-xl font-bold font-mono transition-colors duration-150",
              isCellInSelection(rowIndex, colIndex) ? "bg-primary text-primary-foreground scale-110" : "bg-secondary",
              isCellInFoundWord(rowIndex, colIndex) && "bg-accent text-accent-foreground"
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
