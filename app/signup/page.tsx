import Link from "next/link";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <span className="text-3xl">🧭</span>
          <p className="font-display text-2xl text-primary">Rejoindre la famille</p>
          <p className="text-muted text-sm">Ton compte devra être approuvé par un parent avant que tu puisses accéder au carnet.</p>
        </div>

        <SignupForm />

        <p className="text-center text-sm text-muted mt-6">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
