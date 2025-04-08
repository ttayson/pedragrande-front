import { NextResponse } from "next/server"
import { reservasAntigas } from "../../mocks/reservas"

export async function GET(request: Request) {
  // Get query parameters
  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")?.toLowerCase()
  const status = searchParams.get("status")
  const estabelecimento = searchParams.get("estabelecimento")
  const dataInicio = searchParams.get("dataInicio")
  const dataFim = searchParams.get("dataFim")

  // Filter old reservations based on query parameters
  let filteredReservas = [...reservasAntigas]

  if (search) {
    filteredReservas = filteredReservas.filter(
      (reserva) =>
        reserva.cliente.nome.toLowerCase().includes(search) ||
        reserva.id.toLowerCase().includes(search) ||
        reserva.estabelecimento.toLowerCase().includes(search),
    )
  }

  if (status) {
    filteredReservas = filteredReservas.filter((reserva) => reserva.status === status)
  }

  if (estabelecimento) {
    filteredReservas = filteredReservas.filter((reserva) => reserva.estabelecimento === estabelecimento)
  }

  if (dataInicio) {
    filteredReservas = filteredReservas.filter((reserva) => reserva.dataEntrada >= dataInicio)
  }

  if (dataFim) {
    filteredReservas = filteredReservas.filter((reserva) => reserva.dataEntrada <= dataFim)
  }

  // Add a small delay to simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json(filteredReservas)
}

