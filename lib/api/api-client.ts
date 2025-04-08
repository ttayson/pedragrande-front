import { authStorage } from "../auth/auth-storage"

interface ApiOptions extends RequestInit {
  requiresAuth?: boolean
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

export async function apiClient<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { requiresAuth = true, ...fetchOptions } = options

  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`

  // Configuração padrão
  const config: RequestInit = {
    method: fetchOptions.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  }

  // Adicionar token de autenticação se necessário
  if (requiresAuth) {
    const tokens = authStorage.getTokens()

    if (tokens) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${tokens.accessToken}`,
      }
    }
  }

  // Converter corpo para JSON se for um objeto
  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body)
  }

  try {
    const response = await fetch(url, config)

    // Verificar se a resposta foi bem-sucedida
    if (!response.ok) {
      const error = await response.json().catch(() => ({}))

      // Se o token expirou (401), limpar a autenticação e redirecionar
      if (response.status === 401) {
        authStorage.clearAuth()

        // Redirecionar para login se estamos no navegador
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
      }

      throw new Error(error.message || `API error: ${response.statusText}`)
    }

    // Se a resposta for 204 No Content, retornar null
    if (response.status === 204) {
      return null as T
    }

    // Tentar analisar a resposta como JSON
    return await response.json()
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

