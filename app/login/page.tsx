import { LoginForm } from "./login-form";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "/";
  const hasProfileError = params.error === "profil-manquant";

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <span className="text-3xl">🧭</span>
          <p className="font-display text-2xl text-primary">Notre aventure familiale</p>
          <p className="text-muted text-sm">Espace privé — réservé à la famille</p>
        </div>

        <LoginForm next={next} />

        {hasProfileError && (
          <p className="text-center text-sm text-red-700 mt-4">
            Ce compte n&apos;a pas encore de profil famille. Demande à un parent de le créer.
          </p>
        )}
      </div>
    </div>
  );
}
