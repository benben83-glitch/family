import type { ReactNode } from "react";

/** Titre/sous-titre posés directement sur le fond illustré : texte blanc + ombre portée pour rester lisibles, au lieu du bleu (--primary) illisible sur une image chargée. */
export function ExplorersPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h1 className="font-display text-3xl text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.35)]">{title}</h1>
        {subtitle && <p className="text-white/95 text-sm mt-1 font-medium [text-shadow:0_1px_6px_rgba(0,0,0,0.3)]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
