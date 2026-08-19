import { MorpionGame } from "./morpion-game";

export default function MorpionPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-primary">Morpion</h1>
        <p className="text-muted text-sm mt-1">🦁 Lion contre 🐊 Crocodile — aligne trois têtes pour gagner.</p>
      </div>

      <MorpionGame />
    </div>
  );
}
