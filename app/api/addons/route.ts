import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
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

    const addons = await prisma.addon.findMany({
      where: whereClause,
      orderBy: { nome: "asc" },
    })

    return NextResponse.json(addons)
  } catch (error) {
    console.error("Erro ao buscar adicionais:", error)
    return NextResponse.json({ error: "Erro ao buscar adicionais" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nome, descricao, preco } = body

    if (!nome || preco === undefined) {
      return NextResponse.json({ error: "Nome e preço são obrigatórios" }, { status: 400 })
    }

    const addon = await prisma.addon.create({
      data: {
        nome,
        descricao: descricao || "",
        preco,
      },
    })

    return NextResponse.json(addon, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar adicional:", error)
    return NextResponse.json({ error: "Erro ao criar adicional" }, { status: 500 })
  }
}

