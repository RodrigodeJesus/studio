"use client";
import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type WordListProps = {
  words: string[];
  foundWords: string[];
};

const WordList = ({ words, foundWords }: WordListProps) => {
  return (
    <Card className="shadow-lg h-full">
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Palavras</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[45vh] lg:h-[60vh]">
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-2 pr-4">
            {words.map((word) => (
              <li
                key={word}
                className={cn(
                  "flex items-center gap-2 text-sm sm:text-lg transition-all duration-300 mobile-text",
                  foundWords.includes(word)
                    ? "text-muted-foreground line-through decoration-primary decoration-2"
                    : "text-foreground font-semibold"
                )}
              >
                {foundWords.includes(word) && <CheckCircle className="text-green-500 h-4 w-4 sm:h-5 sm:w-5" />}
                <span>{word.toUpperCase()}</span>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default memo(WordList);
