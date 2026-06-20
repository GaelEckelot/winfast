import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";

/** Refreshes the Supabase session on every request and gates access:
 *  unauthenticated users are redirected to /login. No-op until Supabase
 *  is configured (the app then keeps working in localStorage mode). */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic =
    path.startsWith("/login") || path.startsWith("/auth") || path.startsWith("/api");

  // Not signed in → send to login (except on public/auth/api routes).
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  // Already signed in → keep them out of the login page.
  if (user && path.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}
