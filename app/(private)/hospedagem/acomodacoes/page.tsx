"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Plus, Search, Filter, ArrowUpDown, MoreHorizontal, Bed, Users, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

// Tipos
interface Acomodacao {
  id: string
  nome: string
  numeroQuarto: string
  capacidade: number
  precoBase: number
  status: "LIVRE" | "OCUPADO" | "RESERVADO" | "MANUTENCAO" | "LIMPEZA"
  descricao?: string
  amenidades?: string
  imagemUrl?: string
  estabelecimentoId: string
  tipoAcomodacaoId: string
  estabelecimento: {
    id: string
    nome: string
  }
  tipoAcomodacao: {
    id: string
    nome: string
  }
}

interface Estabelecimento {
  id: string
  nome: string
}

interface TipoAcomodacao {
  id: string
  nome: string
}

// Componente principal
export default function AcomodacoesPage() {
  const router = useRouter()
  const [acomodacoes, setAcomodacoes] = useState<Acomodacao[]>([])
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([])
  const [tiposAcomodacao, setTiposAcomodacao] = useState<TipoAcomodacao[]>([])
  const [filtroEstabelecimento, setFiltroEstabelecimento] = useState<string>("todos")
  const [filtroTipo, setFiltroTipo] = useState<string>("todos")
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [pesquisa, setPesquisa] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentAcomodacao, setCurrentAcomodacao] = useState<Acomodacao | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [acomodacaoToDelete, setAcomodacaoToDelete] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Carregar dados
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Buscar estabelecimentos
        const resEstabelecimentos = await fetch("/api/estabelecimentos")
        if (!resEstabelecimentos.ok) throw new Error("Falha ao carregar estabelecimentos")
        const estabelecimentosData = await resEstabelecimentos.json()
        setEstabelecimentos(estabelecimentosData)

        // Buscar tipos de acomodação
        const resTipos = await fetch("/api/acomodacoes/tipos")
        if (!resTipos.ok) throw new Error("Falha ao carregar tipos de acomodação")
        const tiposData = await resTipos.json()
        setTiposAcomodacao(tiposData)

        // Buscar acomodações
        const resAcomodacoes = await fetch("/api/acomodacoes")
        if (!resAcomodacoes.ok) throw new Error("Falha ao carregar acomodações")
        const acomodacoesData = await resAcomodacoes.json()
        setAcomodacoes(acomodacoesData)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados. Tente novamente mais tarde.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filtrar acomodações
  const acomodacoesFiltradas = acomodacoes.filter((acomodacao) => {
    // Filtro por estabelecimento
    if (filtroEstabelecimento !== "todos" && acomodacao.estabelecimentoId !== filtroEstabelecimento) {
      return false
    }

    // Filtro por tipo
    if (filtroTipo !== "todos" && acomodacao.tipoAcomodacaoId !== filtroTipo) {
      return false
    }

    // Filtro por status
    if (filtroStatus !== "todos" && acomodacao.status !== filtroStatus) {
      return false
    }

    // Filtro por pesquisa
    if (pesquisa) {
      const termoBusca = pesquisa.toLowerCase()
      return (
        (acomodacao.nome?.toLowerCase() || "").includes(termoBusca) ||
        (acomodacao.numeroQuarto?.toLowerCase() || "").includes(termoBusca) ||
        (acomodacao.descricao?.toLowerCase() || "").includes(termoBusca)
      )
    }

    return true
  })

  // Manipuladores de eventos
  const handleEdit = (acomodacao: Acomodacao) => {
    setCurrentAcomodacao(acomodacao)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setAcomodacaoToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (acomodacaoToDelete) {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/acomodacoes/${acomodacaoToDelete}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erro ao excluir acomodação")
        }

        setAcomodacoes(acomodacoes.filter((a) => a.id !== acomodacaoToDelete))
        toast({
          title: "Sucesso",
          description: "Acomodação excluída com sucesso",
        })
      } catch (error: any) {
        console.error("Erro ao excluir acomodação:", error)
        toast({
          title: "Erro",
          description: error.message || "Não foi possível excluir a acomodação",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        setIsDeleteDialogOpen(false)
        setAcomodacaoToDelete(null)
      }
    }
  }

  const handleSave = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const amenidadesStr = formData.get("amenidades") as string

      const acomodacaoData = {
        nome: formData.get("nome") as string,
        numeroQuarto: formData.get("numeroQuarto") as string,
        capacidade: Number.parseInt(formData.get("capacidade") as string),
        precoBase: Number.parseFloat(formData.get("precoBase") as string),
        status: formData.get("status") as "LIVRE" | "OCUPADO" | "RESERVADO" | "MANUTENCAO" | "LIMPEZA",
        descricao: formData.get("descricao") as string,
        amenidades: amenidadesStr,
        estabelecimentoId: formData.get("estabelecimento") as string,
        tipoAcomodacaoId: formData.get("tipoAcomodacao") as string,
      }

      let response

      if (currentAcomodacao) {
        // Atualizar
        response = await fetch(`/api/acomodacoes/${currentAcomodacao.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(acomodacaoData),
        })
      } else {
        // Criar novo
        response = await fetch("/api/acomodacoes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(acomodacaoData),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao salvar acomodação")
      }

      const savedAcomodacao = await response.json()

      if (currentAcomodacao) {
        setAcomodacoes(acomodacoes.map((a) => (a.id === savedAcomodacao.id ? savedAcomodacao : a)))
        toast({
          title: "Sucesso",
          description: "Acomodação atualizada com sucesso",
        })
      } else {
        setAcomodacoes([...acomodacoes, savedAcomodacao])
        toast({
          title: "Sucesso",
          description: "Acomodação criada com sucesso",
        })
      }
    } catch (error: any) {
      console.error("Erro ao salvar acomodação:", error)
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar a acomodação",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsDialogOpen(false)
      setCurrentAcomodacao(null)
    }
  }

  // Renderização do status com cores
  const renderStatus = (status: string) => {
    switch (status) {
      case "LIVRE":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Disponível
          </Badge>
        )
      case "OCUPADO":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Ocupado
          </Badge>
        )
      case "MANUTENCAO":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Manutenção
          </Badge>
        )
      case "RESERVADO":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Reservado
          </Badge>
        )
      case "LIMPEZA":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
            Limpeza
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Formulário de acomodação
  const AcomodacaoForm = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSave(new FormData(e.target as HTMLFormElement))
      }}
    >
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" name="nome" defaultValue={currentAcomodacao?.nome} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numeroQuarto">Número do Quarto</Label>
            <Input id="numeroQuarto" name="numeroQuarto" defaultValue={currentAcomodacao?.numeroQuarto} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="estabelecimento">Estabelecimento</Label>
            <Select name="estabelecimento" defaultValue={currentAcomodacao?.estabelecimentoId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estabelecimento" />
              </SelectTrigger>
              <SelectContent>
                {estabelecimentos.map((estabelecimento) => (
                  <SelectItem key={estabelecimento.id} value={estabelecimento.id}>
                    {estabelecimento.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tipoAcomodacao">Tipo de Acomodação</Label>
            <Select name="tipoAcomodacao" defaultValue={currentAcomodacao?.tipoAcomodacaoId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposAcomodacao.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id}>
                    {tipo.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="capacidade">Capacidade</Label>
            <Input
              id="capacidade"
              name="capacidade"
              type="number"
              min="1"
              defaultValue={currentAcomodacao?.capacidade || 1}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="precoBase">Preço Base (R$)</Label>
            <Input
              id="precoBase"
              name="precoBase"
              type="number"
              step="0.01"
              min="0"
              defaultValue={currentAcomodacao?.precoBase || 0}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select name="status" defaultValue={currentAcomodacao?.status || "LIVRE"} required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LIVRE">Disponível</SelectItem>
              <SelectItem value="OCUPADO">Ocupado</SelectItem>
              <SelectItem value="RESERVADO">Reservado</SelectItem>
              <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
              <SelectItem value="LIMPEZA">Limpeza</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            name="descricao"
            defaultValue={currentAcomodacao?.descricao || ""}
            className="min-h-[80px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amenidades">Amenidades (separadas por vírgula)</Label>
          <Textarea
            id="amenidades"
            name="amenidades"
            defaultValue={currentAcomodacao?.amenidades || ""}
            className="min-h-[80px]"
            placeholder="Wi-Fi, Ar-condicionado, TV, Frigobar, etc."
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : currentAcomodacao ? "Salvar alterações" : "Adicionar acomodação"}
        </Button>
      </DialogFooter>
    </form>
  )

  // Componente de card para visualização em grid
  const AcomodacaoCard = ({ acomodacao }: { acomodacao: Acomodacao }) => {
    // Extrair amenidades do campo de texto
    const amenidades = acomodacao.amenidades
      ? acomodacao.amenidades
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : []

    return (
      <Card>
        <CardHeader className="p-4">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{acomodacao.nome}</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleEdit(acomodacao)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(acomodacao.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardDescription>{acomodacao.estabelecimento?.nome}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center text-sm">
              <Bed className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>
                {acomodacao.tipoAcomodacao?.nome} - Quarto {acomodacao.numeroQuarto}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>Capacidade: {acomodacao.capacidade} pessoas</span>
            </div>
            <div className="flex items-center text-sm">
              <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>R$ {Number(acomodacao.precoBase).toFixed(2)}</span>
            </div>
            <div className="mt-2">{renderStatus(acomodacao.status)}</div>
          </div>
        </CardContent>
        {amenidades.length > 0 && (
          <CardFooter className="p-4 pt-0">
            <div className="flex flex-wrap gap-1">
              {amenidades.slice(0, 3).map((amenidade, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {amenidade}
                </Badge>
              ))}
              {amenidades.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{amenidades.length - 3}
                </Badge>
              )}
            </div>
          </CardFooter>
        )}
      </Card>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Acomodações</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setCurrentAcomodacao(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Acomodação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{currentAcomodacao ? "Editar Acomodação" : "Nova Acomodação"}</DialogTitle>
              <DialogDescription>
                {currentAcomodacao
                  ? "Edite os detalhes da acomodação abaixo."
                  : "Preencha os detalhes da nova acomodação abaixo."}
              </DialogDescription>
            </DialogHeader>
            <AcomodacaoForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar acomodações..."
                className="pl-8"
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "list")}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Visualização" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">Grid</SelectItem>
                <SelectItem value="list">Lista</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[120px]">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtros
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <div className="p-2">
                  <Label htmlFor="estabelecimento-filter" className="text-xs">
                    Estabelecimento
                  </Label>
                  <Select value={filtroEstabelecimento} onValueChange={setFiltroEstabelecimento}>
                    <SelectTrigger id="estabelecimento-filter" className="mt-1">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {estabelecimentos.map((estabelecimento) => (
                        <SelectItem key={estabelecimento.id} value={estabelecimento.id}>
                          {estabelecimento.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DropdownMenuSeparator />

                <div className="p-2">
                  <Label htmlFor="tipo-filter" className="text-xs">
                    Tipo
                  </Label>
                  <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                    <SelectTrigger id="tipo-filter" className="mt-1">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {tiposAcomodacao.map((tipo) => (
                        <SelectItem key={tipo.id} value={tipo.id}>
                          {tipo.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DropdownMenuSeparator />

                <div className="p-2">
                  <Label htmlFor="status-filter" className="text-xs">
                    Status
                  </Label>
                  <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                    <SelectTrigger id="status-filter" className="mt-1">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="LIVRE">Disponível</SelectItem>
                      <SelectItem value="OCUPADO">Ocupado</SelectItem>
                      <SelectItem value="RESERVADO">Reservado</SelectItem>
                      <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                      <SelectItem value="LIMPEZA">Limpeza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader className="p-4">
                <div className="h-6 bg-muted animate-pulse rounded-md" />
                <div className="h-4 bg-muted animate-pulse rounded-md w-2/3 mt-2" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded-md" />
                  <div className="h-4 bg-muted animate-pulse rounded-md" />
                  <div className="h-4 bg-muted animate-pulse rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : acomodacoesFiltradas.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">Nenhuma acomodação encontrada</h3>
          <p className="text-muted-foreground mt-2">Tente ajustar os filtros ou adicione uma nova acomodação.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {acomodacoesFiltradas.map((acomodacao) => (
            <AcomodacaoCard key={acomodacao.id} acomodacao={acomodacao} />
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Estabelecimento</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Quarto</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead>
                  <div className="flex items-center">
                    Preço
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {acomodacoesFiltradas.map((acomodacao) => (
                <TableRow key={acomodacao.id}>
                  <TableCell className="font-medium">{acomodacao.nome}</TableCell>
                  <TableCell>{acomodacao.estabelecimento?.nome}</TableCell>
                  <TableCell>{acomodacao.tipoAcomodacao?.nome}</TableCell>
                  <TableCell>{acomodacao.numeroQuarto}</TableCell>
                  <TableCell>{acomodacao.capacidade} pessoas</TableCell>
                  <TableCell>R$ {Number(acomodacao.precoBase).toFixed(2)}</TableCell>
                  <TableCell>{renderStatus(acomodacao.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(acomodacao)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(acomodacao.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Dialog de confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta acomodação? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isLoading}>
              {isLoading ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

