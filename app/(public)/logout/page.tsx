"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth/auth-context"
import { Loader2 } from "lucide-react"

export default function LogoutPage() {
  const { logout } = useAuth()

  useEffect(() => {
    // Executar o logout quando a página for carregada
    logout()
  }, [logout])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg">Saindo...</p>
      </div>
    </div>
  )
}

