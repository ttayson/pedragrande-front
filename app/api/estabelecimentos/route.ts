import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import type { Status } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as Status | null
    const search = searchParams.get("search")

    let whereClause = {}

    if (status) {
      whereClause = { ...whereClause, status }
    }

    if (search) {
      whereClause = {
        ...whereClause,
        OR: [
          { nome: { contains: search, mode: "insensitive" } },
          { cidade: { contains: search, mode: "insensitive" } },
          { estado: { contains: search, mode: "insensitive" } },
        ],
      }
    }

    const estabelecimentos = await prisma.estabelecimento.findMany({
      where: whereClause,
      orderBy: { nome: "asc" },
    })

    return NextResponse.json(estabelecimentos)
  } catch (error) {
    console.error("Erro ao buscar estabelecimentos:", error)
    return NextResponse.json({ error: "Erro ao buscar estabelecimentos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar campos obrigatórios
    if (!body.nome || !body.endereco || !body.cidade || !body.estado) {
      return NextResponse.json({ error: "Nome, endereço, cidade e estado são obrigatórios" }, { status: 400 })
    }

    const estabelecimento = await prisma.estabelecimento.create({
      data: {
        nome: body.nome,
        endereco: body.endereco,
        cidade: body.cidade,
        estado: body.estado,
        cep: body.cep || "",
        telefone: body.telefone || "",
        email: body.email,
        website: body.website,
        totalQuartos: body.totalQuartos || 0,
        quartosDisponiveis: body.quartosDisponiveis || 0,
        status: body.status || "ATIVO",
        cor: body.cor || "bg-blue-100",
        descricao: body.descricao,
      },
    })

    return NextResponse.json(estabelecimento, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar estabelecimento:", error)
    return NextResponse.json({ error: "Erro ao criar estabelecimento" }, { status: 500 })
  }
}

