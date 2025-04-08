"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { format, isValid } from "date-fns"
import { NovaReservaModal } from "@/components/nova-reserva-modal"
import { ContinuousCalendar, Select } from "@/components/continuous-calendar"
import { ReservaAccordion } from "@/components/reserva-accordion"

// Importe o locale pt-BR
import { ptBR } from "date-fns/locale"

// Tipos para os dados da API
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
}

interface DataOcupada {
  data: string
  pousadas: string[]
}

export default function ReservasPage() {
  const [selectedPousada, setSelectedPousada] = useState<string>("todas")
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [isNovaReservaModalOpen, setIsNovaReservaModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [datasOcupadas, setDatasOcupadas] = useState<DataOcupada[]>([])
  const [reservasAtivas, setReservasAtivas] = useState<Reserva[]>([])
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())

  // Opções para o select de pousadas
  const pousadaOptions = [
    { name: "Todas as Pousadas", value: "todas" },
    { name: "Pousada 1", value: "Pousada 1" },
    { name: "Pousada 2", value: "Pousada 2" },
    { name: "Pousada 3", value: "Pousada 3" },
  ]

  // Carregar dados do mês atual ao iniciar
  useEffect(() => {
    fetchCalendarDataForMonth(currentMonth, currentYear)
  }, [])

  // Função para buscar dados do calendário para um mês específico
  const fetchCalendarDataForMonth = async (month: number, year: number) => {
    setIsLoading(true)
    try {
      console.log(`Buscando dados para ${monthNames[month]} de ${year}`)

      // Format the date range for the API
      const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`
      const lastDay = new Date(year, month + 1, 0).getDate()
      const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${lastDay}`

      // Fetch data from the API
      const response = await fetch(`/api/reservas?dataInicio=${startDate}&dataFim=${endDate}`)

      if (!response.ok) {
        throw new Error("Failed to fetch calendar data")
      }

      const reservasData = await response.json()

      // Transform the data to the format expected by the calendar
      const datasOcupadas = reservasData.map((reserva: any) => ({
        data: reserva.dataCheckIn.split("T")[0], // Garantir formato YYYY-MM-DD
        pousadas: [reserva.estabelecimento.nome],
      }))

      setDatasOcupadas(datasOcupadas)
      setIsLoading(false)
    } catch (error) {
      console.error("Erro ao carregar dados do calendário:", error)
      setDatasOcupadas([])
      setIsLoading(false)
    }
  }

  // Função para verificar se um dia tem reservas
  const isDayOcupado = (day: Date) => {
    // Verificar se day é válido antes de prosseguir
    if (!day || !isValid(day) || isLoading) {
      return false
    }

    const formattedDate = format(day, "yyyy-MM-dd")
    const dataOcupada = datasOcupadas.find((d) => d.data === formattedDate)

    if (!dataOcupada) {
      return false
    }

    if (selectedPousada === "todas") {
      return dataOcupada.pousadas.length > 0
    } else {
      return dataOcupada.pousadas.includes(selectedPousada)
    }
  }

  // Função para lidar com a seleção de um dia
  const handleDaySelect = async (day: number, month: number, year: number) => {
    const selectedDate = new Date(year, month, day)
    if (isValid(selectedDate)) {
      setSelectedDay(selectedDate)

      // Buscar dados específicos para a data selecionada
      await fetchReservasForDay(selectedDate)
    }
  }

  // Função para buscar reservas para um dia específico
  const fetchReservasForDay = async (day: Date) => {
    if (!day || !isValid(day)) {
      return
    }

    setIsLoading(true)
    try {
      const formattedDate = format(day, "yyyy-MM-dd")

      // Fetch data from the API
      const response = await fetch(`/api/reservas?dataInicio=${formattedDate}&dataFim=${formattedDate}`)

      if (!response.ok) {
        throw new Error("Failed to fetch reservations for day")
      }

      const reservasData = await response.json()

      // Transformar os dados para o formato esperado pelo componente ReservaAccordion
      const reservasFormatadas = reservasData.map((r: any) => ({
        id: r.id,
        pousada: r.estabelecimento.nome,
        quarto: r.acomodacao.numeroQuarto,
        capacidade: r.acomodacao.capacidade,
        data: r.dataCheckIn.split("T")[0],
        status: r.status,
        hospede: {
          nome: r.cliente.nome,
          email: r.cliente.email,
          telefone: r.cliente.telefone,
        },
        checkIn: "14:00", // Valores padrão, ajustar conforme necessário
        checkOut: "12:00",
        formaPagamento: r.valorPago > 0 ? "Pago parcialmente" : "Pendente",
        observacoes: r.observacoes,
      }))

      // Filter reservas based on the selected pousada
      let filteredReservas = reservasFormatadas
      if (selectedPousada !== "todas") {
        filteredReservas = filteredReservas.filter((r: any) => r.pousada === selectedPousada)
      }

      setReservasAtivas(filteredReservas)
      setIsLoading(false)
    } catch (error) {
      console.error("Erro ao carregar reservas para o dia:", error)
      setReservasAtivas([])
      setIsLoading(false)
    }
  }

  // Função para alternar a pousada selecionada
  const handlePousadaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const pousada = event.target.value
    setSelectedPousada(pousada)

    // Se houver uma data selecionada, recarregar as reservas para a nova pousada
    if (selectedDay) {
      fetchReservasForDay(selectedDay)
    }
  }

  // Função para lidar com a mudança de mês no calendário
  const handleMonthChange = (month: number, year: number) => {
    if (month !== currentMonth || year !== currentYear) {
      setCurrentMonth(month)
      setCurrentYear(year)
      fetchCalendarDataForMonth(month, year)
    }
  }

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Reservas</h1>
        <p className="text-muted-foreground">Gerencie as reservas das pousadas</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Calendário de Reservas</CardTitle>
              <CardDescription>Visualize e gerencie as reservas por data</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select name="pousada" value={selectedPousada} options={pousadaOptions} onChange={handlePousadaChange} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <ContinuousCalendar
                onClick={handleDaySelect}
                isDayOcupado={isDayOcupado}
                selectedDate={selectedDay}
                onMonthChange={handleMonthChange}
                locale={ptBR}
              />

              <div className="flex items-center justify-end space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 rounded-sm bg-red-100 dark:bg-red-900/20"></div>
                  <span>Ocupado</span>
                </div>
                <div className="flex items-center">
                  <div className="mr-1 h-3 w-3 rounded-sm bg-background border"></div>
                  <span>Disponível</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDay ? `Reservas para ${format(selectedDay, "dd/MM/yyyy")}` : "Selecione uma data"}
            </CardTitle>
            <CardDescription>
              {selectedDay
                ? "Detalhes das reservas para esta data"
                : "Clique em uma data no calendário para ver as reservas"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <p>Carregando...</p>
              </div>
            ) : selectedDay ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">
                    {reservasAtivas.length > 0
                      ? `${reservasAtivas.length} reserva(s) encontrada(s)`
                      : "Nenhuma reserva encontrada"}
                  </h3>
                  <Button onClick={() => setIsNovaReservaModalOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Nova Reserva
                  </Button>
                </div>

                {reservasAtivas.length > 0 ? (
                  <ReservaAccordion reservas={reservasAtivas} />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">Não há reservas para esta data.</div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                <p>Selecione uma data no calendário para ver as reservas</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedDay && (
        <NovaReservaModal
          isOpen={isNovaReservaModalOpen}
          onClose={() => setIsNovaReservaModalOpen(false)}
          data={selectedDay}
        />
      )}
    </div>
  )
}

