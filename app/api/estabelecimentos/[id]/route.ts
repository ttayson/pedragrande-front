import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const estabelecimento = await prisma.estabelecimento.findUnique({
      where: { id },
      include: {
        acomodacoes: true,
      },
    })

    if (!estabelecimento) {
      return NextResponse.json({ error: "Estabelecimento não encontrado" }, { status: 404 })
    }

    return NextResponse.json(estabelecimento)
  } catch (error) {
    console.error("Erro ao buscar estabelecimento:", error)
    return NextResponse.json({ error: "Erro ao buscar estabelecimento" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Verificar se o estabelecimento existe
    const estabelecimentoExistente = await prisma.estabelecimento.findUnique({
      where: { id },
    })

    if (!estabelecimentoExistente) {
      return NextResponse.json({ error: "Estabelecimento não encontrado" }, { status: 404 })
    }

    // Atualizar o estabelecimento
    const estabelecimentoAtualizado = await prisma.estabelecimento.update({
      where: { id },
      data: {
        nome: body.nome,
        endereco: body.endereco,
        cidade: body.cidade,
        estado: body.estado,
        cep: body.cep,
        telefone: body.telefone,
        email: body.email,
        website: body.website,
        totalQuartos: body.totalQuartos,
        quartosDisponiveis: body.quartosDisponiveis,
        status: body.status,
        cor: body.cor,
        descricao: body.descricao,
      },
    })

    return NextResponse.json(estabelecimentoAtualizado)
  } catch (error) {
    console.error("Erro ao atualizar estabelecimento:", error)
    return NextResponse.json({ error: "Erro ao atualizar estabelecimento" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Verificar se o estabelecimento existe
    const estabelecimentoExistente = await prisma.estabelecimento.findUnique({
      where: { id },
    })

    if (!estabelecimentoExistente) {
      return NextResponse.json({ error: "Estabelecimento não encontrado" }, { status: 404 })
    }

    // Excluir o estabelecimento
    await prisma.estabelecimento.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir estabelecimento:", error)
    return NextResponse.json({ error: "Erro ao excluir estabelecimento" }, { status: 500 })
  }
}

