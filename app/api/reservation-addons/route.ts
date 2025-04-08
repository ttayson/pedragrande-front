import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const reservationId = searchParams.get("reservationId")

    if (!reservationId) {
      return NextResponse.json({ error: "ID da reserva é obrigatório" }, { status: 400 })
    }

    const reservationAddons = await prisma.reservationAddon.findMany({
      where: { reservationId },
      include: {
        addon: true,
      },
    })

    return NextResponse.json(reservationAddons)
  } catch (error) {
    console.error("Erro ao buscar adicionais da reserva:", error)
    return NextResponse.json({ error: "Erro ao buscar adicionais da reserva" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reservationId, addonId } = body

    if (!reservationId || !addonId) {
      return NextResponse.json({ error: "ID da reserva e ID do adicional são obrigatórios" }, { status: 400 })
    }

    const reservationAddon = await prisma.reservationAddon.create({
      data: {
        reservationId,
        addonId,
      },
      include: {
        addon: true,
      },
    })

    return NextResponse.json(reservationAddon, { status: 201 })
  } catch (error) {
    console.error("Erro ao adicionar adicional à reserva:", error)
    return NextResponse.json({ error: "Erro ao adicionar adicional à reserva" }, { status: 500 })
  }
}

