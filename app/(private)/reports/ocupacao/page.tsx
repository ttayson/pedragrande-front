"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Download, BarChart, PieChart, TrendingUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RelatorioOcupacaoPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [dataInicio, setDataInicio] = useState<Date | undefined>(
    new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
  )
  const [dataFim, setDataFim] = useState<Date | undefined>(new Date())
  const [estabelecimento, setEstabelecimento] = useState("todos")

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Relatório de Ocupação</h1>
        <p className="text-muted-foreground">Análise da taxa de ocupação dos estabelecimentos</p>
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
        <Select value={estabelecimento} onValueChange={setEstabelecimento}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estabelecimento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Estabelecimentos</SelectItem>
            <SelectItem value="Pousada 1">Pousada 1</SelectItem>
            <SelectItem value="Pousada 2">Pousada 2</SelectItem>
            <SelectItem value="Pousada 3">Pousada 3</SelectItem>
          </SelectContent>
        </Select>
        <Button className="ml-auto">
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground flex items-center text-green-500">
              <TrendingUp className="h-4 w-4 mr-1" />
              +8% em relação ao período anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diárias Vendidas</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">432</div>
            <p className="text-xs text-muted-foreground">Total de diárias no período</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dias com Maior Ocupação</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Sexta e Sábado</div>
            <p className="text-xs text-muted-foreground">95% de ocupação média</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dias com Menor Ocupação</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Segunda e Terça</div>
            <p className="text-xs text-muted-foreground">45% de ocupação média</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="geral" className="space-y-4">
        <TabsList>
          <TabsTrigger value="geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="estabelecimentos">Por Estabelecimento</TabsTrigger>
          <TabsTrigger value="acomodacoes">Por Tipo de Acomodação</TabsTrigger>
        </TabsList>

        <TabsContent value="geral">
          <Card>
            <CardHeader>
              <CardTitle>Ocupação Geral</CardTitle>
              <CardDescription>Visão geral da ocupação no período selecionado</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">Carregando dados...</p>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center border rounded-md">
                  <p className="text-muted-foreground">Gráfico de Ocupação Geral</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estabelecimentos">
          <Card>
            <CardHeader>
              <CardTitle>Ocupação por Estabelecimento</CardTitle>
              <CardDescription>Comparativo de ocupação entre os estabelecimentos</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">Carregando dados...</p>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center border rounded-md">
                  <p className="text-muted-foreground">Gráfico de Ocupação por Estabelecimento</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acomodacoes">
          <Card>
            <CardHeader>
              <CardTitle>Ocupação por Tipo de Acomodação</CardTitle>
              <CardDescription>Análise de ocupação por categoria de acomodação</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">Carregando dados...</p>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center border rounded-md">
                  <p className="text-muted-foreground">Gráfico de Ocupação por Tipo de Acomodação</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

