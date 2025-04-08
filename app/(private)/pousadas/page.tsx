"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Estabelecimento {
  id: string
  nome: string
  endereco: string
  cidade: string
  estado?: string
  cep?: string
  telefone?: string
  email?: string
  website?: string
  totalQuartos?: number
  quartosDisponiveis?: number
  status: string
  cor: string
  descricao?: string
}

export default function PousadasPage() {
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [novaPousada, setNovaPousada] = useState({
    nome: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    telefone: "",
    email: "",
    website: "",
    totalQuartos: 0,
    quartosDisponiveis: 0,
    status: "ativo",
    cor: "bg-blue-100",
    descricao: "",
  })
  const [estabelecimentoParaEditar, setPousadaParaEditar] = useState<any>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [estabelecimentoParaExcluir, setPousadaParaExcluir] = useState<string | null>(null)

  useEffect(() => {
    const fetchEstabelecimentos = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/estabelecimentos")
        if (!response.ok) {
          throw new Error("Failed to fetch establishments")
        }
        const data = await response.json()
        setEstabelecimentos(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Erro ao carregar estabelecimentos:", error)
        setIsLoading(false)
      }
    }

    fetchEstabelecimentos()
  }, [])

  const handleAddEstabelecimento = async () => {
    if (novaPousada.nome && novaPousada.endereco && novaPousada.cidade) {
      try {
        const response = await fetch("/api/estabelecimentos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: novaPousada.nome,
            endereco: novaPousada.endereco,
            cidade: novaPousada.cidade,
            estado: novaPousada.estado || "",
            cep: novaPousada.cep || "",
            telefone: novaPousada.telefone || "",
            email: novaPousada.email || "",
            website: novaPousada.website,
            totalQuartos: novaPousada.totalQuartos || 0,
            quartosDisponiveis: novaPousada.quartosDisponiveis || 0,
            status: "ativo",
            cor: novaPousada.cor || "bg-blue-100",
            descricao: novaPousada.descricao,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to add establishment")
        }

        const novoEstabelecimento = await response.json()
        setEstabelecimentos([...estabelecimentos, novoEstabelecimento])
        setNovaPousada({
          nome: "",
          endereco: "",
          cidade: "",
          estado: "",
          cep: "",
          telefone: "",
          email: "",
          website: "",
          totalQuartos: 0,
          quartosDisponiveis: 0,
          status: "ativo",
          cor: "bg-blue-100",
          descricao: "",
        })
        setIsAddDialogOpen(false)
      } catch (error) {
        console.error("Erro ao adicionar estabelecimento:", error)
      }
    }
  }

  const handleEditEstabelecimento = async () => {
    if (estabelecimentoParaEditar && estabelecimentoParaEditar.nome && estabelecimentoParaEditar.endereco) {
      try {
        const response = await fetch(`/api/estabelecimentos/${estabelecimentoParaEditar.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(estabelecimentoParaEditar),
        })

        if (!response.ok) {
          throw new Error("Failed to update establishment")
        }

        const estabelecimentoAtualizado = await response.json()
        setEstabelecimentos(
          estabelecimentos.map((e) => (e.id === estabelecimentoAtualizado.id ? estabelecimentoAtualizado : e)),
        )
        setIsEditDialogOpen(false)
      } catch (error) {
        console.error("Erro ao atualizar estabelecimento:", error)
      }
    }
  }

  const handleDeleteEstabelecimento = async () => {
    if (estabelecimentoParaExcluir) {
      try {
        const response = await fetch(`/api/estabelecimentos/${estabelecimentoParaExcluir}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete establishment")
        }

        setEstabelecimentos(estabelecimentos.filter((e) => e.id !== estabelecimentoParaExcluir))
        setIsDeleteDialogOpen(false)
      } catch (error) {
        console.error("Erro ao excluir estabelecimento:", error)
      }
    }
  }

  const toggleEstabelecimentoStatus = async (id: string) => {
    const estabelecimento = estabelecimentos.find((e) => e.id === id)
    if (!estabelecimento) return

    const novoStatus = estabelecimento.status === "ativo" ? "inativo" : "ativo"

    try {
      const response = await fetch(`/api/estabelecimentos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...estabelecimento,
          status: novoStatus,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update establishment status")
      }

      const estabelecimentoAtualizado = await response.json()
      setEstabelecimentos(
        estabelecimentos.map((e) => (e.id === estabelecimentoAtualizado.id ? estabelecimentoAtualizado : e)),
      )
    } catch (error) {
      console.error("Erro ao atualizar status do estabelecimento:", error)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gerenciamento de Pousadas</h1>
          <p className="text-muted-foreground">Adicione, edite ou remova pousadas do sistema</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Pousada
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pousadas Cadastradas</CardTitle>
          <CardDescription>Lista de todas as pousadas disponíveis no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Quartos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estabelecimentos.map((estabelecimento) => (
                <TableRow key={estabelecimento.id}>
                  <TableCell className="font-medium">{estabelecimento.nome}</TableCell>
                  <TableCell>{estabelecimento.endereco}</TableCell>
                  <TableCell>{estabelecimento.cidade}</TableCell>
                  <TableCell>{estabelecimento.totalQuartos}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={estabelecimento.status === "ativo"}
                        onCheckedChange={() => toggleEstabelecimentoStatus(estabelecimento.id)}
                      />
                      <Badge variant={estabelecimento.status === "ativo" ? "success" : "destructive"}>
                        {estabelecimento.status === "ativo" ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`h-6 w-6 rounded-full ${estabelecimento.cor}`}></div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setPousadaParaEditar(estabelecimento)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setPousadaParaExcluir(estabelecimento.id)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal para adicionar pousada */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Nova Pousada</DialogTitle>
            <DialogDescription>Preencha os dados para adicionar uma nova pousada ao sistema.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              <Input
                id="nome"
                value={novaPousada.nome}
                onChange={(e) => setNovaPousada({ ...novaPousada, nome: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endereco" className="text-right">
                Endereço
              </Label>
              <Input
                id="endereco"
                value={novaPousada.endereco}
                onChange={(e) => setNovaPousada({ ...novaPousada, endereco: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cidade" className="text-right">
                Cidade
              </Label>
              <Input
                id="cidade"
                value={novaPousada.cidade}
                onChange={(e) => setNovaPousada({ ...novaPousada, cidade: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quartos" className="text-right">
                Quartos
              </Label>
              <Input
                id="quartos"
                type="number"
                value={novaPousada.totalQuartos || ""}
                onChange={(e) => setNovaPousada({ ...novaPousada, totalQuartos: Number.parseInt(e.target.value) || 0 })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddEstabelecimento}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar pousada */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Pousada</DialogTitle>
            <DialogDescription>Atualize os dados da pousada selecionada.</DialogDescription>
          </DialogHeader>
          {estabelecimentoParaEditar && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-nome" className="text-right">
                  Nome
                </Label>
                <Input
                  id="edit-nome"
                  value={estabelecimentoParaEditar.nome}
                  onChange={(e) => setPousadaParaEditar({ ...estabelecimentoParaEditar, nome: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-endereco" className="text-right">
                  Endereço
                </Label>
                <Input
                  id="edit-endereco"
                  value={estabelecimentoParaEditar.endereco}
                  onChange={(e) => setPousadaParaEditar({ ...estabelecimentoParaEditar, endereco: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-cidade" className="text-right">
                  Cidade
                </Label>
                <Input
                  id="edit-cidade"
                  value={estabelecimentoParaEditar.cidade}
                  onChange={(e) => setPousadaParaEditar({ ...estabelecimentoParaEditar, cidade: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-quartos" className="text-right">
                  Quartos
                </Label>
                <Input
                  id="edit-quartos"
                  type="number"
                  value={estabelecimentoParaEditar.totalQuartos || ""}
                  onChange={(e) =>
                    setPousadaParaEditar({
                      ...estabelecimentoParaEditar,
                      totalQuartos: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditEstabelecimento}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para confirmar exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta pousada? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteEstabelecimento}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

