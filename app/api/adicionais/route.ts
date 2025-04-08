import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    let whereClause = {}

    if (search) {
      whereClause = {
        OR: [
          { nome: { contains: search, mode: "insensitive" } },
          { descricao: { contains: search, mode: "insensitive" } },
        ],
      }
    }

    const adicionais = await prisma.adicional.findMany({
      where: whereClause,
      orderBy: { nome: "asc" },
    })

    return NextResponse.json(adicionais)
  } catch (error) {
    console.error("Erro ao buscar adicionais:", error)
    return NextResponse.json({ error: "Erro ao buscar adicionais" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar campos obrigatórios
    if (!body.nome || !body.valor) {
      return NextResponse.json({ error: "Nome e valor são obrigatórios" }, { status: 400 })
    }

    const adicional = await prisma.adicional.create({
      data: {
        nome: body.nome,
        descricao: body.descricao,
        valor: body.valor,
      },
    })

    return NextResponse.json(adicional, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar adicional:", error)
    return NextResponse.json({ error: "Erro ao criar adicional" }, { status: 500 })
  }
}

