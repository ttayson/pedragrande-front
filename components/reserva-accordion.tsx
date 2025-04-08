"use client"
import { Badge } from "@/components/ui/badge"
import { UserIcon, ClockIcon, BedIcon } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface ReservationAddon {
  id: string
  reservationId: string
  addonId: string
  addon: {
    id: string
    nome: string
    descricao: string
    preco: number
  }
}

interface Reserva {
  id: string
  pousada: string
  quarto: string
  capacidade: number
  data: string
  status: string
  hospede: {
    nome: string
    email: string
    telefone: string
  }
  checkIn: string
  checkOut: string
  formaPagamento?: string
  observacoes?: string
  ReservationAddon?: ReservationAddon[]
}

interface ReservaAccordionProps {
  reservas: Reserva[]
}

export function ReservaAccordion({ reservas }: ReservaAccordionProps) {
  const { toast } = useToast()
  const [loadingReservaId, setLoadingReservaId] = useState<string | null>(null)

  const cancelarReserva = async (reservaId: string) => {
    setLoadingReservaId(reservaId)
    try {
      const response = await fetch(`/api/reservas/${reservaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "CANCELADA",
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao cancelar reserva")
      }

      toast({
        title: "Reserva cancelada",
        description: "A reserva foi cancelada com sucesso",
      })

      // Aqui você poderia atualizar a lista de reservas ou recarregar os dados
    } catch (error) {
      console.error("Erro ao cancelar reserva:", error)
      toast({
        title: "Erro",
        description: "Não foi possível cancelar a reserva",
        variant: "destructive",
      })
    } finally {
      setLoadingReservaId(null)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Agrupar reservas por pousada
  const reservasPorPousada = reservas.reduce(
    (acc, reserva) => {
      const pousada = reserva.pousada
      if (!acc[pousada]) {
        acc[pousada] = []
      }
      acc[pousada].push(reserva)
      return acc
    },
    {} as Record<string, Reserva[]>,
  )

  // Verificar se há pousadas com reservas
  const pousadasComReservas = Object.keys(reservasPorPousada)

  return (
    <Accordion type="single" collapsible className="w-full">
      {pousadasComReservas.map((pousada) => (
        <AccordionItem key={pousada} value={pousada}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center justify-between w-full">
              <span className="font-medium">{pousada}</span>
              <Badge variant="outline" className="ml-2">
                {reservasPorPousada[pousada].length} reserva(s)
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              {reservasPorPousada[pousada].map((reserva) => (
                <div key={reserva.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Quarto {reserva.quarto}</h3>
                    <Badge variant="destructive">{reserva.status}</Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{reserva.hospede.nome}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BedIcon className="h-4 w-4 text-muted-foreground" />
                      <span>Capacidade: {reserva.capacidade} pessoas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-muted-foreground" />
                      <span>Check-in: {reserva.checkIn}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-muted-foreground" />
                      <span>Check-out: {reserva.checkOut}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Contato:</span>
                      <span>{reserva.hospede.telefone}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{reserva.hospede.email}</span>
                    </div>
                    {reserva.formaPagamento && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pagamento:</span>
                        <span>{reserva.formaPagamento}</span>
                      </div>
                    )}
                    {reserva.observacoes && (
                      <div className="mt-2 text-sm">
                        <span className="text-muted-foreground">Observações:</span>
                        <p className="mt-1">{reserva.observacoes}</p>
                      </div>
                    )}
                  </div>
                  {reserva.ReservationAddon && reserva.ReservationAddon.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium">Adicionais:</h4>
                      <ul className="mt-1">
                        {reserva.ReservationAddon.map((item) => (
                          <li key={item.id} className="text-sm flex justify-between">
                            <span>{item.addon.nome}</span>
                            <span>{formatCurrency(item.addon.preco)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {reserva.status !== "CANCELADA" && (
                    <div className="mt-2 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelarReserva(reserva.id)}
                        disabled={loadingReservaId === reserva.id}
                      >
                        {loadingReservaId === reserva.id ? "Cancelando..." : "Cancelar Reserva"}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

