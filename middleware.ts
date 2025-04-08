import { type NextRequest, NextResponse } from "next/server"

// Rotas públicas que não exigem autenticação
const publicRoutes = ["/login", "/forgot-password", "/reset-password", "/unauthorized"]

// Verifica se a rota atual é pública
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Redirecionar a raiz para o dashboard
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Se for uma rota de login, sempre permitir o acesso
  if (pathname === "/login" || pathname.includes("/login")) {
    return NextResponse.next()
  }

  // Verificar token de autenticação para rotas protegidas
  const authToken = request.cookies.get("sambo_auth_token")?.value

  // Verificar se a rota atual é pública
  const isPublic = isPublicRoute(pathname)

  // Se não for rota pública e não tiver token, redirecionar para login
  if (!isPublic && !authToken) {
    const searchParams = new URLSearchParams({
      redirect: pathname,
    })
    return NextResponse.redirect(new URL(`/login?${searchParams}`, request.url))
  }

  // Se for rota de login e já estiver autenticado, redirecionar para dashboard
  // Removemos esta verificação para permitir sempre o acesso à página de login
  // if (pathname === "/login" && authToken) {
  //   return NextResponse.redirect(new URL("/dashboard", request.url))
  // }

  return NextResponse.next()
}

export const config = {
  // Ignorar arquivos estáticos e rotas de API
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

