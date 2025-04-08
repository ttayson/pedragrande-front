export interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
  cpf?: string
}

export interface Pagamento {
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

export const pagamentos: Pagamento[] = [
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

