export type Level = {
  level: number;
  gridSize: number;
  numWords: number;
  time: number; // in seconds
};

export const levels: Level[] = [
  { level: 1, gridSize: 8, numWords: 4, time: 120 },
  { level: 2, gridSize: 10, numWords: 6, time: 180 },
  { level: 3, gridSize: 12, numWords: 8, time: 240 },
  { level: 4, gridSize: 14, numWords: 10, time: 300 },
  { level: 5, gridSize: 15, numWords: 12, time: 360 },
];

const dictionary: string[] = [
  "CASA", "BOLA", "GATO", "SOL", "LUA", "RIO", "MAR", "FLOR", "PATO", "AMOR",
  "TEMPO", "FELIZ", "VERDE", "AZUL", "LIVRO", "ESCOLA", "PRAIA", "CIDADE", "FORTE",
  "DOCE", "JOGO", "MUSICA", "CAVALO", "JANELA", "ESTRELA", "CORRER", "COMIDA",
  "FAMILIA", "AMIGO", "BRASIL", "NATUREZA", "FUTEBOL", "AVENTURA", "PROGRAMAR"
];

const directions = [
  { x: 1, y: 0 },   // Horizontal
  { x: 0, y: 1 },   // Vertical
  { x: 1, y: 1 },   // Diagonal
  { x: -1, y: 1 },  // Diagonal invertida
];

const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const generatePuzzle = (config: Level) => {
  const { gridSize, numWords } = config;
  let grid: (string | null)[][] = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
  
  const wordsForPuzzle = shuffleArray([...dictionary])
    .filter(word => word.length <= gridSize)
    .slice(0, numWords);
  
  const placedWords: { word: string; path: [number, number][] }[] = [];

  for (const word of wordsForPuzzle) {
    const wordToPlace = Math.random() > 0.5 ? word : word.split('').reverse().join('');
    let placed = false;
    const shuffledDirections = shuffleArray([...directions]);

    for (const direction of shuffledDirections) {
      if (placed) break;
      const startPositions = shuffleArray(
        Array.from({ length: gridSize * gridSize }, (_, i) => [Math.floor(i / gridSize), i % gridSize])
      );
      
      for (const [startY, startX] of startPositions) {
        let x = startX;
        let y = startY;
        let canPlace = true;
        const path: [number, number][] = [];
        
        for (let i = 0; i < wordToPlace.length; i++) {
          if (
            y < 0 || y >= gridSize ||
            x < 0 || x >= gridSize ||
            (grid[y][x] !== null && grid[y][x] !== wordToPlace[i])
          ) {
            canPlace = false;
            break;
          }
          path.push([y, x]);
          y += direction.y;
          x += direction.x;
        }

        if (canPlace) {
          y = startY;
          x = startX;
          for (let i = 0; i < wordToPlace.length; i++) {
            grid[y][x] = wordToPlace[i];
            y += direction.y;
            x += direction.x;
          }
          placed = true;
          placedWords.push({ word: word, path: path });
          break;
        }
      }
    }
  }

  // Fill empty cells
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const finalGrid = grid.map(row =>
    row.map(cell => cell === null ? alphabet[Math.floor(Math.random() * alphabet.length)] : cell)
  ) as string[][];

  return { grid: finalGrid, words: placedWords };
};