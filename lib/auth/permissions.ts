import type React from "react"
// Definição de tipos para permissões
export type UserRole = "admin" | "user" | "gerente"

// Interface para itens de navegação com controle de acesso
export interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<any>
  badge?: string
  roles: UserRole[] // Funções que podem acessar este item
}

// Interface para submenus com controle de acesso
export interface SubMenuItem {
  name: string
  href: string
  roles: UserRole[]
}

// Interface para menus com submenu
export interface MenuWithSubmenu {
  name: string
  icon: React.ComponentType<any>
  roles: UserRole[] // Funções que podem ver este menu
  submenu: SubMenuItem[]
}

// Configuração de permissões para rotas
export const routePermissions: Record<string, UserRole[]> = {
  "/dashboard": ["admin", "user", "gerente"],
  "/reservas": ["admin", "user", "gerente"],
  "/check-in": ["admin", "user", "gerente"],
  "/ocupacao": ["admin", "gerente", "user"],
  "/pagamentos": ["admin", "gerente"],
  "/clientes": ["admin", "gerente"],
  "/users": ["admin", "gerente"],
  "/hospedagem/estabelecimentos": ["admin", "gerente"],
  "/hospedagem/acomodacoes": ["admin", "gerente"],
  "/settings/geral": ["admin"],
  "/settings/integracoes": ["admin"],
  "/settings/backup": ["admin"],
  "/settings/profile": ["admin", "user", "gerente"],
  "/settings/security": ["admin", "user", "gerente"],
}

// Verifica se um usuário tem permissão para acessar uma rota
export function hasPermission(role: string | undefined, route: string): boolean {
  if (!role) return false

  // Encontrar a rota mais específica que corresponde
  const matchingRoute = Object.keys(routePermissions)
    .filter((r) => route.startsWith(r))
    .sort((a, b) => b.length - a.length)[0] // Pegar a correspondência mais longa

  if (!matchingRoute) return false

  return routePermissions[matchingRoute].includes(role as UserRole)
}

