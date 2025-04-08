"use client"

import type React from "react"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { format } from "date-fns"

// Adicionar importação para useToast
import { useToast } from "@/components/ui/use-toast"

interface Cliente {
  id: string
  nome: string
  email: string
  telefone: string
  cpf?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  dataCadastro: string
  totalReservas: number
  ultimaReserva?: string
  observacoes?: string
  status: "ativo" | "inativo"
}

interface ClienteModalProps {
  isOpen: boolean
  onClose: () => void
  cliente: Cliente | null
  mode: "view" | "edit" | "create"
}

export function ClienteModal({ isOpen, onClose, cliente, mode }: ClienteModalProps) {
  const [formData, setFormData] = useState<Partial<Cliente>>(
    cliente || {
      nome: "",
      email: "",
      telefone: "",
      cpf: "",
      endereco: "",
      cidade: "",
      estado: "",
      cep: "",
      observacoes: "",
      status: "ativo",
    },
  )

  // Dentro da função ClienteModal, adicionar:
  const { toast } = useToast()

  const handleChange = (field: keyof Cliente, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  // Substituir a função handleSubmit por:

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      let response

      if (mode === "create") {
        // Criar novo cliente
        response = await fetch("/api/clientes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
      } else if (mode === "edit" && cliente?.id) {
        // Atualizar cliente existente
        response = await fetch(`/api/clientes/${cliente.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        })
      }

      if (!response || !response.ok) {
        throw new Error("Erro ao salvar cliente")
      }

      const savedCliente = await response.json()

      toast({
        title: mode === "create" ? "Cliente criado" : "Cliente atualizado",
        description: "Operação realizada com sucesso",
      })

      onClose()
    } catch (error) {
      console.error("Erro ao salvar cliente:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o cliente",
        variant: "destructive",
      })
    }
  }

  const isViewMode = mode === "view"
  const title = mode === "create" ? "Novo Cliente" : mode === "edit" ? "Editar Cliente" : "Detalhes do Cliente"
  const description =
    mode === "create"
      ? "Preencha os dados para cadastrar um novo cliente"
      : mode === "edit"
        ? "Edite os dados do cliente"
        : "Informações detalhadas do cliente"

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {title}
            {cliente && cliente.status && (
              <Badge variant={cliente.status === "ativo" ? "success" : "destructive"}>
                {cliente.status === "ativo" ? "Ativo" : "Inativo"}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="dados" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="endereco">Endereço</TabsTrigger>
              {cliente && cliente.id && <TabsTrigger value="reservas">Reservas</TabsTrigger>}
            </TabsList>

            <TabsContent value="dados" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <Input
                    id="nome"
                    value={formData.nome || ""}
                    onChange={(e) => handleChange("nome", e.target.value)}
                    disabled={isViewMode}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf || ""}
                    onChange={(e) => handleChange("cpf", e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => handleChange("email", e.target.value)}
                    disabled={isViewMode}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone || ""}
                    onChange={(e) => handleChange("telefone", e.target.value)}
                    disabled={isViewMode}
                    required
                  />
                </div>
              </div>

              {cliente && cliente.dataCadastro && (
                <div className="space-y-2">
                  <Label>Data de Cadastro</Label>
                  <Input value={format(new Date(cliente.dataCadastro), "dd/MM/yyyy")} disabled />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes || ""}
                  onChange={(e) => handleChange("observacoes", e.target.value)}
                  disabled={isViewMode}
                  placeholder="Informações adicionais sobre o cliente"
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="endereco" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco || ""}
                  onChange={(e) => handleChange("endereco", e.target.value)}
                  disabled={isViewMode}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade || ""}
                    onChange={(e) => handleChange("cidade", e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.estado || ""}
                    onChange={(e) => handleChange("estado", e.target.value)}
                    disabled={isViewMode}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep || ""}
                  onChange={(e) => handleChange("cep", e.target.value)}
                  disabled={isViewMode}
                />
              </div>
            </TabsContent>

            {cliente && cliente.id && (
              <TabsContent value="reservas" className="space-y-4 mt-4">
                {cliente.totalReservas > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Este cliente possui {cliente.totalReservas} reserva(s).
                      {cliente.ultimaReserva && (
                        <> Última reserva em {format(new Date(cliente.ultimaReserva), "dd/MM/yyyy")}.</>
                      )}
                    </p>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">Histórico de Reservas</h3>
                            <p className="text-sm text-muted-foreground">Visualize todas as reservas deste cliente</p>
                          </div>
                          <Button variant="outline" size="sm">
                            Ver Reservas
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-muted-foreground">Este cliente ainda não possui reservas.</p>
                    <Button variant="outline" className="mt-4">
                      Criar Nova Reserva
                    </Button>
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              {isViewMode ? "Fechar" : "Cancelar"}
            </Button>
            {!isViewMode && <Button type="submit">{mode === "create" ? "Cadastrar" : "Salvar Alterações"}</Button>}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

