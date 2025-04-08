"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { format, isValid } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { UserIcon, ClockIcon, BedIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Adicionar importação para useToast
import { useToast } from "@/components/ui/use-toast"
import { useEffect, useState } from "react"

// Adicione a interface para ReservationAddon se não existir
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

// Atualize a interface Reservation para incluir adicionais
interface Reservation {
  // Campos existentes...
  ReservationAddon?: ReservationAddon[]
}

interface ReservaModalProps {
  isOpen: boolean
  onClose: () => void
  data: Date
  reservas: any[]
  onNovaReserva: () => void
}

export function ReservaModal({ isOpen, onClose, data, reservas, onNovaReserva }: ReservaModalProps) {
  // Verificar se a data é válida
  if (!data || !isValid(data)) {
    return null
  }

  // Dentro da função ReservaModal, adicionar:
  const { toast } = useToast()
  const [hasReservas, setHasReservas] = useState(false)
  const [pousadasComReservas, setPousadasComReservas] = useState<string[]>([])

  useEffect(() => {
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
      {} as Record<string, any[]>,
    )

    // Verificar se há pousadas com reservas
    const pousadas = Object.keys(reservasPorPousada)
    setHasReservas(pousadas.length > 0)
    setPousadasComReservas(pousadas)
  }, [reservas])

  // Adicionar função para criar nova reserva

  const handleNovaReserva = () => {
    onNovaReserva()
    toast({
      title: "Nova reserva",
      description: "Formulário de nova reserva aberto",
    })
  }

  // Dados simulados de hóspedes
  const hospedes = [
    { nome: "João Silva", email: "joao@example.com", telefone: "(11) 98765-4321" },
    { nome: "Maria Oliveira", email: "maria@example.com", telefone: "(11) 91234-5678" },
    { nome: "Carlos Santos", email: "carlos@example.com", telefone: "(11) 97654-3210" },
    { nome: "Ana Pereira", email: "ana@example.com", telefone: "(11) 98877-6655" },
    { nome: "Pedro Costa", email: "pedro@example.com", telefone: "(11) 99988-7766" },
  ]

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
    {} as Record<string, any[]>,
  )

  // Verificar se há pousadas com reservas
  //const pousadasComReservas = Object.keys(reservasPorPousada)
  //const temReservas = pousadasComReservas.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Reservas para {format(data, "dd 'de' MMMM 'de' yyyy")}</DialogTitle>
          <DialogDescription>Detalhes das reservas para esta data.</DialogDescription>
        </DialogHeader>

        <div className="my-4">
          {hasReservas ? (
            <Tabs defaultValue={pousadasComReservas[0]} className="w-full">
              <TabsList className="w-full">
                {pousadasComReservas.map((pousada) => (
                  <TabsTrigger key={pousada} value={pousada} className="flex-1">
                    {pousada}
                  </TabsTrigger>
                ))}
              </TabsList>

              {pousadasComReservas.map((pousada) => (
                <TabsContent key={pousada} value={pousada} className="space-y-4 mt-4">
                  {reservasPorPousada[pousada].map((reserva, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg">Quarto {reserva.quarto}</h3>
                        <Badge variant="destructive">Ocupado</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                          <span>{hospedes[index % hospedes.length].nome}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BedIcon className="h-4 w-4 text-muted-foreground" />
                          <span>Capacidade: {reserva.capacidade} pessoas</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-muted-foreground" />
                          <span>Check-in: 14:00</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ClockIcon className="h-4 w-4 text-muted-foreground" />
                          <span>Check-out: 12:00</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Contato:</span>
                          <span>{hospedes[index % hospedes.length].telefone}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{hospedes[index % hospedes.length].email}</span>
                        </div>
                      </div>
                      {/* Adicione uma seção para mostrar os adicionais na visualização da reserva */}
                      {reserva && (
                        <div className="mt-4">
                          <h3 className="font-medium">Adicionais</h3>
                          {reserva.ReservationAddon && reserva.ReservationAddon.length > 0 ? (
                            <ul className="mt-2 space-y-1">
                              {reserva.ReservationAddon.map((item) => (
                                <li key={item.id} className="flex justify-between">
                                  <span>{item.addon.nome}</span>
                                  <span>{item.addon.preco}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">Nenhum adicional selecionado</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Não há reservas para esta data.</div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={handleNovaReserva}>Nova Reserva</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

