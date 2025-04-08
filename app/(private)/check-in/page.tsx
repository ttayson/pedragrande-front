"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"
import { Search, CheckCircle, XCircle, Clock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

type Reserva = {
  id: string
  cliente: string
  dataInicio: string
  dataFim: string
  acomodacao: string
  status: "pendente" | "confirmada" | "cancelada" | "concluida"
  valorTotal: number
  observacoes?: string
  telefone: string
  email: string
  hospedes: number
}

export default function CheckInPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [filteredReservas, setFilteredReservas] = useState<Reserva[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dataFiltro, setDataFiltro] = useState<Date | undefined>(new Date())

  useEffect(() => {
    // Simular carregamento de dados da API
    const fetchReservas = async () => {
      try {
        // Aqui seria uma chamada real para a API
        const mockReservas: Reserva[] = [
          {
            id: "1",
            cliente: "João Silva",
            dataInicio: "2023-05-15",
            dataFim: "2023-05-20",
            acomodacao: "Suíte Master",
            status: "confirmada",
            valorTotal: 1250.0,
            telefone: "(11) 98765-4321",
            email: "joao.silva@email.com",
            hospedes: 2,
            observacoes: "Prefere quarto longe do elevador",
          },
          {
            id: "2",
            cliente: "Maria Oliveira",
            dataInicio: "2023-05-16",
            dataFim: "2023-05-18",
            acomodacao: "Quarto Standard",
            status: "pendente",
            valorTotal: 450.0,
            telefone: "(21) 98765-4321",
            email: "maria.oliveira@email.com",
            hospedes: 1,
          },
          {
            id: "3",
            cliente: "Carlos Pereira",
            dataInicio: "2023-05-14",
            dataFim: "2023-05-21",
            acomodacao: "Suíte Luxo",
            status: "confirmada",
            valorTotal: 2100.0,
            telefone: "(31) 98765-4321",
            email: "carlos.pereira@email.com",
            hospedes: 3,
            observacoes: "Aniversário de casamento",
          },
          {
            id: "4",
            cliente: "Ana Souza",
            dataInicio: "2023-05-17",
            dataFim: "2023-05-19",
            acomodacao: "Quarto Duplo",
            status: "cancelada",
            valorTotal: 600.0,
            telefone: "(41) 98765-4321",
            email: "ana.souza@email.com",
            hospedes: 2,
          },
          {
            id: "5",
            cliente: "Pedro Santos",
            dataInicio: "2023-05-15",
            dataFim: "2023-05-16",
            acomodacao: "Quarto Standard",
            status: "concluida",
            valorTotal: 225.0,
            telefone: "(51) 98765-4321",
            email: "pedro.santos@email.com",
            hospedes: 1,
          },
        ]

        setReservas(mockReservas)
        setFilteredReservas(mockReservas)
        setIsLoading(false)
      } catch (error) {
        console.error("Erro ao carregar reservas:", error)
        setIsLoading(false)
      }
    }

    fetchReservas()
  }, [])

  useEffect(() => {
    if (reservas.length > 0) {
      let filtered = [...reservas]

      // Filtrar por termo de busca
      if (searchTerm) {
        filtered = filtered.filter(
          (reserva) =>
            reserva.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reserva.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reserva.acomodacao.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      }

      // Filtrar por data
      if (dataFiltro) {
        const dataFiltroStr = dataFiltro.toISOString().split("T")[0]
        filtered = filtered.filter((reserva) => reserva.dataInicio <= dataFiltroStr && reserva.dataFim >= dataFiltroStr)
      }

      setFilteredReservas(filtered)
    }
  }, [searchTerm, dataFiltro, reservas])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmada":
        return <Badge className="bg-green-500">Confirmada</Badge>
      case "pendente":
        return <Badge className="bg-yellow-500">Pendente</Badge>
      case "cancelada":
        return <Badge className="bg-red-500">Cancelada</Badge>
      case "concluida":
        return <Badge className="bg-blue-500">Concluída</Badge>
      default:
        return <Badge className="bg-gray-500">Desconhecido</Badge>
    }
  }

  const handleCheckIn = (id: string) => {
    // Lógica para realizar check-in
    alert(`Check-in realizado para a reserva ${id}`)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Check-in</h1>
        <p className="text-muted-foreground">Gerencie os check-ins de hóspedes</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por cliente, ID ou acomodação..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div>
          <DatePicker date={dataFiltro} setDate={setDataFiltro} />
        </div>
      </div>

      <Tabs defaultValue="hoje" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hoje">Hoje</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
          <TabsTrigger value="todos">Todos</TabsTrigger>
        </TabsList>

        <TabsContent value="hoje" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Carregando check-ins...</p>
            </div>
          ) : filteredReservas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">Nenhum check-in encontrado para hoje.</p>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {filteredReservas.map((reserva) => (
                <AccordionItem key={reserva.id} value={reserva.id}>
                  <AccordionTrigger className="hover:bg-accent hover:no-underline px-4 rounded-md">
                    <div className="flex flex-1 items-center justify-between pr-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium text-left">{reserva.cliente}</p>
                          <p className="text-sm text-muted-foreground text-left">
                            {reserva.acomodacao} • {reserva.hospedes} hóspede(s)
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">{getStatusBadge(reserva.status)}</div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Informações do Hóspede</h4>
                            <p className="text-sm">
                              <span className="font-medium">Telefone:</span> {reserva.telefone}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Email:</span> {reserva.email}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Informações da Reserva</h4>
                            <p className="text-sm">
                              <span className="font-medium">Check-in:</span>{" "}
                              {new Date(reserva.dataInicio).toLocaleDateString()}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Check-out:</span>{" "}
                              {new Date(reserva.dataFim).toLocaleDateString()}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Valor:</span> R$ {reserva.valorTotal.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        {reserva.observacoes && (
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Observações</h4>
                            <p className="text-sm">{reserva.observacoes}</p>
                          </div>
                        )}
                        <div className="flex justify-end gap-2 pt-2">
                          {reserva.status === "confirmada" && (
                            <Button
                              onClick={() => handleCheckIn(reserva.id)}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Realizar Check-in
                            </Button>
                          )}
                          {reserva.status === "pendente" && (
                            <>
                              <Button variant="outline">
                                <XCircle className="h-4 w-4 mr-2" />
                                Cancelar
                              </Button>
                              <Button
                                onClick={() => handleCheckIn(reserva.id)}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirmar e Check-in
                              </Button>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </TabsContent>

        <TabsContent value="pendentes">
          <Card>
            <CardHeader>
              <CardTitle>Check-ins Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">Carregando check-ins pendentes...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-muted-foreground">Lista de check-ins pendentes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="concluidos">
          <Card>
            <CardHeader>
              <CardTitle>Check-ins Concluídos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">Carregando check-ins concluídos...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-muted-foreground">Lista de check-ins concluídos</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="todos">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">Carregando todos os check-ins...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-muted-foreground">Lista completa de check-ins</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

