import { NextResponse } from "next/server"
import { headers } from "next/headers"

export async function GET() {
  try {
    // Obter o token de autorização do cabeçalho
    const headersList = await headers() // Adicionado await aqui
    const authorization = headersList.get("Authorization")

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Missing or invalid token" }, { status: 401 })
    }

    // Extrair o token
    const token = authorization.split("Bearer ")[1]

    // Simulação de verificação de token
    // Em um aplicativo real, você verificaria a assinatura JWT
    if (token === "mock_jwt_token_for_admin") {
      return NextResponse.json({
        valid: true,
        user: {
          id: "1",
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
        },
      })
    } else if (token === "mock_jwt_token_for_user") {
      return NextResponse.json({
        valid: true,
        user: {
          id: "2",
          name: "Regular User",
          email: "user@example.com",
          role: "user",
        },
      })
    } else if (token === "mock_jwt_token_for_gerente") {
      return NextResponse.json({
        valid: true,
        user: {
          id: "3",
          name: "Gerente",
          email: "gerente@example.com",
          role: "gerente",
        },
      })
    }

    // Token inválido
    return NextResponse.json({ message: "Invalid token", valid: false }, { status: 401 })
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.json({ message: "Internal server error", valid: false }, { status: 500 })
  }
}

