"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdicionaisModal } from "@/components/adicionais-modal"
import { api } from "@/lib/api/api-utils"
import { formatCurrency } from "@/lib/utils"
import { Icons } from "@/components/icons"

interface Adicional {
  id: string
  nome: string
  descricao: string
  preco: number
}

export default function AdicionaisPage() {
  const [adicionais, setAdicionais] = useState<Adicional[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentAdicional, setCurrentAdicional] = useState<Adicional | null>(null)

  const fetchAdicionais = async () => {
    try {
      setIsLoading(true)
      const data = await api.getAll<Adicional[]>("/api/addons")
      setAdicionais(data)
      setIsLoading(false)
    } catch (error) {
      console.error("Erro ao buscar adicionais:", error)
      setIsLoading(false)
      // Dados de fallback em caso de erro
      setAdicionais([
        {
          id: "1",
          nome: "Café da manhã",
          descricao: "Café da manhã completo",
          preco: 25.0,
        },
        {
          id: "2",
          nome: "Estacionamento",
          descricao: "Vaga de estacionamento",
          preco: 15.0,
        },
      ])
    }
  }

  useEffect(() => {
    fetchAdicionais()
  }, [])

  const handleOpenModal = (adicional?: Adicional) => {
    setCurrentAdicional(adicional || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setCurrentAdicional(null)
  }

  const handleSaveAdicional = async (data: Omit<Adicional, "id">) => {
    try {
      if (currentAdicional) {
        // Editar adicional existente
        await api.update<Adicional>(`/api/addons/${currentAdicional.id}`, data)
      } else {
        // Criar novo adicional
        await api.create<Adicional>("/api/addons", data)
      }
      fetchAdicionais()
      handleCloseModal()
    } catch (error) {
      console.error("Erro ao salvar adicional:", error)
      alert("Ocorreu um erro ao salvar o adicional. Por favor, tente novamente.")
    }
  }

  const handleDeleteAdicional = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este adicional?")) {
      try {
        await api.remove(`/api/addons/${id}`)
        fetchAdicionais()
      } catch (error) {
        console.error("Erro ao excluir adicional:", error)
        alert("Ocorreu um erro ao excluir o adicional. Por favor, tente novamente.")
      }
    }
  }

  const filteredAdicionais = adicionais.filter(
    (adicional) =>
      adicional.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adicional.descricao.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Adicionais</h1>
        <Button onClick={() => handleOpenModal()}>Novo Adicional</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Adicionais</CardTitle>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Buscar adicionais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdicionais.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Nenhum adicional encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdicionais.map((adicional) => (
                    <TableRow key={adicional.id}>
                      <TableCell className="font-medium">{adicional.nome}</TableCell>
                      <TableCell>{adicional.descricao}</TableCell>
                      <TableCell>{formatCurrency(adicional.preco)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleOpenModal(adicional)}>
                            Editar
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteAdicional(adicional.id)}>
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AdicionaisModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAdicional}
        adicional={currentAdicional}
      />
    </div>
  )
}

