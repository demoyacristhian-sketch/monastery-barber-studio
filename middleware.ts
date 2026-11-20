import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const RUTAS_CLIENTE = ["/espacio-vip", "/mi-ritual"];
const RUTAS_ADMIN   = ["/admin"];
const APP_HOST      = "app.monasterybarbers.es";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const hostname = request.headers.get("host") || "";
  const isAppDomain = hostname === APP_HOST;

  // ── Routing exclusivo del subdominio app.monasterybarbers.es ──────────
  if (isAppDomain) {
    // Manifest y SW propios para el subdominio
    if (pathname === "/manifest.json") {
      return NextResponse.rewrite(new URL("/app-manifest.json", request.url));
    }
    if (pathname === "/sw.js") {
      return NextResponse.rewrite(new URL("/app-sw.js", request.url));
    }
    // Redirige rutas raíz/desconocidas al Espacio VIP
    const skipRewrite =
      pathname.startsWith("/espacio-vip") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/icons") ||
      pathname.startsWith("/images") ||
      pathname.startsWith("/fonts");
    if (!skipRewrite) {
      const url = request.nextUrl.clone();
      url.pathname = pathname === "/" ? "/espacio-vip" : `/espacio-vip${pathname}`;
      return NextResponse.rewrite(url);
    }
  }
  // ─────────────────────────────────────────────────────────────────────

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Rutas de cliente: requieren sesión
  const esRutaCliente = RUTAS_CLIENTE.some((r) => pathname.startsWith(r));
  if (esRutaCliente && !user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Rutas de admin: requieren sesión + rol staff
  // Usamos `=== r || startsWith(r + "/")` para que /admin-login no sea tratado como ruta admin
  const esRutaAdmin = RUTAS_ADMIN.some((r) => pathname === r || pathname.startsWith(r + "/"));
  if (esRutaAdmin) {
    if (!user) return NextResponse.redirect(new URL("/admin-login", request.url));
    const esStaff = user.app_metadata?.role === "staff";
    if (!esStaff) return NextResponse.redirect(new URL("/admin-login", request.url));
  }

  return supabaseResponse;
}

export const config = {
  // admin-login queda excluido explícitamente para evitar cualquier bucle de redirección
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|images|admin-login|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
