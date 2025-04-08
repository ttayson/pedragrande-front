"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth/auth-context"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function UnauthorizedPage() {
  const { logout } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoToLogin = async () => {
    setIsLoading(true)
    try {
      // Fazer logout para limpar qualquer estado de autenticação
      await logout()
      // Redirecionar para a página de login
      router.push("/login")
    } catch (error) {
      console.error("Erro ao redirecionar para login:", error)
      // Em caso de erro, tentar redirecionar diretamente
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
          <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Acesso Negado</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Você não tem permissão para acessar esta página. Esta área requer privilégios específicos que não estão
          associados à sua função atual.
        </p>
        <div className="mt-6">
          <Button onClick={handleGoToLogin} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecionando...
              </>
            ) : (
              "Ir para Login"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

