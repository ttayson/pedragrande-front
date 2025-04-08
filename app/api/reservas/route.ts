import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import type { StatusReserva } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const estabelecimentoId = searchParams.get("estabelecimentoId")
    const clienteId = searchParams.get("clienteId")
    const status = searchParams.get("status") as StatusReserva | null
    const dataInicio = searchParams.get("dataInicio")
    const dataFim = searchParams.get("dataFim")
    const search = searchParams.get("search")

    const whereClause: any = {}

    if (estabelecimentoId) {
      whereClause.estabelecimentoId = estabelecimentoId
    }

    if (clienteId) {
      whereClause.clienteId = clienteId
    }

    if (status) {
      whereClause.status = status
    }

    if (dataInicio) {
      whereClause.dataCheckIn = {
        ...whereClause.dataCheckIn,
        gte: new Date(dataInicio),
      }
    }

    if (dataFim) {
      whereClause.dataCheckOut = {
        ...whereClause.dataCheckOut,
        lte: new Date(dataFim),
      }
    }

    if (search) {
      whereClause.OR = [
        { codigo: { contains: search, mode: "insensitive" } },
        { cliente: { nome: { contains: search, mode: "insensitive" } } },
        { cliente: { email: { contains: search, mode: "insensitive" } } },
        { cliente: { telefone: { contains: search, mode: "insensitive" } } },
      ]
    }

    const reservas = await prisma.reserva.findMany({
      where: whereClause,
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
      orderBy: { dataCheckIn: "desc" },
    })

    return NextResponse.json(reservas)
  } catch (error) {
    console.error("Erro ao buscar reservas:", error)
    return NextResponse.json({ error: "Erro ao buscar reservas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar campos obrigatórios
    if (!body.clienteId || !body.acomodacaoId || !body.estabelecimentoId || !body.dataCheckIn || !body.dataCheckOut) {
      return NextResponse.json(
        { error: "Cliente, acomodação, estabelecimento, data de check-in e data de check-out são obrigatórios" },
        { status: 400 },
      )
    }

    // Verificar se o cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id: body.clienteId },
    })

    if (!cliente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    // Verificar se a acomodação existe
    const acomodacao = await prisma.acomodacao.findUnique({
      where: { id: body.acomodacaoId },
    })

    if (!acomodacao) {
      return NextResponse.json({ error: "Acomodação não encontrada" }, { status: 404 })
    }

    // Verificar se o estabelecimento existe
    const estabelecimento = await prisma.estabelecimento.findUnique({
      where: { id: body.estabelecimentoId },
    })

    if (!estabelecimento) {
      return NextResponse.json({ error: "Estabelecimento não encontrado" }, { status: 404 })
    }

    // Verificar se a acomodação pertence ao estabelecimento
    if (acomodacao.estabelecimentoId !== body.estabelecimentoId) {
      return NextResponse.json({ error: "A acomodação não pertence ao estabelecimento informado" }, { status: 400 })
    }

    // Verificar se a acomodação está disponível no período
    const dataCheckIn = new Date(body.dataCheckIn)
    const dataCheckOut = new Date(body.dataCheckOut)

    if (dataCheckIn >= dataCheckOut) {
      return NextResponse.json({ error: "A data de check-out deve ser posterior à data de check-in" }, { status: 400 })
    }

    const reservaExistente = await prisma.reserva.findFirst({
      where: {
        acomodacaoId: body.acomodacaoId,
        status: {
          in: ["PENDENTE", "CONFIRMADA", "CHECK_IN"],
        },
        OR: [
          {
            // Verifica se há sobreposição de datas
            AND: [{ dataCheckIn: { lte: dataCheckOut } }, { dataCheckOut: { gte: dataCheckIn } }],
          },
        ],
      },
    })

    if (reservaExistente) {
      return NextResponse.json({ error: "A acomodação não está disponível no período selecionado" }, { status: 400 })
    }

    // Gerar código único para a reserva
    const codigoReserva = `RES${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`

    // Calcular valor total
    const diffTime = Math.abs(dataCheckOut.getTime() - dataCheckIn.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const valorTotal = diffDays * Number(acomodacao.precoBase)

    // Criar a reserva
    const reserva = await prisma.reserva.create({
      data: {
        codigo: codigoReserva,
        dataCheckIn,
        dataCheckOut,
        numeroPessoas: body.numeroPessoas || acomodacao.capacidade,
        valorTotal,
        valorPago: body.valorPago || 0,
        status: body.status || "CONFIRMADA",
        observacoes: body.observacoes,
        clienteId: body.clienteId,
        acomodacaoId: body.acomodacaoId,
        estabelecimentoId: body.estabelecimentoId,
      },
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

    // Atualizar o status da acomodação para RESERVADO
    await prisma.acomodacao.update({
      where: { id: body.acomodacaoId },
      data: { status: "RESERVADO" },
    })

    // Atualizar o contador de quartos disponíveis do estabelecimento
    if (acomodacao.status === "LIVRE") {
      await prisma.estabelecimento.update({
        where: { id: body.estabelecimentoId },
        data: {
          quartosDisponiveis: { decrement: 1 },
        },
      })
    }

    return NextResponse.json(reserva, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar reserva:", error)
    return NextResponse.json({ error: "Erro ao criar reserva" }, { status: 500 })
  }
}

