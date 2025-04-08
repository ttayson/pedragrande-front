import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Obter dados do corpo da requisição
    const body = await request.json()
    const { email, password } = body

    // Simulação de validação de credenciais com diferentes funções
    // Em um aplicativo real, você verificaria em um banco de dados
    if (email === "admin@example.com" && password === "password") {
      return NextResponse.json({
        user: {
          id: "1",
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
        },
        tokens: {
          accessToken: "mock_jwt_token_for_admin",
          refreshToken: "mock_refresh_token_for_admin",
        },
      })
    } else if (email === "user@example.com" && password === "password") {
      return NextResponse.json({
        user: {
          id: "2",
          name: "Regular User",
          email: "user@example.com",
          role: "user",
        },
        tokens: {
          accessToken: "mock_jwt_token_for_user",
          refreshToken: "mock_refresh_token_for_user",
        },
      })
    } else if (email === "gerente@example.com" && password === "password") {
      return NextResponse.json({
        user: {
          id: "3",
          name: "Gerente",
          email: "gerente@example.com",
          role: "gerente",
        },
        tokens: {
          accessToken: "mock_jwt_token_for_gerente",
          refreshToken: "mock_refresh_token_for_gerente",
        },
      })
    }

    // Credenciais inválidas
    return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

