"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "./actions";
import type { FamilyProfile } from "@/lib/auth/session";

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/voyages", label: "Nos voyages" },
  { href: "/carte", label: "Carte du monde" },
  { href: "/explorateurs", label: "Explorateurs" },
];

export function Nav({ profile }: { profile: FamilyProfile }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
      <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-display text-lg text-primary shrink-0">
          <span aria-hidden>🧭</span>
          <span className="hidden sm:inline">Notre aventure familiale</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {LINKS.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-full transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-primary/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:inline text-sm text-muted">{profile.full_name ?? profile.email}</span>
          <form action={signOut}>
            <button type="submit" className="text-sm text-muted hover:text-foreground transition-colors">
              Déconnexion
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
