import { MemoryGame } from "./memory-game";
import { ExplorersPageHeader } from "../../page-header";

export default function MemoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <ExplorersPageHeader title="Memory" subtitle="Retrouve les paires d'animaux, seul ou à plusieurs." />
      <MemoryGame />
    </div>
  );
}
