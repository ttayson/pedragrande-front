import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: { reservaId: string; adicionalId: string } }) {
  try {
    const { reservaId, adicionalId } = params
    const body = await request.json()

    // Verificar se a associação existe
    const reservaAdicional = await prisma.reservaAdicional.findUnique({
      where: {
        reservaId_adicionalId: {
          reservaId,
          adicionalId,
        },
      },
      include: {
        adicional: true,
      },
    })

    if (!reservaAdicional) {
      return NextResponse.json({ error: "Adicional não encontrado na reserva" }, { status: 404 })
    }

    // Calcular a diferença de valor para atualizar o valor total da reserva
    const quantidadeAnterior = reservaAdicional.quantidade
    const valorUnitario = Number(reservaAdicional.adicional.valor)
    const valorAnterior = quantidadeAnterior * valorUnitario

    const novaQuantidade = body.quantidade || quantidadeAnterior
    const novoValorTotal = novaQuantidade * valorUnitario
    const diferencaValor = novoValorTotal - valorAnterior

    // Atualizar a associação
    const reservaAdicionalAtualizado = await prisma.reservaAdicional.update({
      where: {
        reservaId_adicionalId: {
          reservaId,
          adicionalId,
        },
      },
      data: {
        quantidade: novaQuantidade,
        valorTotal: novoValorTotal,
      },
      include: {
        adicional: true,
      },
    })

    // Atualizar o valor total da reserva
    if (diferencaValor !== 0) {
      await prisma.reserva.update({
        where: { id: reservaId },
        data: {
          valorTotal: {
            increment: diferencaValor,
          },
        },
      })
    }

    return NextResponse.json(reservaAdicionalAtualizado)
  } catch (error) {
    console.error("Erro ao atualizar adicional da reserva:", error)
    return NextResponse.json({ error: "Erro ao atualizar adicional da reserva" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { reservaId: string; adicionalId: string } }) {
  try {
    const { reservaId, adicionalId } = params

    // Verificar se a associação existe
    const reservaAdicional = await prisma.reservaAdicional.findUnique({
      where: {
        reservaId_adicionalId: {
          reservaId,
          adicionalId,
        },
      },
    })

    if (!reservaAdicional) {
      return NextResponse.json({ error: "Adicional não encontrado na reserva" }, { status: 404 })
    }

    // Calcular o valor a ser subtraído do valor total da reserva
    const valorAdicional = Number(reservaAdicional.valorTotal)

    // Excluir a associação
    await prisma.reservaAdicional.delete({
      where: {
        reservaId_adicionalId: {
          reservaId,
          adicionalId,
        },
      },
    })

    // Atualizar o valor total da reserva
    await prisma.reserva.update({
      where: { id: reservaId },
      data: {
        valorTotal: {
          decrement: valorAdicional,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao remover adicional da reserva:", error)
    return NextResponse.json({ error: "Erro ao remover adicional da reserva" }, { status: 500 })
  }
}

