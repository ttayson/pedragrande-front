import type { AuthTokens, User } from "./types"

// Chaves para armazenamento local
const TOKEN_KEY = "sambo_auth_token"
const REFRESH_TOKEN_KEY = "sambo_refresh_token"
const USER_KEY = "sambo_user"

// Funções para lidar com tokens no localStorage
export const authStorage = {
  // Obter tokens
  getTokens: (): AuthTokens | null => {
    if (typeof window === "undefined") return null

    const accessToken = localStorage.getItem(TOKEN_KEY)
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY)

    if (!accessToken) return null

    return {
      accessToken,
      refreshToken: refreshToken || undefined,
    }
  },

  // Salvar tokens
  setTokens: (tokens: AuthTokens): void => {
    if (typeof window === "undefined") return

    localStorage.setItem(TOKEN_KEY, tokens.accessToken)

    // Também definir como cookie para o middleware
    document.cookie = `${TOKEN_KEY}=${tokens.accessToken}; path=/; max-age=86400; SameSite=Strict`

    if (tokens.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
    }
  },

  // Remover tokens
  clearTokens: (): void => {
    if (typeof window === "undefined") return

    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)

    // Também remover o cookie
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`
  },

  // Obter usuário
  getUser: (): User | null => {
    if (typeof window === "undefined") return null

    const userJson = localStorage.getItem(USER_KEY)
    if (!userJson) return null

    try {
      return JSON.parse(userJson)
    } catch (error) {
      console.error("Error parsing user from localStorage", error)
      return null
    }
  },

  // Salvar usuário
  setUser: (user: User): void => {
    if (typeof window === "undefined") return

    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  // Remover usuário
  clearUser: (): void => {
    if (typeof window === "undefined") return

    localStorage.removeItem(USER_KEY)
  },

  // Limpar todos os dados de autenticação
  clearAuth: (): void => {
    authStorage.clearTokens()
    authStorage.clearUser()
  },
}

