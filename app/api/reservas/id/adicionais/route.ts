import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const reservaId = params.id

    // Verificar se a reserva existe
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
    })

    if (!reserva) {
      return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 })
    }

    // Buscar os adicionais da reserva
    const adicionaisReserva = await prisma.reservaAdicional.findMany({
      where: { reservaId },
      include: {
        adicional: true,
      },
    })

    return NextResponse.json(adicionaisReserva)
  } catch (error) {
    console.error("Erro ao buscar adicionais da reserva:", error)
    return NextResponse.json({ error: "Erro ao buscar adicionais da reserva" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const reservaId = params.id
    const body = await request.json()

    // Validar campos obrigatórios
    if (!body.adicionalId) {
      return NextResponse.json({ error: "ID do adicional é obrigatório" }, { status: 400 })
    }

    // Verificar se a reserva existe
    const reserva = await prisma.reserva.findUnique({
      where: { id: reservaId },
    })

    if (!reserva) {
      return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 })
    }

    // Verificar se o adicional existe
    const adicional = await prisma.adicional.findUnique({
      where: { id: body.adicionalId },
    })

    if (!adicional) {
      return NextResponse.json({ error: "Adicional não encontrado" }, { status: 404 })
    }

    // Verificar se o adicional já está associado à reserva
    const adicionalExistente = await prisma.reservaAdicional.findUnique({
      where: {
        reservaId_adicionalId: {
          reservaId,
          adicionalId: body.adicionalId,
        },
      },
    })

    if (adicionalExistente) {
      return NextResponse.json({ error: "Este adicional já está associado à reserva" }, { status: 400 })
    }

    // Calcular o valor total
    const quantidade = body.quantidade || 1
    const valorTotal = Number(adicional.valor) * quantidade

    // Criar a associação entre reserva e adicional
    const reservaAdicional = await prisma.reservaAdicional.create({
      data: {
        reservaId,
        adicionalId: body.adicionalId,
        quantidade,
        valorTotal,
      },
      include: {
        adicional: true,
      },
    })

    // Atualizar o valor total da reserva
    await prisma.reserva.update({
      where: { id: reservaId },
      data: {
        valorTotal: {
          increment: valorTotal,
        },
      },
    })

    return NextResponse.json(reservaAdicional, { status: 201 })
  } catch (error) {
    console.error("Erro ao adicionar adicional à reserva:", error)
    return NextResponse.json({ error: "Erro ao adicionar adicional à reserva" }, { status: 500 })
  }
}

