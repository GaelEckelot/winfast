import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const runtime = "nodejs";

/** Exchanges the email-confirmation / magic-link code for a session,
 *  then sends the user to the app. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  if (code && isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(origin);
}
