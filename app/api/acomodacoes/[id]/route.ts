import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import type { StatusAcomodacao } from "@prisma/client"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const acomodacao = await prisma.acomodacao.findUnique({
      where: { id },
      include: {
        estabelecimento: true,
        tipoAcomodacao: true,
      },
    })

    if (!acomodacao) {
      return NextResponse.json({ error: "Acomodação não encontrada" }, { status: 404 })
    }

    return NextResponse.json(acomodacao)
  } catch (error) {
    console.error("Erro ao buscar acomodação:", error)
    return NextResponse.json({ error: "Erro ao buscar acomodação" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Verificar se a acomodação existe
    const acomodacaoExistente = await prisma.acomodacao.findUnique({
      where: { id },
    })

    if (!acomodacaoExistente) {
      return NextResponse.json({ error: "Acomodação não encontrada" }, { status: 404 })
    }

    // Verificar se o estabelecimento existe
    if (body.estabelecimentoId) {
      const estabelecimento = await prisma.estabelecimento.findUnique({
        where: { id: body.estabelecimentoId },
      })

      if (!estabelecimento) {
        return NextResponse.json({ error: "Estabelecimento não encontrado" }, { status: 404 })
      }
    }

    // Verificar se o tipo de acomodação existe
    if (body.tipoAcomodacaoId) {
      const tipoAcomodacao = await prisma.tipoAcomodacao.findUnique({
        where: { id: body.tipoAcomodacaoId },
      })

      if (!tipoAcomodacao) {
        return NextResponse.json({ error: "Tipo de acomodação não encontrado" }, { status: 404 })
      }
    }

    // Verificar se o número do quarto foi alterado e se já existe outro com o mesmo número
    if (body.numeroQuarto && body.numeroQuarto !== acomodacaoExistente.numeroQuarto) {
      const acomodacaoComMesmoNumero = await prisma.acomodacao.findFirst({
        where: {
          numeroQuarto: body.numeroQuarto,
          estabelecimentoId: body.estabelecimentoId || acomodacaoExistente.estabelecimentoId,
          id: { not: id },
        },
      })

      if (acomodacaoComMesmoNumero) {
        return NextResponse.json(
          { error: "Já existe uma acomodação com este número neste estabelecimento" },
          { status: 400 },
        )
      }
    }

    // Verificar se o status está sendo alterado para atualizar o contador de quartos disponíveis
    const statusAnterior = acomodacaoExistente.status
    const novoStatus = body.status as StatusAcomodacao | undefined

    // Atualizar a acomodação
    const acomodacaoAtualizada = await prisma.acomodacao.update({
      where: { id },
      data: {
        nome: body.nome,
        numeroQuarto: body.numeroQuarto,
        capacidade: body.capacidade,
        precoBase: body.precoBase,
        status: novoStatus,
        descricao: body.descricao,
        amenidades: body.amenidades,
        imagemUrl: body.imagemUrl,
        estabelecimentoId: body.estabelecimentoId,
        tipoAcomodacaoId: body.tipoAcomodacaoId,
      },
      include: {
        estabelecimento: {
          select: {
            id: true,
            nome: true,
          },
        },
        tipoAcomodacao: {
          select: {
            id: true,
            nome: true,
          },
        },
      },
    })

    // Atualizar o contador de quartos disponíveis do estabelecimento se o status mudou
    if (novoStatus && statusAnterior !== novoStatus) {
      const estabelecimentoId = body.estabelecimentoId || acomodacaoExistente.estabelecimentoId

      if (statusAnterior === "LIVRE" && novoStatus !== "LIVRE") {
        // Quarto deixou de estar livre
        await prisma.estabelecimento.update({
          where: { id: estabelecimentoId },
          data: {
            quartosDisponiveis: { decrement: 1 },
          },
        })
      } else if (statusAnterior !== "LIVRE" && novoStatus === "LIVRE") {
        // Quarto passou a estar livre
        await prisma.estabelecimento.update({
          where: { id: estabelecimentoId },
          data: {
            quartosDisponiveis: { increment: 1 },
          },
        })
      }
    }

    return NextResponse.json(acomodacaoAtualizada)
  } catch (error) {
    console.error("Erro ao atualizar acomodação:", error)
    return NextResponse.json({ error: "Erro ao atualizar acomodação" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Verificar se a acomodação existe
    const acomodacao = await prisma.acomodacao.findUnique({
      where: { id },
    })

    if (!acomodacao) {
      return NextResponse.json({ error: "Acomodação não encontrada" }, { status: 404 })
    }

    // Verificar se há reservas para esta acomodação
    const reservasCount = await prisma.reserva.count({
      where: { acomodacaoId: id },
    })

    if (reservasCount > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir esta acomodação pois existem reservas associadas a ela" },
        { status: 400 },
      )
    }

    // Excluir a acomodação
    await prisma.acomodacao.delete({
      where: { id },
    })

    // Atualizar o contador de quartos do estabelecimento
    await prisma.estabelecimento.update({
      where: { id: acomodacao.estabelecimentoId },
      data: {
        totalQuartos: { decrement: 1 },
        quartosDisponiveis: { decrement: acomodacao.status === "LIVRE" ? 1 : 0 },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir acomodação:", error)
    return NextResponse.json({ error: "Erro ao excluir acomodação" }, { status: 500 })
  }
}

