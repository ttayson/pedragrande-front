export interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
}

export interface Reserva {
  id: string
  clienteId: string
  cliente: Cliente
  pousada: string
  quarto: string
  capacidade: number
  dataEntrada: string
  dataSaida: string
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

export interface ReservaAntiga {
  id: string
  clienteId: string
  cliente: Cliente
  estabelecimento: string
  quarto: string
  dataEntrada: string
  dataSaida: string
  valorTotal: number
  status: "concluida" | "cancelada" | "no-show"
  metodoPagamento: string
  observacoes?: string
}

export const reservas: Reserva[] = [
  {
    id: "RES001",
    clienteId: "CLI001",
    cliente: {
      id: "CLI001",
      nome: "João Silva",
      email: "joao@example.com",
      telefone: "(11) 98765-4321",
    },
    pousada: "Pousada 1",
    quarto: "101",
    capacidade: 2,
    dataEntrada: "2025-03-15",
    dataSaida: "2025-03-18",
    status: "confirmada",
    hospede: {
      nome: "João Silva",
      email: "joao@example.com",
      telefone: "(11) 98765-4321",
    },
    checkIn: "14:00",
    checkOut: "12:00",
    formaPagamento: "Cartão de Crédito",
    observacoes: "Hóspede solicitou quarto silencioso",
  },
  {
    id: "RES002",
    clienteId: "CLI002",
    cliente: {
      id: "CLI002",
      nome: "Maria Oliveira",
      email: "maria@example.com",
      telefone: "(11) 91234-5678",
    },
    pousada: "Pousada 1",
    quarto: "102",
    capacidade: 4,
    dataEntrada: "2025-03-15",
    dataSaida: "2025-03-20",
    status: "confirmada",
    hospede: {
      nome: "Maria Oliveira",
      email: "maria@example.com",
      telefone: "(11) 91234-5678",
    },
    checkIn: "14:00",
    checkOut: "12:00",
    formaPagamento: "PIX",
    observacoes: "Família com crianças",
  },
  {
    id: "RES003",
    clienteId: "CLI003",
    cliente: {
      id: "CLI003",
      nome: "Carlos Santos",
      email: "carlos@example.com",
      telefone: "(11) 97654-3210",
    },
    pousada: "Pousada 2",
    quarto: "201",
    capacidade: 2,
    dataEntrada: "2025-03-10",
    dataSaida: "2025-03-12",
    status: "pendente",
    hospede: {
      nome: "Carlos Santos",
      email: "carlos@example.com",
      telefone: "(11) 97654-3210",
    },
    checkIn: "14:00",
    checkOut: "12:00",
    formaPagamento: "Dinheiro",
    observacoes: "",
  },
]

export const reservasAntigas: ReservaAntiga[] = [
  {
    id: "RES001",
    clienteId: "CLI001",
    cliente: {
      id: "CLI001",
      nome: "João Silva",
      email: "joao@example.com",
      telefone: "(11) 98765-4321",
    },
    estabelecimento: "Pousada 1",
    quarto: "101",
    dataEntrada: "2024-01-15",
    dataSaida: "2024-01-18",
    valorTotal: 1200.0,
    status: "concluida",
    metodoPagamento: "Cartão de Crédito",
    observacoes: "Cliente satisfeito com a estadia",
  },
  {
    id: "RES002",
    clienteId: "CLI002",
    cliente: {
      id: "CLI002",
      nome: "Maria Oliveira",
      email: "maria@example.com",
      telefone: "(11) 91234-5678",
    },
    estabelecimento: "Pousada 1",
    quarto: "102",
    dataEntrada: "2024-01-20",
    dataSaida: "2024-01-25",
    valorTotal: 2000.0,
    status: "concluida",
    metodoPagamento: "PIX",
    observacoes: "Solicitou late check-out",
  },
  {
    id: "RES003",
    clienteId: "CLI003",
    cliente: {
      id: "CLI003",
      nome: "Carlos Santos",
      email: "carlos@example.com",
      telefone: "(11) 97654-3210",
    },
    estabelecimento: "Pousada 2",
    quarto: "201",
    dataEntrada: "2024-02-05",
    dataSaida: "2024-02-07",
    valorTotal: 800.0,
    status: "cancelada",
    metodoPagamento: "Dinheiro",
    observacoes: "Cancelou 2 dias antes",
  },
  {
    id: "RES004",
    clienteId: "CLI004",
    cliente: {
      id: "CLI004",
      nome: "Ana Pereira",
      email: "ana@example.com",
      telefone: "(11) 98877-6655",
    },
    estabelecimento: "Pousada 3",
    quarto: "301",
    dataEntrada: "2024-02-10",
    dataSaida: "2024-02-12",
    valorTotal: 900.0,
    status: "concluida",
    metodoPagamento: "Transferência Bancária",
    observacoes: "Elogiou o café da manhã",
  },
  {
    id: "RES005",
    clienteId: "CLI005",
    cliente: {
      id: "CLI005",
      nome: "Pedro Costa",
      email: "pedro@example.com",
      telefone: "(11) 99988-7766",
    },
    estabelecimento: "Pousada 2",
    quarto: "202",
    dataEntrada: "2024-02-15",
    dataSaida: "2024-02-20",
    valorTotal: 2500.0,
    status: "no-show",
    metodoPagamento: "Cartão de Crédito",
    observacoes: "Não compareceu e não avisou",
  },
]

