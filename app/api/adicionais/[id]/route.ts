import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const adicional = await prisma.adicional.findUnique({
      where: { id },
    })

    if (!adicional) {
      return NextResponse.json({ error: "Adicional não encontrado" }, { status: 404 })
    }

    return NextResponse.json(adicional)
  } catch (error) {
    console.error("Erro ao buscar adicional:", error)
    return NextResponse.json({ error: "Erro ao buscar adicional" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Verificar se o adicional existe
    const adicionalExistente = await prisma.adicional.findUnique({
      where: { id },
    })

    if (!adicionalExistente) {
      return NextResponse.json({ error: "Adicional não encontrado" }, { status: 404 })
    }

    // Atualizar o adicional
    const adicionalAtualizado = await prisma.adicional.update({
      where: { id },
      data: {
        nome: body.nome,
        descricao: body.descricao,
        valor: body.valor,
      },
    })

    return NextResponse.json(adicionalAtualizado)
  } catch (error) {
    console.error("Erro ao atualizar adicional:", error)
    return NextResponse.json({ error: "Erro ao atualizar adicional" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Verificar se o adicional existe
    const adicional = await prisma.adicional.findUnique({
      where: { id },
    })

    if (!adicional) {
      return NextResponse.json({ error: "Adicional não encontrado" }, { status: 404 })
    }

    // Verificar se há reservas usando este adicional
    const reservasComAdicional = await prisma.reservaAdicional.count({
      where: { adicionalId: id },
    })

    if (reservasComAdicional > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir este adicional pois existem reservas associadas a ele" },
        { status: 400 },
      )
    }

    // Excluir o adicional
    await prisma.adicional.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir adicional:", error)
    return NextResponse.json({ error: "Erro ao excluir adicional" }, { status: 500 })
  }
}

