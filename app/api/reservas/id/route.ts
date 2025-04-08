import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import type { StatusReserva } from "@prisma/client"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const reserva = await prisma.reserva.findUnique({
      where: { id },
      include: {
        cliente: true,
        acomodacao: {
          include: {
            tipoAcomodacao: true,
          },
        },
        estabelecimento: true,
        pagamentos: true,
        adicionais: {
          include: {
            adicional: true,
          },
        },
      },
    })

    if (!reserva) {
      return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 })
    }

    return NextResponse.json(reserva)
  } catch (error) {
    console.error("Erro ao buscar reserva:", error)
    return NextResponse.json({ error: "Erro ao buscar reserva" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Verificar se a reserva existe
    const reservaExistente = await prisma.reserva.findUnique({
      where: { id },
      include: {
        acomodacao: true,
      },
    })

    if (!reservaExistente) {
      return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 })
    }

    // Verificar se o status está sendo alterado
    const statusAnterior = reservaExistente.status
    const novoStatus = body.status as StatusReserva | undefined

    // Preparar os dados para atualização
    const dataUpdate: any = {}

    if (body.dataCheckIn) dataUpdate.dataCheckIn = new Date(body.dataCheckIn)
    if (body.dataCheckOut) dataUpdate.dataCheckOut = new Date(body.dataCheckOut)
    if (body.numeroPessoas) dataUpdate.numeroPessoas = body.numeroPessoas
    if (body.valorTotal) dataUpdate.valorTotal = body.valorTotal
    if (body.valorPago !== undefined) dataUpdate.valorPago = body.valorPago
    if (novoStatus) dataUpdate.status = novoStatus
    if (body.observacoes !== undefined) dataUpdate.observacoes = body.observacoes

    // Se a acomodação estiver sendo alterada
    if (body.acomodacaoId && body.acomodacaoId !== reservaExistente.acomodacaoId) {
      // Verificar se a nova acomodação existe
      const novaAcomodacao = await prisma.acomodacao.findUnique({
        where: { id: body.acomodacaoId },
      })

      if (!novaAcomodacao) {
        return NextResponse.json({ error: "Acomodação não encontrada" }, { status: 404 })
      }

      // Verificar se a nova acomodação está disponível no período
      const dataCheckIn = body.dataCheckIn ? new Date(body.dataCheckIn) : reservaExistente.dataCheckIn
      const dataCheckOut = body.dataCheckOut ? new Date(body.dataCheckOut) : reservaExistente.dataCheckOut

      const reservaConflitante = await prisma.reserva.findFirst({
        where: {
          acomodacaoId: body.acomodacaoId,
          id: { not: id },
          status: {
            in: ["PENDENTE", "CONFIRMADA", "CHECK_IN"],
          },
          OR: [
            {
              AND: [{ dataCheckIn: { lte: dataCheckOut } }, { dataCheckOut: { gte: dataCheckIn } }],
            },
          ],
        },
      })

      if (reservaConflitante) {
        return NextResponse.json(
          { error: "A nova acomodação não está disponível no período selecionado" },
          { status: 400 },
        )
      }

      dataUpdate.acomodacaoId = body.acomodacaoId

      // Atualizar o status da acomodação anterior para LIVRE
      await prisma.acomodacao.update({
        where: { id: reservaExistente.acomodacaoId },
        data: { status: "LIVRE" },
      })

      // Atualizar o status da nova acomodação para RESERVADO
      await prisma.acomodacao.update({
        where: { id: body.acomodacaoId },
        data: { status: "RESERVADO" },
      })
    }

    // Atualizar a reserva
    const reservaAtualizada = await prisma.reserva.update({
      where: { id },
      data: dataUpdate,
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
            capacidade: true,
          },
        },
        estabelecimento: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    })

    // Atualizar o status da acomodação se o status da reserva mudou
    if (novoStatus && statusAnterior !== novoStatus) {
      let novoStatusAcomodacao = reservaExistente.acomodacao.status

      if (novoStatus === "CANCELADA" || novoStatus === "CONCLUIDA") {
        novoStatusAcomodacao = "LIVRE"
      } else if (novoStatus === "CHECK_IN") {
        novoStatusAcomodacao = "OCUPADO"
      } else if (novoStatus === "CONFIRMADA" || novoStatus === "PENDENTE") {
        novoStatusAcomodacao = "RESERVADO"
      }

      await prisma.acomodacao.update({
        where: { id: reservaExistente.acomodacaoId },
        data: { status: novoStatusAcomodacao },
      })

      // Atualizar o contador de quartos disponíveis do estabelecimento
      if (novoStatusAcomodacao === "LIVRE" && reservaExistente.acomodacao.status !== "LIVRE") {
        await prisma.estabelecimento.update({
          where: { id: reservaExistente.estabelecimentoId },
          data: {
            quartosDisponiveis: { increment: 1 },
          },
        })
      } else if (novoStatusAcomodacao !== "LIVRE" && reservaExistente.acomodacao.status === "LIVRE") {
        await prisma.estabelecimento.update({
          where: { id: reservaExistente.estabelecimentoId },
          data: {
            quartosDisponiveis: { decrement: 1 },
          },
        })
      }
    }

    return NextResponse.json(reservaAtualizada)
  } catch (error) {
    console.error("Erro ao atualizar reserva:", error)
    return NextResponse.json({ error: "Erro ao atualizar reserva" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Verificar se a reserva existe
    const reserva = await prisma.reserva.findUnique({
      where: { id },
      include: {
        acomodacao: true,
        pagamentos: true,
      },
    })

    if (!reserva) {
      return NextResponse.json({ error: "Reserva não encontrada" }, { status: 404 })
    }

    // Verificar se há pagamentos para esta reserva
    if (reserva.pagamentos.length > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir esta reserva pois existem pagamentos associados a ela" },
        { status: 400 },
      )
    }

    // Excluir os adicionais da reserva
    await prisma.reservaAdicional.deleteMany({
      where: { reservaId: id },
    })

    // Excluir a reserva
    await prisma.reserva.delete({
      where: { id },
    })

    // Atualizar o status da acomodação para LIVRE
    await prisma.acomodacao.update({
      where: { id: reserva.acomodacaoId },
      data: { status: "LIVRE" },
    })

    // Atualizar o contador de quartos disponíveis do estabelecimento
    if (reserva.acomodacao.status !== "LIVRE") {
      await prisma.estabelecimento.update({
        where: { id: reserva.estabelecimentoId },
        data: {
          quartosDisponiveis: { increment: 1 },
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir reserva:", error)
    return NextResponse.json({ error: "Erro ao excluir reserva" }, { status: 500 })
  }
}

