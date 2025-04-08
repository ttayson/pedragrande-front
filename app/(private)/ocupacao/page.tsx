"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Home, Users } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/api/api-utils"

type Acomodacao = {
  id: string
  nome: string
  tipo: string
  capacidade: number
  status: "ocupado" | "livre" | "manutencao" | "reservado"
  estabelecimento: string
  precoBase: number
  numeroQuarto?: string
}

type Estabelecimento = {
  id: string
  nome: string
}

type TipoAcomodacao = {
  id: string
  nome: string
  valor: string
}

export default function OcupacaoPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [acomodacoes, setAcomodacoes] = useState<Acomodacao[]>([])
  const [filteredAcomodacoes, setFilteredAcomodacoes] = useState<Acomodacao[]>([])
  const [dataInicio, setDataInicio] = useState<Date | undefined>(new Date())
  const [dataFim, setDataFim] = useState<Date | undefined>(new Date(new Date().setDate(new Date().getDate() + 7)))
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([])
  const [tiposAcomodacao, setTiposAcomodacao] = useState<TipoAcomodacao[]>([])
  const [estabelecimentoFiltro, setEstabelecimentoFiltro] = useState<string>("todos")
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Buscar estabelecimentos da API
        const estabelecimentosData = await api.getAll("/api/estabelecimentos")
        setEstabelecimentos(estabelecimentosData)

        // Buscar tipos de acomodação da API
        const tiposData = await api.getAll("/api/acomodacoes/tipos")
        setTiposAcomodacao(tiposData)

        // Buscar acomodações da API
        const acomodacoesData = await api.getAll("/api/acomodacoes")
        setAcomodacoes(acomodacoesData)
        setFilteredAcomodacoes(acomodacoesData)

        setIsLoading(false)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setIsLoading(false)

        // Dados de fallback em caso de erro
        const mockAcomodacoes: Acomodacao[] = [
          {
            id: "1",
            nome: "Suíte Master",
            tipo: "suite",
            capacidade: 2,
            status: "ocupado",
            estabelecimento: "Pousada Central",
            precoBase: 350,
            numeroQuarto: "101",
          },
          {
            id: "2",
            nome: "Quarto Standard",
            tipo: "standard",
            capacidade: 2,
            status: "livre",
            estabelecimento: "Pousada Central",
            precoBase: 200,
            numeroQuarto: "102",
          },
          {
            id: "3",
            nome: "Suíte Luxo",
            tipo: "suite",
            capacidade: 3,
            status: "reservado",
            estabelecimento: "Pousada Central",
            precoBase: 450,
            numeroQuarto: "103",
          },
          {
            id: "4",
            nome: "Quarto Duplo",
            tipo: "standard",
            capacidade: 2,
            status: "manutencao",
            estabelecimento: "Pousada Central",
            precoBase: 220,
            numeroQuarto: "104",
          },
          {
            id: "5",
            nome: "Suíte Família",
            tipo: "suite",
            capacidade: 4,
            status: "livre",
            estabelecimento: "Pousada Montanha",
            precoBase: 500,
            numeroQuarto: "201",
          },
          {
            id: "6",
            nome: "Chalé",
            tipo: "chale",
            capacidade: 2,
            status: "ocupado",
            estabelecimento: "Pousada Montanha",
            precoBase: 380,
            numeroQuarto: "C01",
          },
          {
            id: "7",
            nome: "Quarto Standard",
            tipo: "standard",
            capacidade: 2,
            status: "livre",
            estabelecimento: "Pousada Montanha",
            precoBase: 180,
            numeroQuarto: "202",
          },
          {
            id: "8",
            nome: "Suíte Master",
            tipo: "suite",
            capacidade: 2,
            status: "reservado",
            estabelecimento: "Pousada Praia",
            precoBase: 400,
            numeroQuarto: "301",
          },
        ]

        const mockEstabelecimentos: Estabelecimento[] = [
          { id: "1", nome: "Pousada Central" },
          { id: "2", nome: "Pousada Montanha" },
          { id: "3", nome: "Pousada Praia" },
        ]

        const mockTipos: TipoAcomodacao[] = [
          { id: "1", nome: "Standard", valor: "standard" },
          { id: "2", nome: "Suíte", valor: "suite" },
          { id: "3", nome: "Chalé", valor: "chale" },
        ]

        setAcomodacoes(mockAcomodacoes)
        setFilteredAcomodacoes(mockAcomodacoes)
        setEstabelecimentos(mockEstabelecimentos)
        setTiposAcomodacao(mockTipos)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (acomodacoes.length > 0) {
      let filtered = [...acomodacoes]

      // Filtrar por estabelecimento
      if (estabelecimentoFiltro !== "todos") {
        filtered = filtered.filter((acomodacao) => acomodacao.estabelecimento === estabelecimentoFiltro)
      }

      // Filtrar por tipo
      if (tipoFiltro !== "todos") {
        filtered = filtered.filter((acomodacao) => acomodacao.tipo === tipoFiltro)
      }

      setFilteredAcomodacoes(filtered)
    }
  }, [estabelecimentoFiltro, tipoFiltro, acomodacoes])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ocupado":
        return <Badge className="bg-red-500">Ocupado</Badge>
      case "livre":
        return <Badge className="bg-green-500">Livre</Badge>
      case "manutencao":
        return <Badge className="bg-yellow-500">Manutenção</Badge>
      case "reservado":
        return <Badge className="bg-blue-500">Reservado</Badge>
      default:
        return <Badge className="bg-gray-500">Desconhecido</Badge>
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ocupado":
        return "bg-red-100 border-red-300"
      case "livre":
        return "bg-green-100 border-green-300"
      case "manutencao":
        return "bg-yellow-100 border-yellow-300"
      case "reservado":
        return "bg-blue-100 border-blue-300"
      default:
        return "bg-gray-100 border-gray-300"
    }
  }

  const getTaxaOcupacao = () => {
    const total = acomodacoes.length
    const ocupados = acomodacoes.filter((a) => a.status === "ocupado" || a.status === "reservado").length
    return total > 0 ? Math.round((ocupados / total) * 100) : 0
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Ocupação</h1>
        <p className="text-muted-foreground">Visualize e gerencie a ocupação das acomodações</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTaxaOcupacao()}%</div>
            <p className="text-xs text-muted-foreground">
              {acomodacoes.filter((a) => a.status === "ocupado" || a.status === "reservado").length} de{" "}
              {acomodacoes.length} acomodações ocupadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Acomodações Livres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acomodacoes.filter((a) => a.status === "livre").length}</div>
            <p className="text-xs text-muted-foreground">Disponíveis para reserva imediata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Em Manutenção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acomodacoes.filter((a) => a.status === "manutencao").length}</div>
            <p className="text-xs text-muted-foreground">Acomodações temporariamente indisponíveis</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex items-center gap-2">
          <span className="text-sm">De:</span>
          <DatePicker date={dataInicio} setDate={setDataInicio} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">Até:</span>
          <DatePicker date={dataFim} setDate={setDataFim} />
        </div>
        <div className="flex-1 sm:flex-initial">
          <Select value={estabelecimentoFiltro} onValueChange={setEstabelecimentoFiltro}>
            <SelectTrigger>
              <SelectValue placeholder="Estabelecimento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Estabelecimentos</SelectItem>
              {estabelecimentos.map((estabelecimento) => (
                <SelectItem key={estabelecimento.id} value={estabelecimento.nome}>
                  {estabelecimento.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 sm:flex-initial">
          <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os Tipos</SelectItem>
              {tiposAcomodacao.map((tipo) => (
                <SelectItem key={tipo.id} value={tipo.valor}>
                  {tipo.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Visualização em Grid</TabsTrigger>
          <TabsTrigger value="lista">Visualização em Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-muted-foreground">Carregando acomodações...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAcomodacoes.map((acomodacao) => (
                <Card key={acomodacao.id} className={`border-2 ${getStatusColor(acomodacao.status)}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{acomodacao.nome}</h3>
                        <p className="text-sm text-muted-foreground">{acomodacao.estabelecimento}</p>
                      </div>
                      {getStatusBadge(acomodacao.status)}
                    </div>
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center text-sm">
                        <Home className="h-4 w-4 mr-2 text-muted-foreground" />
                        {acomodacao.numeroQuarto ? `Quarto ${acomodacao.numeroQuarto}` : "Sem número"}
                      </div>
                      <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        Capacidade: {acomodacao.capacidade} pessoa(s)
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        R$ {acomodacao.precoBase.toFixed(2)}/diária
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex justify-end">
                      <Button variant="outline" size="sm">
                        Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lista">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">Carregando acomodações...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Acomodação</TableHead>
                      <TableHead>Estabelecimento</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Quarto</TableHead>
                      <TableHead>Capacidade</TableHead>
                      <TableHead>Diária</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAcomodacoes.map((acomodacao) => (
                      <TableRow key={acomodacao.id}>
                        <TableCell className="font-medium">{acomodacao.nome}</TableCell>
                        <TableCell>{acomodacao.estabelecimento}</TableCell>
                        <TableCell>
                          {tiposAcomodacao.find((t) => t.valor === acomodacao.tipo)?.nome || acomodacao.tipo}
                        </TableCell>
                        <TableCell>{acomodacao.numeroQuarto || "—"}</TableCell>
                        <TableCell>{acomodacao.capacidade} pessoa(s)</TableCell>
                        <TableCell>R$ {acomodacao.precoBase.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(acomodacao.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

