import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup"];

/**
 * Rafraîchit la session Supabase à chaque requête et protège tout le site :
 * l'app entière est privée (carnet de voyage familial), seuls /login et
 * /signup restent accessibles sans session.
 */
export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/login";
  const isPublicRoute = PUBLIC_PATHS.includes(pathname);

  if (!isPublicRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Un compte authentifié mais sans profil famille valide (ligne manquante,
  // colonne pas encore migrée...) est redirigé ici avec ?error= : ne PAS le
  // renvoyer vers "/" dans ce cas, sinon boucle infinie ("/" redemande un
  // profil, échoue, revient sur /login, qui rebondit sur "/", etc.).
  if (isLoginRoute && user && !request.nextUrl.searchParams.has("error")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
