"use client"

import { useState, useEffect } from "react"
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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Search, Filter, Download } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

// Tipos para os dados
interface Estabelecimento {
  id: string
  nome: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  telefone: string
  email: string
  website?: string
  totalQuartos: number
  quartosDisponiveis: number
  status: "ativo" | "inativo"
  cor: string
  descricao?: string
}

export default function EstabelecimentosPage() {
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [novoEstabelecimento, setNovoEstabelecimento] = useState<Partial<Estabelecimento>>({
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
  })
  const [estabelecimentoParaEditar, setEstabelecimentoParaEditar] = useState<Estabelecimento | null>(null)
  const [estabelecimentoParaExcluir, setEstabelecimentoParaExcluir] = useState<string | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Carregar dados de estabelecimentos
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

  // Filtrar estabelecimentos
  const estabelecimentosFiltrados = estabelecimentos.filter((estabelecimento) => {
    if (busca) {
      const termoBusca = busca.toLowerCase()
      return (
        estabelecimento.nome.toLowerCase().includes(termoBusca) ||
        estabelecimento.cidade.toLowerCase().includes(termoBusca) ||
        estabelecimento.estado.toLowerCase().includes(termoBusca)
      )
    }
    return true
  })

  // Adicionar novo estabelecimento
  const handleAddEstabelecimento = () => {
    if (novoEstabelecimento.nome && novoEstabelecimento.endereco && novoEstabelecimento.cidade) {
      const cores = ["bg-yellow-100", "bg-purple-100", "bg-pink-100", "bg-indigo-100", "bg-teal-100"]
      const corAleatoria = cores[Math.floor(Math.random() * cores.length)]

      const novoEstabelecimentoCompleto: Estabelecimento = {
        id: (estabelecimentos.length + 1).toString(),
        nome: novoEstabelecimento.nome,
        endereco: novoEstabelecimento.endereco,
        cidade: novoEstabelecimento.cidade,
        estado: novoEstabelecimento.estado || "",
        cep: novoEstabelecimento.cep || "",
        telefone: novoEstabelecimento.telefone || "",
        email: novoEstabelecimento.email || "",
        website: novoEstabelecimento.website,
        totalQuartos: novoEstabelecimento.totalQuartos || 0,
        quartosDisponiveis: novoEstabelecimento.quartosDisponiveis || 0,
        status: "ativo",
        cor: novoEstabelecimento.cor || corAleatoria,
        descricao: novoEstabelecimento.descricao,
      }

      setEstabelecimentos([...estabelecimentos, novoEstabelecimentoCompleto])
      setNovoEstabelecimento({
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
      })
      setIsAddDialogOpen(false)
    }
  }

  // Editar estabelecimento
  const handleEditEstabelecimento = () => {
    if (estabelecimentoParaEditar) {
      setEstabelecimentos(
        estabelecimentos.map((e) => (e.id === estabelecimentoParaEditar.id ? estabelecimentoParaEditar : e)),
      )
      setIsEditDialogOpen(false)
    }
  }

  // Excluir estabelecimento
  const handleDeleteEstabelecimento = () => {
    if (estabelecimentoParaExcluir) {
      setEstabelecimentos(estabelecimentos.filter((e) => e.id !== estabelecimentoParaExcluir))
      setIsDeleteDialogOpen(false)
    }
  }

  // Alternar status do estabelecimento
  const toggleEstabelecimentoStatus = (id: string) => {
    setEstabelecimentos(
      estabelecimentos.map((e) => {
        if (e.id === id) {
          return { ...e, status: e.status === "ativo" ? "inativo" : "ativo" }
        }
        return e
      }),
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Estabelecimentos</h1>
        <p className="text-muted-foreground">Gerencie as pousadas e hotéis do sistema</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Estabelecimentos Cadastrados</CardTitle>
              <CardDescription>Lista de todas as pousadas e hotéis disponíveis no sistema</CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Estabelecimento
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, cidade..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Cidade/Estado</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Quartos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estabelecimentosFiltrados.map((estabelecimento) => (
                <TableRow key={estabelecimento.id}>
                  <TableCell className="font-medium">{estabelecimento.nome}</TableCell>
                  <TableCell>{estabelecimento.endereco}</TableCell>
                  <TableCell>
                    {estabelecimento.cidade}/{estabelecimento.estado}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs">{estabelecimento.telefone}</span>
                      <span className="text-xs text-muted-foreground">{estabelecimento.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {estabelecimento.quartosDisponiveis}/{estabelecimento.totalQuartos} disponíveis
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={estabelecimento.status === "ativo"}
                        onCheckedChange={() => toggleEstabelecimentoStatus(estabelecimento.id)}
                      />
                      <Badge variant={estabelecimento.status === "ativo" ? "success" : "destructive"}>
                        {estabelecimento.status === "ativo" ? "Ativo" : "Inativo"}
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
                          setEstabelecimentoParaEditar(estabelecimento)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEstabelecimentoParaExcluir(estabelecimento.id)
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

      {/* Modal para adicionar estabelecimento */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Estabelecimento</DialogTitle>
            <DialogDescription>Preencha os dados para adicionar um novo estabelecimento ao sistema.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              <Input
                id="nome"
                value={novoEstabelecimento.nome}
                onChange={(e) => setNovoEstabelecimento({ ...novoEstabelecimento, nome: e.target.value })}
                className="col-span-1"
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="endereco" className="text-right">
                Endereço
              </Label>
              <Input
                id="endereco"
                value={novoEstabelecimento.endereco}
                onChange={(e) => setNovoEstabelecimento({ ...novoEstabelecimento, endereco: e.target.value })}
                className="col-span-1"
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="cidade" className="text-right">
                Cidade
              </Label>
              <Input
                id="cidade"
                value={novoEstabelecimento.cidade}
                onChange={(e) => setNovoEstabelecimento({ ...novoEstabelecimento, cidade: e.target.value })}
                className="col-span-1"
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="estado" className="text-right">
                Estado
              </Label>
              <Input
                id="estado"
                value={novoEstabelecimento.estado}
                onChange={(e) => setNovoEstabelecimento({ ...novoEstabelecimento, estado: e.target.value })}
                className="col-span-1"
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="cep" className="text-right">
                CEP
              </Label>
              <Input
                id="cep"
                value={novoEstabelecimento.cep}
                onChange={(e) => setNovoEstabelecimento({ ...novoEstabelecimento, cep: e.target.value })}
                className="col-span-1"
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="telefone" className="text-right">
                Telefone
              </Label>
              <Input
                id="telefone"
                value={novoEstabelecimento.telefone}
                onChange={(e) => setNovoEstabelecimento({ ...novoEstabelecimento, telefone: e.target.value })}
                className="col-span-1"
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={novoEstabelecimento.email}
                onChange={(e) => setNovoEstabelecimento({ ...novoEstabelecimento, email: e.target.value })}
                className="col-span-1"
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="website" className="text-right">
                Website
              </Label>
              <Input
                id="website"
                value={novoEstabelecimento.website}
                onChange={(e) => setNovoEstabelecimento({ ...novoEstabelecimento, website: e.target.value })}
                className="col-span-1"
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="totalQuartos" className="text-right">
                Total de Quartos
              </Label>
              <Input
                id="totalQuartos"
                type="number"
                value={novoEstabelecimento.totalQuartos || ""}
                onChange={(e) =>
                  setNovoEstabelecimento({ ...novoEstabelecimento, totalQuartos: Number.parseInt(e.target.value) || 0 })
                }
                className="col-span-1"
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="quartosDisponiveis" className="text-right">
                Quartos Disponíveis
              </Label>
              <Input
                id="quartosDisponiveis"
                type="number"
                value={novoEstabelecimento.quartosDisponiveis || ""}
                onChange={(e) =>
                  setNovoEstabelecimento({
                    ...novoEstabelecimento,
                    quartosDisponiveis: Number.parseInt(e.target.value) || 0,
                  })
                }
                className="col-span-1"
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <Label htmlFor="descricao" className="text-right">
                Descrição
              </Label>
              <Textarea
                id="descricao"
                value={novoEstabelecimento.descricao || ""}
                onChange={(e) => setNovoEstabelecimento({ ...novoEstabelecimento, descricao: e.target.value })}
                className="col-span-1"
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

      {/* Modal para editar estabelecimento */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Estabelecimento</DialogTitle>
            <DialogDescription>Atualize os dados do estabelecimento selecionado.</DialogDescription>
          </DialogHeader>
          {estabelecimentoParaEditar && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="edit-nome" className="text-right">
                  Nome
                </Label>
                <Input
                  id="edit-nome"
                  value={estabelecimentoParaEditar.nome}
                  onChange={(e) => setEstabelecimentoParaEditar({ ...estabelecimentoParaEditar, nome: e.target.value })}
                  className="col-span-1"
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="edit-endereco" className="text-right">
                  Endereço
                </Label>
                <Input
                  id="edit-endereco"
                  value={estabelecimentoParaEditar.endereco}
                  onChange={(e) =>
                    setEstabelecimentoParaEditar({ ...estabelecimentoParaEditar, endereco: e.target.value })
                  }
                  className="col-span-1"
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="edit-cidade" className="text-right">
                  Cidade
                </Label>
                <Input
                  id="edit-cidade"
                  value={estabelecimentoParaEditar.cidade}
                  onChange={(e) =>
                    setEstabelecimentoParaEditar({ ...estabelecimentoParaEditar, cidade: e.target.value })
                  }
                  className="col-span-1"
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="edit-estado" className="text-right">
                  Estado
                </Label>
                <Input
                  id="edit-estado"
                  value={estabelecimentoParaEditar.estado}
                  onChange={(e) =>
                    setEstabelecimentoParaEditar({ ...estabelecimentoParaEditar, estado: e.target.value })
                  }
                  className="col-span-1"
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="edit-cep" className="text-right">
                  CEP
                </Label>
                <Input
                  id="edit-cep"
                  value={estabelecimentoParaEditar.cep}
                  onChange={(e) => setEstabelecimentoParaEditar({ ...estabelecimentoParaEditar, cep: e.target.value })}
                  className="col-span-1"
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="edit-telefone" className="text-right">
                  Telefone
                </Label>
                <Input
                  id="edit-telefone"
                  value={estabelecimentoParaEditar.telefone}
                  onChange={(e) =>
                    setEstabelecimentoParaEditar({ ...estabelecimentoParaEditar, telefone: e.target.value })
                  }
                  className="col-span-1"
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  value={estabelecimentoParaEditar.email}
                  onChange={(e) =>
                    setEstabelecimentoParaEditar({ ...estabelecimentoParaEditar, email: e.target.value })
                  }
                  className="col-span-1"
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="edit-website" className="text-right">
                  Website
                </Label>
                <Input
                  id="edit-website"
                  value={estabelecimentoParaEditar.website || ""}
                  onChange={(e) =>
                    setEstabelecimentoParaEditar({ ...estabelecimentoParaEditar, website: e.target.value })
                  }
                  className="col-span-1"
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="edit-totalQuartos" className="text-right">
                  Total de Quartos
                </Label>
                <Input
                  id="edit-totalQuartos"
                  type="number"
                  value={estabelecimentoParaEditar.totalQuartos}
                  onChange={(e) =>
                    setEstabelecimentoParaEditar({
                      ...estabelecimentoParaEditar,
                      totalQuartos: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="col-span-1"
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="edit-quartosDisponiveis" className="text-right">
                  Quartos Disponíveis
                </Label>
                <Input
                  id="edit-quartosDisponiveis"
                  type="number"
                  value={estabelecimentoParaEditar.quartosDisponiveis}
                  onChange={(e) =>
                    setEstabelecimentoParaEditar({
                      ...estabelecimentoParaEditar,
                      quartosDisponiveis: Number.parseInt(e.target.value) || 0,
                    })
                  }
                  className="col-span-1"
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="edit-descricao" className="text-right">
                  Descrição
                </Label>
                <Textarea
                  id="edit-descricao"
                  value={estabelecimentoParaEditar.descricao || ""}
                  onChange={(e) =>
                    setEstabelecimentoParaEditar({ ...estabelecimentoParaEditar, descricao: e.target.value })
                  }
                  className="col-span-1"
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
              Tem certeza que deseja excluir este estabelecimento? Esta ação não pode ser desfeita.
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

