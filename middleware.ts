import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const RUTAS_CLIENTE = ["/espacio-vip", "/mi-ritual"];
const RUTAS_ADMIN   = ["/admin"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

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
  const pathname = request.nextUrl.pathname;

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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
