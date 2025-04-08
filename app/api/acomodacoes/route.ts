import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import type { StatusAcomodacao } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const estabelecimentoId = searchParams.get("estabelecimentoId")
    const tipoAcomodacaoId = searchParams.get("tipoAcomodacaoId")
    const status = searchParams.get("status") as StatusAcomodacao | null
    const search = searchParams.get("search")

    const whereClause: any = {}

    if (estabelecimentoId) {
      whereClause.estabelecimentoId = estabelecimentoId
    }

    if (tipoAcomodacaoId) {
      whereClause.tipoAcomodacaoId = tipoAcomodacaoId
    }

    if (status) {
      whereClause.status = status
    }

    if (search) {
      whereClause.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { descricao: { contains: search, mode: "insensitive" } },
        { numeroQuarto: { contains: search, mode: "insensitive" } },
      ]
    }

    const acomodacoes = await prisma.acomodacao.findMany({
      where: whereClause,
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
      orderBy: { nome: "asc" },
    })

    return NextResponse.json(acomodacoes)
  } catch (error) {
    console.error("Erro ao buscar acomodações:", error)
    return NextResponse.json({ error: "Erro ao buscar acomodações" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar campos obrigatórios
    if (!body.nome || !body.numeroQuarto || !body.estabelecimentoId || !body.tipoAcomodacaoId) {
      return NextResponse.json(
        { error: "Nome, número do quarto, estabelecimento e tipo de acomodação são obrigatórios" },
        { status: 400 },
      )
    }

    // Verificar se o estabelecimento existe
    const estabelecimento = await prisma.estabelecimento.findUnique({
      where: { id: body.estabelecimentoId },
    })

    if (!estabelecimento) {
      return NextResponse.json({ error: "Estabelecimento não encontrado" }, { status: 404 })
    }

    // Verificar se o tipo de acomodação existe
    const tipoAcomodacao = await prisma.tipoAcomodacao.findUnique({
      where: { id: body.tipoAcomodacaoId },
    })

    if (!tipoAcomodacao) {
      return NextResponse.json({ error: "Tipo de acomodação não encontrado" }, { status: 404 })
    }

    // Verificar se já existe uma acomodação com o mesmo número no mesmo estabelecimento
    const acomodacaoExistente = await prisma.acomodacao.findFirst({
      where: {
        numeroQuarto: body.numeroQuarto,
        estabelecimentoId: body.estabelecimentoId,
      },
    })

    if (acomodacaoExistente) {
      return NextResponse.json(
        { error: "Já existe uma acomodação com este número neste estabelecimento" },
        { status: 400 },
      )
    }

    // Criar a acomodação
    const acomodacao = await prisma.acomodacao.create({
      data: {
        nome: body.nome,
        numeroQuarto: body.numeroQuarto,
        capacidade: body.capacidade || 1,
        precoBase: body.precoBase,
        status: body.status || "LIVRE",
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

    // Atualizar o contador de quartos do estabelecimento
    await prisma.estabelecimento.update({
      where: { id: body.estabelecimentoId },
      data: {
        totalQuartos: { increment: 1 },
        quartosDisponiveis: { increment: body.status === "LIVRE" ? 1 : 0 },
      },
    })

    return NextResponse.json(acomodacao, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar acomodação:", error)
    return NextResponse.json({ error: "Erro ao criar acomodação" }, { status: 500 })
  }
}

