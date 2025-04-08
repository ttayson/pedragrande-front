"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { AuthState, AuthTokens, User } from "./types"
import { authStorage } from "./auth-storage"

interface AuthContextType extends AuthState {
  login: (tokens: AuthTokens, user: User) => void
  logout: () => Promise<void>
  updateUser: (user: User) => void
  updateTokens: (tokens: AuthTokens) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  // Estado inicial da autenticação
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Verificar a validade do token
  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      return data.valid === true
    } catch (error) {
      console.error("Erro ao verificar token:", error)
      return false
    }
  }

  // Inicializa o estado a partir do localStorage e verifica o token
  useEffect(() => {
    const initAuth = async () => {
      // Se estiver na página de login ou unauthorized, não verificar token
      if (
        pathname === "/login" ||
        pathname === "/unauthorized" ||
        pathname.includes("/login") ||
        pathname.includes("/unauthorized")
      ) {
        setAuthState({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        })
        return
      }

      const tokens = authStorage.getTokens()
      const user = authStorage.getUser()

      if (tokens && user) {
        // Verificar se o token é válido
        const isValid = await verifyToken(tokens.accessToken)

        if (isValid) {
          setAuthState({
            user,
            tokens,
            isAuthenticated: true,
            isLoading: false,
          })
        } else {
          // Token inválido, limpar autenticação
          authStorage.clearAuth()
          setAuthState({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
          })

          // Não redirecionar automaticamente se já estiver na página de login ou unauthorized
          if (
            pathname !== "/login" &&
            pathname !== "/unauthorized" &&
            !pathname.includes("/login") &&
            !pathname.includes("/unauthorized")
          ) {
            router.push("/login")
          }
        }
      } else {
        setAuthState({
          user: null,
          tokens: null,
          isAuthenticated: false,
          isLoading: false,
        })
      }
    }

    initAuth()
  }, [router, pathname])

  // Função de login
  const login = (tokens: AuthTokens, user: User) => {
    authStorage.setTokens(tokens)
    authStorage.setUser(user)

    setAuthState({
      user,
      tokens,
      isAuthenticated: true,
      isLoading: false,
    })
  }

  // Função de logout
  const logout = async () => {
    try {
      // Limpar o armazenamento local primeiro
      authStorage.clearAuth()

      // Atualizar o estado
      setAuthState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      })

      // Chamar a API de logout para limpar cookies no servidor
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Importante para incluir cookies
      })

      // Não redirecionar automaticamente, deixar o componente que chamou decidir
    } catch (error) {
      console.error("Erro ao fazer logout:", error)

      // Mesmo em caso de erro, garantir que o estado local esteja limpo
      authStorage.clearAuth()

      setAuthState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }

  // Atualizar dados do usuário
  const updateUser = (user: User) => {
    authStorage.setUser(user)

    setAuthState((prev) => ({
      ...prev,
      user,
    }))
  }

  // Atualizar tokens
  const updateTokens = (tokens: AuthTokens) => {
    authStorage.setTokens(tokens)

    setAuthState((prev) => ({
      ...prev,
      tokens,
    }))
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        updateUser,
        updateTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

