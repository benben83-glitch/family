import { CalculGame } from "./calcul-game";

export default function CalculPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-primary">Calcul mental</h1>
        <p className="text-muted text-sm mt-1">Des petits calculs adaptés à ton âge.</p>
      </div>

      <CalculGame />
    </div>
  );
}
