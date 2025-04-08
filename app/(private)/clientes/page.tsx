"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Download, Eye, UserPlus, Edit, Trash2 } from "lucide-react"
import { ClienteModal } from "@/components/cliente-modal"

// Tipos para os dados
interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
  cpf?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  dataCadastro: string
  totalReservas: number
  ultimaReserva?: string
  observacoes?: string
  status: "ativo" | "inativo"
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"view" | "edit" | "create">("view")

  // Carregar dados de clientes
  useEffect(() => {
    const fetchClientes = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/clientes")
        if (!response.ok) {
          throw new Error("Failed to fetch clients")
        }
        const data = await response.json()
        setClientes(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Erro ao carregar clientes:", error)
        setIsLoading(false)
      }
    }

    fetchClientes()
  }, [])

  // Filtrar clientes
  const clientesFiltrados = clientes.filter((cliente) => {
    if (busca) {
      const termoBusca = busca.toLowerCase()
      return (
        cliente.nome.toLowerCase().includes(termoBusca) ||
        cliente.email.toLowerCase().includes(termoBusca) ||
        cliente.telefone.includes(termoBusca) ||
        (cliente.cpf && cliente.cpf.includes(termoBusca))
      )
    }
    return true
  })

  // Abrir modal para visualizar cliente
  const verCliente = (cliente: Cliente) => {
    setClienteSelecionado(cliente)
    setModalMode("view")
    setIsModalOpen(true)
  }

  // Abrir modal para editar cliente
  const editarCliente = (cliente: Cliente) => {
    setClienteSelecionado(cliente)
    setModalMode("edit")
    setIsModalOpen(true)
  }

  // Abrir modal para criar novo cliente
  const novoCliente = () => {
    setClienteSelecionado(null)
    setModalMode("create")
    setIsModalOpen(true)
  }

  // Estatísticas de clientes
  const totalClientes = clientes.length
  const clientesAtivos = clientes.filter((c) => c.status === "ativo").length
  const clientesComReservas = clientes.filter((c) => c.totalReservas > 0).length
  const clientesRecentes = clientes.filter((c) => {
    const dataCadastro = new Date(c.dataCadastro)
    const hoje = new Date()
    const umMesAtras = new Date()
    umMesAtras.setMonth(hoje.getMonth() - 1)
    return dataCadastro >= umMesAtras
  }).length

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground">Gerencie os clientes e suas reservas</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClientes}</div>
            <p className="text-xs text-muted-foreground">{clientesAtivos} clientes ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes com Reservas</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientesComReservas}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((clientesComReservas / totalClientes) * 100)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientesRecentes}</div>
            <p className="text-xs text-muted-foreground">Nos últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas por Cliente</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clientesComReservas
                ? (clientes.reduce((total, c) => total + c.totalReservas, 0) / clientesComReservas).toFixed(1)
                : "0"}
            </div>
            <p className="text-xs text-muted-foreground">Média de reservas por cliente</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de clientes */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>Gerencie todos os clientes cadastrados</CardDescription>
            </div>

            <Button onClick={novoCliente}>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email, telefone..."
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
              <p className="text-muted-foreground">Carregando clientes...</p>
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Nenhum cliente encontrado</p>
            </div>
          ) : (
            <div className="w-full min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Cadastro</TableHead>
                    <TableHead>Reservas</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientesFiltrados.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nome}</TableCell>
                      <TableCell>{cliente.email}</TableCell>
                      <TableCell>{cliente.telefone}</TableCell>
                      <TableCell>{cliente.cpf || "-"}</TableCell>
                      <TableCell>{new Date(cliente.dataCadastro).toLocaleDateString()}</TableCell>
                      <TableCell>{cliente.totalReservas}</TableCell>
                      <TableCell>
                        <Badge variant={cliente.status === "ativo" ? "success" : "destructive"}>
                          {cliente.status === "ativo" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => verCliente(cliente)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver cliente</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => editarCliente(cliente)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar cliente</span>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir cliente</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de cliente */}
      <ClienteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        cliente={clienteSelecionado}
        mode={modalMode}
      />
    </div>
  )
}

