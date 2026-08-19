import { MemoryGame } from "./memory-game";

export default function MemoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-primary">Memory</h1>
        <p className="text-muted text-sm mt-1">Retrouve les paires d&apos;animaux, seul ou à plusieurs.</p>
      </div>

      <MemoryGame />
    </div>
  );
}
