"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Download, Eye, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { format } from "date-fns"
import { DetalhePagamentoModal } from "@/components/detalhe-pagamento-modal"

// Tipos para os dados
interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
  cpf?: string
}

interface Pagamento {
  id: string
  reservaId: string
  clienteId: string
  cliente: Cliente
  pousada: string
  quarto: string
  dataEntrada: string
  dataSaida: string
  valorTotal: number
  valorPago: number
  status: "pago" | "pendente" | "parcial" | "cancelado"
  metodoPagamento: string
  dataPagamento?: string
  parcelas?: number
  observacoes?: string
}

export default function PagamentosPage() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filtro, setFiltro] = useState("todos")
  const [busca, setBusca] = useState("")
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState<Pagamento | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Carregar dados de pagamentos
  useEffect(() => {
    const fetchPagamentos = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/pagamentos")
        if (!response.ok) {
          throw new Error("Failed to fetch payments")
        }
        const data = await response.json()
        setPagamentos(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Erro ao carregar pagamentos:", error)
        setIsLoading(false)
      }
    }

    fetchPagamentos()
  }, [])

  // Filtrar pagamentos
  const pagamentosFiltrados = pagamentos.filter((pagamento) => {
    // Filtrar por status
    if (filtro !== "todos" && pagamento.status !== filtro) {
      return false
    }

    // Filtrar por busca (nome do cliente, id da reserva, pousada)
    if (busca) {
      const termoBusca = busca.toLowerCase()
      return (
        pagamento.cliente.nome.toLowerCase().includes(termoBusca) ||
        pagamento.reservaId.toLowerCase().includes(termoBusca) ||
        pagamento.pousada.toLowerCase().includes(termoBusca)
      )
    }

    return true
  })

  // Calcular estatísticas
  const totalRecebido = pagamentos
    .filter((p) => p.status === "pago" || p.status === "parcial")
    .reduce((total, p) => total + p.valorPago, 0)

  const totalPendente = pagamentos
    .filter((p) => p.status === "pendente" || p.status === "parcial")
    .reduce((total, p) => total + (p.valorTotal - p.valorPago), 0)

  const totalReservas = pagamentos.length
  const reservasPagas = pagamentos.filter((p) => p.status === "pago").length

  // Abrir modal de detalhes
  const abrirDetalhes = (pagamento: Pagamento) => {
    setPagamentoSelecionado(pagamento)
    setIsModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Pagamentos</h1>
        <p className="text-muted-foreground">Gerencie os pagamentos das reservas</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalRecebido.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {reservasPagas} de {totalReservas} reservas pagas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalPendente.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {pagamentos.filter((p) => p.status === "pendente").length} reservas pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Parciais</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagamentos.filter((p) => p.status === "parcial").length}</div>
            <p className="text-xs text-muted-foreground">Reservas com pagamento parcial</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalReservas ? Math.round((reservasPagas / totalReservas) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Reservas confirmadas e pagas</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de pagamentos */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Pagamentos de Reservas</CardTitle>
              <CardDescription>Gerencie os pagamentos de todas as reservas</CardDescription>
            </div>

            <Tabs defaultValue="todos" className="w-full sm:w-auto" onValueChange={setFiltro}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="pago">Pagos</TabsTrigger>
                <TabsTrigger value="pendente">Pendentes</TabsTrigger>
                <TabsTrigger value="parcial">Parciais</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, reserva..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Carregando pagamentos...</p>
            </div>
          ) : pagamentosFiltrados.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Nenhum pagamento encontrado</p>
            </div>
          ) : (
            <div className="w-full min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reserva</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Pousada</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Valor Pago</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagamentosFiltrados.map((pagamento) => (
                    <TableRow key={pagamento.id}>
                      <TableCell className="font-medium">{pagamento.reservaId}</TableCell>
                      <TableCell>{pagamento.cliente.nome}</TableCell>
                      <TableCell>
                        {pagamento.pousada} - {pagamento.quarto}
                      </TableCell>
                      <TableCell>
                        {format(new Date(pagamento.dataEntrada), "dd/MM/yyyy")} a{" "}
                        {format(new Date(pagamento.dataSaida), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>R$ {pagamento.valorTotal.toFixed(2)}</TableCell>
                      <TableCell>R$ {pagamento.valorPago.toFixed(2)}</TableCell>
                      <TableCell>
                        <StatusBadge status={pagamento.status} />
                      </TableCell>
                      <TableCell>{pagamento.metodoPagamento}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => abrirDetalhes(pagamento)}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Ver detalhes</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes do pagamento */}
      {pagamentoSelecionado && (
        <DetalhePagamentoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          pagamento={pagamentoSelecionado}
        />
      )}
    </div>
  )
}

// Componente para exibir o status do pagamento
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pago":
      return <Badge variant="success">Pago</Badge>
    case "pendente":
      return <Badge variant="warning">Pendente</Badge>
    case "parcial":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          Parcial
        </Badge>
      )
    case "cancelado":
      return <Badge variant="destructive">Cancelado</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// Dados simulados
