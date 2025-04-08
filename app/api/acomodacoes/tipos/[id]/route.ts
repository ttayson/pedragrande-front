import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const tipoAcomodacao = await prisma.tipoAcomodacao.findUnique({
      where: { id },
    })

    if (!tipoAcomodacao) {
      return NextResponse.json({ error: "Tipo de acomodação não encontrado" }, { status: 404 })
    }

    return NextResponse.json(tipoAcomodacao)
  } catch (error) {
    console.error("Erro ao buscar tipo de acomodação:", error)
    return NextResponse.json({ error: "Erro ao buscar tipo de acomodação" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Verificar se o tipo existe
    const tipoExistente = await prisma.tipoAcomodacao.findUnique({
      where: { id },
    })

    if (!tipoExistente) {
      return NextResponse.json({ error: "Tipo de acomodação não encontrado" }, { status: 404 })
    }

    // Verificar se o novo nome já existe (se estiver sendo alterado)
    if (body.nome !== tipoExistente.nome) {
      const nomeExistente = await prisma.tipoAcomodacao.findUnique({
        where: { nome: body.nome },
      })

      if (nomeExistente) {
        return NextResponse.json({ error: "Já existe um tipo de acomodação com este nome" }, { status: 400 })
      }
    }

    // Atualizar o tipo
    const tipoAtualizado = await prisma.tipoAcomodacao.update({
      where: { id },
      data: {
        nome: body.nome,
        descricao: body.descricao,
      },
    })

    return NextResponse.json(tipoAtualizado)
  } catch (error) {
    console.error("Erro ao atualizar tipo de acomodação:", error)
    return NextResponse.json({ error: "Erro ao atualizar tipo de acomodação" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Verificar se o tipo existe
    const tipoExistente = await prisma.tipoAcomodacao.findUnique({
      where: { id },
    })

    if (!tipoExistente) {
      return NextResponse.json({ error: "Tipo de acomodação não encontrado" }, { status: 404 })
    }

    // Verificar se há acomodações usando este tipo
    const acomodacoesComTipo = await prisma.acomodacao.count({
      where: { tipoAcomodacaoId: id },
    })

    if (acomodacoesComTipo > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir este tipo pois existem acomodações associadas a ele" },
        { status: 400 },
      )
    }

    // Excluir o tipo
    await prisma.tipoAcomodacao.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir tipo de acomodação:", error)
    return NextResponse.json({ error: "Erro ao excluir tipo de acomodação" }, { status: 500 })
  }
}

