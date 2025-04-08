import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        reservas: {
          orderBy: { dataCheckIn: "desc" },
          take: 5,
        },
        _count: {
          select: { reservas: true },
        },
      },
    })

    if (!cliente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    // Formatar os dados para incluir o totalReservas
    const clienteFormatado = {
      ...cliente,
      totalReservas: cliente._count.reservas,
      ultimaReserva: cliente.reservas.length > 0 ? cliente.reservas[0].dataCheckIn : null,
      _count: undefined,
    }

    return NextResponse.json(clienteFormatado)
  } catch (error) {
    console.error("Erro ao buscar cliente:", error)
    return NextResponse.json({ error: "Erro ao buscar cliente" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Verificar se o cliente existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { id },
    })

    if (!clienteExistente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    // Verificar se o CPF foi alterado e se já existe outro cliente com o mesmo CPF
    if (body.cpf && body.cpf !== clienteExistente.cpf) {
      const clienteComMesmoCpf = await prisma.cliente.findUnique({
        where: { cpf: body.cpf },
      })

      if (clienteComMesmoCpf) {
        return NextResponse.json({ error: "Já existe um cliente com este CPF" }, { status: 400 })
      }
    }

    // Atualizar o cliente
    const clienteAtualizado = await prisma.cliente.update({
      where: { id },
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

    return NextResponse.json(clienteAtualizado)
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error)
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Verificar se o cliente existe
    const cliente = await prisma.cliente.findUnique({
      where: { id },
    })

    if (!cliente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }

    // Verificar se há reservas para este cliente
    const reservasCount = await prisma.reserva.count({
      where: { clienteId: id },
    })

    if (reservasCount > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir este cliente pois existem reservas associadas a ele" },
        { status: 400 },
      )
    }

    // Excluir o cliente
    await prisma.cliente.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir cliente:", error)
    return NextResponse.json({ error: "Erro ao excluir cliente" }, { status: 500 })
  }
}

