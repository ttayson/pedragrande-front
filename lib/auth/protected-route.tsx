"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "./auth-context"
import { hasPermission } from "./permissions"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
}

export function ProtectedRoute({ children, requiredRoles = [] }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, tokens, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isVerifying, setIsVerifying] = useState(true)

  // Verificar a validade do token
  useEffect(() => {
    const verifyToken = async () => {
      // Se não estiver autenticado ou estiver carregando, não verificar
      if (!isAuthenticated || isLoading || !tokens) {
        setIsVerifying(false)
        return
      }

      try {
        const response = await fetch("/api/auth/verify", {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        })

        if (!response.ok) {
          // Token inválido, fazer logout
          logout()
          return
        }

        const data = await response.json()

        if (!data.valid) {
          // Token inválido, fazer logout
          logout()
        }
      } catch (error) {
        console.error("Erro ao verificar token:", error)
        // Em caso de erro, fazer logout por segurança
        logout()
      } finally {
        setIsVerifying(false)
      }
    }

    verifyToken()
  }, [isAuthenticated, isLoading, tokens, logout])

  useEffect(() => {
    // Não fazer nada se estiver carregando ou verificando
    if (isLoading || isVerifying) return

    // Se não estiver autenticado, redirecionar para login
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    // Verificar permissões de função se necessário
    if (requiredRoles.length > 0 && user) {
      const hasRequiredRole = requiredRoles.includes(user.role)

      if (!hasRequiredRole) {
        router.push(`/unauthorized`)
      }
    }

    // Verificar permissões de acesso para a rota atual
    if (user && !hasPermission(user.role, pathname)) {
      router.push(`/unauthorized`)
    }
  }, [isAuthenticated, isLoading, isVerifying, user, requiredRoles, router, pathname])

  // Mostrar nada enquanto verifica a autenticação
  if (isLoading || isVerifying) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>
  }

  // Se não estiver autenticado, não renderizar nada (vai redirecionar)
  if (!isAuthenticated) {
    return null
  }

  // Se precisar de funções específicas e o usuário não tiver, não renderizar nada (vai redirecionar)
  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    return null
  }

  // Verificar permissões de acesso para a rota atual
  if (user && !hasPermission(user.role, pathname)) {
    return null
  }

  // Se tudo estiver ok, renderizar os filhos
  return <>{children}</>
}

