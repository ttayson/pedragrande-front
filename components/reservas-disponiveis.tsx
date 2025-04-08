"use client"

import { Button } from "@/components/ui/button"
import { format, addDays } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useRouter } from "next/navigation"

export function ReservasDisponiveis() {
  const router = useRouter()
  const hoje = new Date()

  // Dados simulados de disponibilidade
  const disponibilidade = [
    {
      data: addDays(hoje, 1),
      pousada1: true,
      pousada2: false,
    },
    {
      data: addDays(hoje, 2),
      pousada1: true,
      pousada2: true,
    },
    {
      data: addDays(hoje, 3),
      pousada1: false,
      pousada2: true,
    },
    {
      data: addDays(hoje, 5),
      pousada1: true,
      pousada2: true,
    },
    {
      data: addDays(hoje, 7),
      pousada1: true,
      pousada2: false,
    },
  ]

  return (
    <div className="space-y-4">
      {disponibilidade.map((item, index) => (
        <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
          <div>
            <div className="font-medium">{format(item.data, "EEEE, dd 'de' MMMM", { locale: ptBR })}</div>
            <div className="text-sm text-muted-foreground">
              {item.pousada1 && item.pousada2
                ? "Disponível em ambas as pousadas"
                : item.pousada1
                  ? "Disponível apenas na Pousada 1"
                  : "Disponível apenas na Pousada 2"}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push("/reservas")}>
            Reservar
          </Button>
        </div>
      ))}
    </div>
  )
}

