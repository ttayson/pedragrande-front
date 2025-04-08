import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const pagamento = await prisma.pagamento.findUnique({
      where: { id },
      include: {
        reserva: {
          include: {
            cliente: true,
            acomodacao: true,
            estabelecimento: true,
          },
        },
      },
    })

    if (!pagamento) {
      return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 })
    }

    return NextResponse.json(pagamento)
  } catch (error) {
    console.error("Erro ao buscar pagamento:", error)
    return NextResponse.json({ error: "Erro ao buscar pagamento" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Verificar se o pagamento existe
    const pagamentoExistente = await prisma.pagamento.findUnique({
      where: { id },
      include: {
        reserva: true,
      },
    })

    if (!pagamentoExistente) {
      return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 })
    }

    // Calcular a diferença de valor para atualizar o valor pago da reserva
    const valorAnterior = Number(pagamentoExistente.valor)
    const novoValor = body.valor ? Number(body.valor) : valorAnterior
    const diferencaValor = novoValor - valorAnterior

    // Atualizar o pagamento
    const pagamentoAtualizado = await prisma.pagamento.update({
      where: { id },
      data: {
        valor: body.valor,
        dataPagamento: body.dataPagamento ? new Date(body.dataPagamento) : undefined,
        metodoPagamento: body.metodoPagamento,
        status: body.status,
        comprovante: body.comprovante,
        observacoes: body.observacoes,
      },
      include: {
        reserva: true,
      },
    })

    // Atualizar o valor pago da reserva se o valor do pagamento foi alterado
    if (diferencaValor !== 0) {
      const reserva = pagamentoExistente.reserva
      const valorPagoAtual = Number(reserva.valorPago)
      const novoValorPago = valorPagoAtual + diferencaValor
      const valorTotal = Number(reserva.valorTotal)

      let novoStatus = reserva.status
      if (
        novoValorPago >= valorTotal &&
        reserva.status !== "CHECK_IN" &&
        reserva.status !== "CHECK_OUT" &&
        reserva.status !== "CONCLUIDA"
      ) {
        novoStatus = "CONFIRMADA"
      } else if (novoValorPago < valorTotal && reserva.status === "CONFIRMADA") {
        novoStatus = "PENDENTE"
      }

      await prisma.reserva.update({
        where: { id: reserva.id },
        data: {
          valorPago: novoValorPago,
          status: novoStatus,
        },
      })
    }

    return NextResponse.json(pagamentoAtualizado)
  } catch (error) {
    console.error("Erro ao atualizar pagamento:", error)
    return NextResponse.json({ error: "Erro ao atualizar pagamento" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Verificar se o pagamento existe
    const pagamento = await prisma.pagamento.findUnique({
      where: { id },
      include: {
        reserva: true,
      },
    })

    if (!pagamento) {
      return NextResponse.json({ error: "Pagamento não encontrado" }, { status: 404 })
    }

    // Atualizar o valor pago da reserva
    const reserva = pagamento.reserva
    const valorPagoAtual = Number(reserva.valorPago)
    const novoValorPago = valorPagoAtual - Number(pagamento.valor)
    const valorTotal = Number(reserva.valorTotal)

    let novoStatus = reserva.status
    if (novoValorPago < valorTotal && reserva.status === "CONFIRMADA") {
      novoStatus = "PENDENTE"
    }

    await prisma.reserva.update({
      where: { id: reserva.id },
      data: {
        valorPago: novoValorPago >= 0 ? novoValorPago : 0,
        status: novoStatus,
      },
    })

    // Excluir o pagamento
    await prisma.pagamento.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir pagamento:", error)
    return NextResponse.json({ error: "Erro ao excluir pagamento" }, { status: 500 })
  }
}

