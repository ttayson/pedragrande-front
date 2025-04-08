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
          { email: { contains: search, mode: "insensitive" } },
          { telefone: { contains: search, mode: "insensitive" } },
          { cpf: { contains: search, mode: "insensitive" } },
        ],
      }
    }

    const clientes = await prisma.cliente.findMany({
      where: whereClause,
      orderBy: { nome: "asc" },
      include: {
        _count: {
          select: { reservas: true },
        },
      },
    })

    // Formatar os dados para incluir o totalReservas
    const clientesFormatados = clientes.map((cliente) => ({
      ...cliente,
      totalReservas: cliente._count.reservas,
      _count: undefined,
    }))

    return NextResponse.json(clientesFormatados)
  } catch (error) {
    console.error("Erro ao buscar clientes:", error)
    return NextResponse.json({ error: "Erro ao buscar clientes" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar campos obrigatórios
    if (!body.nome) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 })
    }

    // Verificar se já existe um cliente com o mesmo CPF (se fornecido)
    if (body.cpf) {
      const clienteExistente = await prisma.cliente.findUnique({
        where: { cpf: body.cpf },
      })

      if (clienteExistente) {
        return NextResponse.json({ error: "Já existe um cliente com este CPF" }, { status: 400 })
      }
    }

    const cliente = await prisma.cliente.create({
      data: {
        nome: body.nome,
        email: body.email,
        telefone: body.telefone,
        cpf: body.cpf,
        rg: body.rg,
        dataNascimento: body.dataNascimento ? new Date(body.dataNascimento) : null,
        nacionalidade: body.nacionalidade,
        endereco: body.endereco,
        cidade: body.cidade,
        estado: body.estado,
        cep: body.cep,
        observacoes: body.observacoes,
      },
    })

    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar cliente:", error)
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 })
  }
}