const dadosPagamentos: Pagamento[] = [
  {
    id: "PAG001",
    reservaId: "RES001",
    clienteId: "CLI001",
    cliente: {
      id: "CLI001",
      nome: "João Silva",
      email: "joao@example.com",
      telefone: "(11) 98765-4321",
      cpf: "123.456.789-00",
    },
    pousada: "Pousada 1",
    quarto: "101",
    dataEntrada: "2025-03-15",
    dataSaida: "2025-03-18",
    valorTotal: 1200.0,
    valorPago: 1200.0,
    status: "pago",
    metodoPagamento: "Cartão de Crédito",
    dataPagamento: "2025-02-20",
    parcelas: 2,
    observacoes: "Pagamento confirmado",
  },
  {
    id: "PAG002",
    reservaId: "RES002",
    clienteId: "CLI002",
    cliente: {
      id: "CLI002",
      nome: "Maria Oliveira",
      email: "maria@example.com",
      telefone: "(11) 91234-5678",
      cpf: "987.654.321-00",
    },
    pousada: "Pousada 1",
    quarto: "102",
    dataEntrada: "2025-03-15",
    dataSaida: "2025-03-20",
    valorTotal: 2000.0,
    valorPago: 1000.0,
    status: "parcial",
    metodoPagamento: "PIX",
    dataPagamento: "2025-02-25",
    observacoes: "Pagamento parcial, restante na entrada",
  },
  {
    id: "PAG003",
    reservaId: "RES003",
    clienteId: "CLI003",
    cliente: {
      id: "CLI003",
      nome: "Carlos Santos",
      email: "carlos@example.com",
      telefone: "(11) 97654-3210",
      cpf: "456.789.123-00",
    },
    pousada: "Pousada 2",
    quarto: "201",
    dataEntrada: "2025-03-10",
    dataSaida: "2025-03-12",
    valorTotal: 800.0,
    valorPago: 0.0,
    status: "pendente",
    metodoPagamento: "Dinheiro",
    observacoes: "Pagamento será realizado na entrada",
  },
  {
    id: "PAG004",
    reservaId: "RES004",
    clienteId: "CLI004",
    cliente: {
      id: "CLI004",
      nome: "Ana Pereira",
      email: "ana@example.com",
      telefone: "(11) 98877-6655",
      cpf: "789.123.456-00",
    },
    pousada: "Pousada 3",
    quarto: "301",
    dataEntrada: "2025-03-05",
    dataSaida: "2025-03-07",
    valorTotal: 900.0,
    valorPago: 900.0,
    status: "pago",
    metodoPagamento: "Transferência Bancária",
    dataPagamento: "2025-02-15",
    observacoes: "Pagamento confirmado",
  },
  {
    id: "PAG005",
    reservaId: "RES005",
    clienteId: "CLI005",
    cliente: {
      id: "CLI005",
      nome: "Pedro Costa",
      email: "pedro@example.com",
      telefone: "(11) 99988-7766",
      cpf: "321.654.987-00",
    },
    pousada: "Pousada 2",
    quarto: "202",
    dataEntrada: "2025-04-10",
    dataSaida: "2025-04-15",
    valorTotal: 2500.0,
    valorPago: 1250.0,
    status: "parcial",
    metodoPagamento: "Cartão de Crédito",
    dataPagamento: "2025-03-01",
    parcelas: 3,
    observacoes: "Primeira parcela paga, restante em 2 parcelas",
  },
  {
    id: "PAG006",
    reservaId: "RES006",
    clienteId: "CLI006",
    cliente: {
      id: "CLI006",
      nome: "Fernanda Lima",
      email: "fernanda@example.com",
      telefone: "(11) 95544-3322",
      cpf: "654.987.321-00",
    },
    pousada: "Pousada 1",
    quarto: "103",
    dataEntrada: "2025-04-05",
    dataSaida: "2025-04-08",
    valorTotal: 1500.0,
    valorPago: 1500.0,
    status: "pago",
    metodoPagamento: "PIX",
    dataPagamento: "2025-03-10",
    observacoes: "Pagamento confirmado",
  },
  {
    id: "PAG007",
    reservaId: "RES007",
    clienteId: "CLI007",
    cliente: {
      id: "CLI007",
      nome: "Roberto Alves",
      email: "roberto@example.com",
      telefone: "(11) 92233-4455",
      cpf: "111.222.333-44",
    },
    pousada: "Pousada 3",
    quarto: "302",
    dataEntrada: "2025-03-20",
    dataSaida: "2025-03-25",
    valorTotal: 2200.0,
    valorPago: 0.0,
    status: "pendente",
    metodoPagamento: "Cartão de Débito",
    observacoes: "Pagamento será realizado na entrada",
  },
  {
    id: "PAG008",
    reservaId: "RES008",
    clienteId: "CLI008",
    cliente: {
      id: "CLI008",
      nome: "Juliana Mendes",
      email: "juliana@example.com",
      telefone: "(11) 96677-8899",
      cpf: "222.333.444-55",
    },
    pousada: "Pousada 2",
    quarto: "203",
    dataEntrada: "2025-05-01",
    dataSaida: "2025-05-05",
    valorTotal: 1800.0,
    valorPago: 600.0,
    status: "parcial",
    metodoPagamento: "Cartão de Crédito",
    dataPagamento: "2025-03-15",
    parcelas: 3,
    observacoes: "Primeira parcela paga, restante em 2 parcelas",
  },
]

