import { NextResponse } from "next/server"

export async function POST() {
  try {
    // Criar uma resposta que limpa o cookie de autenticação
    const response = NextResponse.json({ success: true })

    // Limpar o cookie de autenticação
    response.cookies.set("sambo_auth_token", "", {
      expires: new Date(0),
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

