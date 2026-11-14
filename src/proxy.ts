import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/env";

/**
 * Renova a sessão do Supabase e protege /admin.
 * A autorização fina (papéis/permissões) acontece no servidor e no RLS.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  // Sem Supabase configurado não há sessão para renovar (as páginas mostram o erro de configuração).
  if (!isSupabaseConfigured) return response;

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isAuthed = Boolean(data?.claims?.sub);
  const { pathname } = request.nextUrl;

  if ((pathname.startsWith("/admin") || pathname.startsWith("/preview")) && !isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + request.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/preview/:path*", "/api/admin/:path*", "/login", "/redefinir-senha", "/auth/:path*"],
};
