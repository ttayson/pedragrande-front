import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const addon = await prisma.addon.findUnique({
      where: { id },
    })

    if (!addon) {
      return NextResponse.json({ error: "Adicional não encontrado" }, { status: 404 })
    }

    return NextResponse.json(addon)
  } catch (error) {
    console.error("Erro ao buscar adicional:", error)
    return NextResponse.json({ error: "Erro ao buscar adicional" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()
    const { nome, descricao, preco } = body

    if (!nome || preco === undefined) {
      return NextResponse.json({ error: "Nome e preço são obrigatórios" }, { status: 400 })
    }

    const addon = await prisma.addon.update({
      where: { id },
      data: {
        nome,
        descricao: descricao || "",
        preco,
      },
    })

    return NextResponse.json(addon)
  } catch (error) {
    console.error("Erro ao atualizar adicional:", error)
    return NextResponse.json({ error: "Erro ao atualizar adicional" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Verificar se o adicional está sendo usado em alguma reserva
    const reservationAddons = await prisma.reservationAddon.findMany({
      where: { addonId: id },
    })

    if (reservationAddons.length > 0) {
      return NextResponse.json(
        { error: "Este adicional está sendo usado em reservas e não pode ser excluído" },
        { status: 400 },
      )
    }

    await prisma.addon.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir adicional:", error)
    return NextResponse.json({ error: "Erro ao excluir adicional" }, { status: 500 })
  }
}

