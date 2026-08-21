import { CalculGame } from "./calcul-game";
import { ExplorersPageHeader } from "../../page-header";

export default function CalculPage() {
  return (
    <div className="flex flex-col gap-6">
      <ExplorersPageHeader title="Calcul mental" subtitle="Des petits calculs adaptés à ton âge." />
      <CalculGame />
    </div>
  );
}
