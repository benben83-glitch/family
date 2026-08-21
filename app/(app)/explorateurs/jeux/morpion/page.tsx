import { MorpionGame } from "./morpion-game";
import { ExplorersPageHeader } from "../../page-header";

export default function MorpionPage() {
  return (
    <div className="flex flex-col gap-6">
      <ExplorersPageHeader title="Morpion" subtitle="🦁 Lion contre 🐊 Crocodile — aligne trois têtes pour gagner." />
      <MorpionGame />
    </div>
  );
}
