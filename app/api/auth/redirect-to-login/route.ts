import { NextResponse } from "next/server"

export async function GET() {
  // Criar uma resposta que redireciona para a página de login
  const response = NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"))

  // Limpar o cookie de autenticação
  response.cookies.set("sambo_auth_token", "", {
    expires: new Date(0),
    path: "/",
  })

  return response
}