// Dados simulados
const dadosClientes: Cliente[] = [
  {
    id: "CLI001",
    nome: "João Silva",
    email: "joao@example.com",
    telefone: "(11) 98765-4321",
    cpf: "123.456.789-00",
    endereco: "Rua das Flores, 123",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01234-567",
    dataCadastro: "2024-01-15",
    totalReservas: 3,
    ultimaReserva: "2025-03-15",
    observacoes: "Cliente frequente",
    status: "ativo",
  },
  {
    id: "CLI002",
    nome: "Maria Oliveira",
    email: "maria@example.com",
    telefone: "(11) 91234-5678",
    cpf: "987.654.321-00",
    endereco: "Av. Paulista, 1000",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01310-100",
    dataCadastro: "2024-02-10",
    totalReservas: 2,
    ultimaReserva: "2025-03-15",
    status: "ativo",
  },
  {
    id: "CLI003",
    nome: "Carlos Santos",
    email: "carlos@example.com",
    telefone: "(11) 97654-3210",
    cpf: "456.789.123-00",
    endereco: "Rua dos Pinheiros, 500",
    cidade: "São Paulo",
    estado: "SP",
    cep: "05422-030",
    dataCadastro: "2024-01-05",
    totalReservas: 1,
    ultimaReserva: "2025-03-10",
    status: "ativo",
  },
  {
    id: "CLI004",
    nome: "Ana Pereira",
    email: "ana@example.com",
    telefone: "(11) 98877-6655",
    cpf: "789.123.456-00",
    endereco: "Rua Augusta, 1500",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01304-001",
    dataCadastro: "2023-12-20",
    totalReservas: 1,
    ultimaReserva: "2025-03-05",
    status: "ativo",
  },
  {
    id: "CLI005",
    nome: "Pedro Costa",
    email: "pedro@example.com",
    telefone: "(11) 99988-7766",
    cpf: "321.654.987-00",
    endereco: "Av. Rebouças, 1234",
    cidade: "São Paulo",
    estado: "SP",
    cep: "05402-100",
    dataCadastro: "2024-03-01",
    totalReservas: 1,
    ultimaReserva: "2025-04-10",
    status: "ativo",
  },
  {
    id: "CLI006",
    nome: "Fernanda Lima",
    email: "fernanda@example.com",
    telefone: "(11) 95544-3322",
    cpf: "654.987.321-00",
    endereco: "Rua Oscar Freire, 500",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01426-001",
    dataCadastro: "2024-02-15",
    totalReservas: 1,
    ultimaReserva: "2025-04-05",
    status: "ativo",
  },
  {
    id: "CLI007",
    nome: "Roberto Alves",
    email: "roberto@example.com",
    telefone: "(11) 92233-4455",
    cpf: "111.222.333-44",
    endereco: "Av. Brigadeiro Faria Lima, 1000",
    cidade: "São Paulo",
    estado: "SP",
    cep: "05426-100",
    dataCadastro: "2024-01-25",
    totalReservas: 1,
    ultimaReserva: "2025-03-20",
    status: "ativo",
  },
  {
    id: "CLI008",
    nome: "Juliana Mendes",
    email: "juliana@example.com",
    telefone: "(11) 96677-8899",
    cpf: "222.333.444-55",
    endereco: "Rua Haddock Lobo, 400",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01414-000",
    dataCadastro: "2024-03-05",
    totalReservas: 1,
    ultimaReserva: "2025-05-01",
    status: "ativo",
  },
  {
    id: "CLI009",
    nome: "Marcelo Souza",
    email: "marcelo@example.com",
    telefone: "(11) 93344-5566",
    cpf: "333.444.555-66",
    endereco: "Av. Santo Amaro, 2000",
    cidade: "São Paulo",
    estado: "SP",
    cep: "04506-001",
    dataCadastro: "2023-11-10",
    totalReservas: 0,
    status: "inativo",
  },
  {
    id: "CLI010",
    nome: "Camila Ferreira",
    email: "camila@example.com",
    telefone: "(11) 94455-6677",
    cpf: "444.555.666-77",
    endereco: "Rua Teodoro Sampaio, 1000",
    cidade: "São Paulo",
    estado: "SP",
    cep: "05406-050",
    dataCadastro: "2024-03-10",
    totalReservas: 0,
    status: "ativo",
  },
]

