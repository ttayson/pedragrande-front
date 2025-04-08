import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import type { MetodoPagamento, StatusPagamento } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const reservaId = searchParams.get("reservaId")
    const status = searchParams.get("status") as StatusPagamento | null
    const metodoPagamento = searchParams.get("metodoPagamento") as MetodoPagamento | null

    const whereClause: any = {}

    if (reservaId) {
      whereClause.reservaId = reservaId
    }

    if (status) {
      whereClause.status = status
    }

    if (metodoPagamento) {
      whereClause.metodoPagamento = metodoPagamento
    }

    const pagamentos = await prisma.pagamento.findMany({
      where: whereClause,
      include: {
        reserva: {
          include: {
            cliente: {
              select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
              },
            },
            acomodacao: {
              select: {
                id: true,
                nome: true,
                numeroQuarto: true,
              },
            },
            estabelecimento: {
              select: {
                id: true,
                nome: true,
              },
            },
          },
        },
      },
      orderBy: { dataPagamento: "desc" },
    })

    return NextResponse.json(pagamentos)
  } catch (error) {
    console.error("Erro ao buscar pagamentos:", error)
    return NextResponse.json({ error: "Erro ao buscar pagamentos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar campos obrigatórios
    if (!body.reservaId || !body.valor || !body.dataPagamento || !body.metodoPagamento) {
      return NextResponse.json(
        { error: "Reserva, valor, data de pagamento e método de pagamento são obrigatórios" },
        { status: 400 },
      )
    }

    // Verificar se a reserva existe
    const reserva = await prisma.reserva.findUnique({
      where: { id: body.reservaId },
    })

    if (!reserva) {
      return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 })
    }

    // Criar o pagamento
    const pagamento = await prisma.pagamento.create({
      data: {
        valor: body.valor,
        dataPagamento: new Date(body.dataPagamento),
        metodoPagamento: body.metodoPagamento,
        status: body.status || "CONFIRMADO",
        comprovante: body.comprovante,
        observacoes: body.observacoes,
        reservaId: body.reservaId,
      },
      include: {
        reserva: {
          include: {
            cliente: {
              select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
              },
            },
          },
        },
      },
    })

    // Atualizar o valor pago da reserva
    const valorPagoAtual = Number(reserva.valorPago)
    const novoValorPago = valorPagoAtual + Number(body.valor)
    const valorTotal = Number(reserva.valorTotal)

    let novoStatus = reserva.status
    if (
      novoValorPago >= valorTotal &&
      reserva.status !== "CHECK_IN" &&
      reserva.status !== "CHECK_OUT" &&
      reserva.status !== "CONCLUIDA"
    ) {
      novoStatus = "CONFIRMADA"
    }

    await prisma.reserva.update({
      where: { id: body.reservaId },
      data: {
        valorPago: novoValorPago,
        status: novoStatus,
      },
    })

    return NextResponse.json(pagamento, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar pagamento:", error)
    return NextResponse.json({ error: "Erro ao criar pagamento" }, { status: 500 })
  }
}

