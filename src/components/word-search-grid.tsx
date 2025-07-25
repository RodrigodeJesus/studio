"use client";

import { useState, useEffect, useRef, memo, useMemo } from 'react';
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
  
  const foundWordCells = useMemo(() => {
    // This part is complex and depends on having the paths of found words.
    // Since we don't have that from the props, we cannot highlight found words' paths permanently.
    // The current implementation highlights during selection.
    return new Set<string>();
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

  return (
    <div
      ref={gridRef}
      className="grid aspect-square w-full touch-none select-none rounded-lg border bg-card p-2 shadow-inner"
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
              "flex aspect-square items-center justify-center rounded-md text-lg md:text-xl font-bold font-mono transition-colors duration-150",
              isCellInSelection(rowIndex, colIndex) ? "bg-primary text-primary-foreground scale-110 shadow-lg" : "bg-background",
              // This part for permanently highlighting found words is not fully implemented
              // as the component doesn't receive the necessary path data.
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