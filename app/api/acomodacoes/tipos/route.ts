import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const tiposAcomodacao = await prisma.tipoAcomodacao.findMany({
      orderBy: { nome: "asc" },
    })

    return NextResponse.json(tiposAcomodacao)
  } catch (error) {
    console.error("Erro ao buscar tipos de acomodação:", error)
    return NextResponse.json({ error: "Erro ao buscar tipos de acomodação" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar campos obrigatórios
    if (!body.nome) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }

    // Verificar se já existe um tipo com o mesmo nome
    const tipoExistente = await prisma.tipoAcomodacao.findUnique({
      where: { nome: body.nome },
    })

    if (tipoExistente) {
      return NextResponse.json({ error: "Já existe um tipo de acomodação com este nome" }, { status: 400 })
    }

    const tipoAcomodacao = await prisma.tipoAcomodacao.create({
      data: {
        nome: body.nome,
        descricao: body.descricao,
      },
    })

    return NextResponse.json(tipoAcomodacao, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar tipo de acomodação:", error)
    return NextResponse.json({ error: "Erro ao criar tipo de acomodação" }, { status: 500 })
  }
}

