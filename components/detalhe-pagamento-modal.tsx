"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserIcon, CalendarIcon, HomeIcon, CreditCard, Clock, CheckCircle, AlertCircle } from "lucide-react"

// Adicionar importação para useToast
import { useToast } from "@/components/ui/use-toast"

interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
  cpf?: string
}

interface Pagamento {
  id: string
  reservaId: string
  clienteId: string
  cliente: Cliente
  pousada: string
  quarto: string
  dataEntrada: string
  dataSaida: string
  valorTotal: number
  valorPago: number
  status: "pago" | "pendente" | "parcial" | "cancelado"
  metodoPagamento: string
  dataPagamento?: string
  parcelas?: number
  observacoes?: string
}

interface DetalhePagamentoModalProps {
  isOpen: boolean
  onClose: () => void
  pagamento: Pagamento
}

export function DetalhePagamentoModal({ isOpen, onClose, pagamento }: DetalhePagamentoModalProps) {
  // Calcular valor pendente
  const valorPendente = pagamento.valorTotal - pagamento.valorPago

  // Calcular número de diárias
  const dataEntrada = new Date(pagamento.dataEntrada)
  const dataSaida = new Date(pagamento.dataSaida)
  const diarias = Math.ceil((dataSaida.getTime() - dataEntrada.getTime()) / (1000 * 60 * 60 * 24))

  // Formatar datas
  const dataEntradaFormatada = format(dataEntrada, "dd/MM/yyyy")
  const dataSaidaFormatada = format(dataSaida, "dd/MM/yyyy")

  // Dentro da função DetalhePagamentoModal, adicionar:
  const { toast } = useToast()

  // Adicionar funções para registrar pagamento e enviar lembrete

  const registrarPagamento = async () => {
    try {
      // Implementar lógica para registrar pagamento
      const response = await fetch("/api/pagamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reservaId: pagamento.reservaId,
          valor: valorPendente,
          dataPagamento: new Date().toISOString(),
          metodoPagamento: "PIX", // Valor padrão, poderia ser um input
          status: "CONFIRMADO",
          observacoes: "Pagamento registrado manualmente",
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao registrar pagamento")
      }

      toast({
        title: "Pagamento registrado",
        description: "O pagamento foi registrado com sucesso",
      })

      onClose()
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error)
      toast({
        title: "Erro",
        description: "Não foi possível registrar o pagamento",
        variant: "destructive",
      })
    }
  }

  const enviarLembrete = async () => {
    try {
      // Simulação de envio de lembrete
      // Em uma implementação real, isso chamaria uma API para enviar email/SMS

      toast({
        title: "Lembrete enviado",
        description: `Lembrete enviado para ${pagamento.cliente.email}`,
      })
    } catch (error) {
      console.error("Erro ao enviar lembrete:", error)
      toast({
        title: "Erro",
        description: "Não foi possível enviar o lembrete",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Detalhes do Pagamento
            <StatusBadge status={pagamento.status} />
          </DialogTitle>
          <DialogDescription>
            Reserva #{pagamento.reservaId} - {pagamento.pousada}, Quarto {pagamento.quarto}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="resumo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="cliente">Cliente</TabsTrigger>
            <TabsTrigger value="pagamento">Pagamento</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ {pagamento.valorTotal.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {diarias} diária(s) a R$ {(pagamento.valorTotal / diarias).toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Status do Pagamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {pagamento.status === "pago" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : pagamento.status === "pendente" ? (
                      <Clock className="h-5 w-5 text-amber-500" />
                    ) : pagamento.status === "parcial" ? (
                      <AlertCircle className="h-5 w-5 text-blue-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className="text-lg font-medium">
                      {pagamento.status === "pago"
                        ? "Pago"
                        : pagamento.status === "pendente"
                          ? "Pendente"
                          : pagamento.status === "parcial"
                            ? "Parcial"
                            : "Cancelado"}
                    </span>
                  </div>
                  {pagamento.status === "parcial" && (
                    <p className="text-xs text-muted-foreground mt-1">Falta pagar: R$ {valorPendente.toFixed(2)}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Detalhes da Reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <HomeIcon className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {pagamento.pousada} - Quarto {pagamento.quarto}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Check-in: {dataEntradaFormatada}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>Check-out: {dataSaidaFormatada}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{diarias} diária(s)</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cliente" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Informações do Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{pagamento.cliente.nome}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{pagamento.cliente.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Telefone:</span>
                  <span>{pagamento.cliente.telefone}</span>
                </div>
                {pagamento.cliente.cpf && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">CPF:</span>
                    <span>{pagamento.cliente.cpf}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pagamento" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Detalhes do Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>Método: {pagamento.metodoPagamento}</span>
                </div>
                {pagamento.dataPagamento && (
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>Data: {format(new Date(pagamento.dataPagamento), "dd/MM/yyyy")}</span>
                  </div>
                )}
                {pagamento.parcelas && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Parcelas:</span>
                    <span>{pagamento.parcelas}x</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Valor Total:</span>
                  <span>R$ {pagamento.valorTotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Valor Pago:</span>
                  <span>R$ {pagamento.valorPago.toFixed(2)}</span>
                </div>
                {valorPendente > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Valor Pendente:</span>
                    <span>R$ {valorPendente.toFixed(2)}</span>
                  </div>
                )}
                {pagamento.observacoes && (
                  <div className="mt-4">
                    <span className="text-muted-foreground">Observações:</span>
                    <p className="mt-1">{pagamento.observacoes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {pagamento.status === "pendente" || pagamento.status === "parcial" ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={registrarPagamento}>
                Registrar Pagamento
              </Button>
              <Button onClick={enviarLembrete}>Enviar Lembrete</Button>
            </div>
          ) : (
            <Button onClick={onClose}>Fechar</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Componente para exibir o status do pagamento
function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "pago":
      return <Badge variant="success">Pago</Badge>
    case "pendente":
      return <Badge variant="warning">Pendente</Badge>
    case "parcial":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          Parcial
        </Badge>
      )
    case "cancelado":
      return <Badge variant="destructive">Cancelado</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

