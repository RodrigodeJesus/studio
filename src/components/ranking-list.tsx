import { Medal } from 'lucide-react';

type Player = {
  id: string;
  name: string;
  score: number;
};

type RankingListProps = {
  players: Player[];
};

const getMedal = (rank: number) => {
  if (rank === 0) return <Medal className="text-yellow-500" />;
  if (rank === 1) return <Medal className="text-gray-400" />;
  if (rank === 2) return <Medal className="text-yellow-700" />;
  return <span className="w-6 text-center text-muted-foreground">{rank + 1}</span>;
};

export default function RankingList({ players }: RankingListProps) {
  return (
    <ul className="space-y-4">
      {players.map((player, index) => (
        <li
          key={player.id}
          className="flex items-center justify-between p-4 rounded-lg bg-secondary"
        >
          <div className="flex items-center gap-4">
            {getMedal(index)}
            <span className="font-semibold text-lg">{player.name}</span>
          </div>
          <span className="font-bold text-primary text-xl">{player.score} pts</span>
        </li>
      ))}
    </ul>
  );
}
