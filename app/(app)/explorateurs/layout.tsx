import Image from "next/image";

export default function ExplorersLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="explorers-theme">
      {/* Fond fixé à la fenêtre (pas à la hauteur du contenu) : taille et
          cadrage identiques sur toutes les pages, quelle que soit leur longueur. */}
      <div className="fixed inset-0 -z-20">
        <Image src="/images/explorers-background.png" alt="" fill priority className="object-cover" sizes="100vw" />
      </div>
      <div className="relative max-w-5xl mx-auto px-5 py-8">{children}</div>
    </div>
  );
}
