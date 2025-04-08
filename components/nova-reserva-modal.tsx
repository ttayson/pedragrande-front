"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Textarea } from "@/components/ui/textarea"
import { addDays } from "date-fns"
import { api } from "@/lib/api/api-utils"
import { Checkbox } from "@/components/ui/checkbox"
import { formatCurrency } from "@/lib/utils"

interface NovaReservaModalProps {
  isOpen: boolean
  onClose: () => void
  data: Date
}

interface Estabelecimento {
  id: string
  nome: string
}

interface Acomodacao {
  id: string
  nome: string
  tipo: string
  capacidade: number
  estabelecimento: string
  precoBase: number
  numeroQuarto?: string
  status: string
}

// Adicione a interface para Adicional
interface Adicional {
  id: string
  nome: string
  descricao: string
  preco: number
}

export function NovaReservaModal({ isOpen, onClose, data }: NovaReservaModalProps) {
  const [checkIn, setCheckIn] = useState<Date | undefined>(data)
  const [checkOut, setCheckOut] = useState<Date | undefined>(addDays(data, 1))
  const [estabelecimentos, setEstabelecimentos] = useState<Estabelecimento[]>([])
  const [acomodacoes, setAcomodacoes] = useState<Acomodacao[]>([])
  const [filteredAcomodacoes, setFilteredAcomodacoes] = useState<Acomodacao[]>([])
  const [selectedEstabelecimento, setSelectedEstabelecimento] = useState<string>("")
  const [selectedAcomodacao, setSelectedAcomodacao] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  // Adicione adicionaisSelecionados ao estado do componente
  const [adicionaisSelecionados, setAdicionaisSelecionados] = useState<string[]>([])
  const [adicionaisDisponiveis, setAdicionaisDisponiveis] = useState<Adicional[]>([])

  // Adicione a função para buscar adicionais
  const fetchAdicionais = async () => {
    try {
      const data = await api.getAll<Adicional[]>("/api/addons")
      setAdicionaisDisponiveis(data)
    } catch (error) {
      console.error("Erro ao buscar adicionais:", error)
      // Dados de fallback em caso de erro
      setAdicionaisDisponiveis([
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
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Buscar estabelecimentos da API
        const estabelecimentosData = await api.getAll<Estabelecimento[]>("/api/estabelecimentos")
        setEstabelecimentos(estabelecimentosData)

        // Buscar acomodações da API
        const acomodacoesData = await api.getAll<Acomodacao[]>("/api/acomodacoes")
        setAcomodacoes(acomodacoesData)

        setIsLoading(false)
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        setIsLoading(false)

        // Dados de fallback em caso de erro
        setEstabelecimentos([
          { id: "1", nome: "Pousada Central" },
          { id: "2", nome: "Pousada Montanha" },
          { id: "3", nome: "Pousada Praia" },
        ])

        setAcomodacoes([
          {
            id: "1",
            nome: "Suíte Master",
            tipo: "suite",
            capacidade: 2,
            status: "livre",
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
        ])
      }
    }

    if (isOpen) {
      fetchData()
      fetchAdicionais()
    }
  }, [isOpen])

  // Filtrar acomodações com base no estabelecimento selecionado
  useEffect(() => {
    if (selectedEstabelecimento) {
      const filtered = acomodacoes.filter(
        (acomodacao) => acomodacao.estabelecimento === selectedEstabelecimento && acomodacao.status === "livre",
      )
      setFilteredAcomodacoes(filtered)
    } else {
      setFilteredAcomodacoes([])
    }
  }, [selectedEstabelecimento, acomodacoes])

  const handleEstabelecimentoChange = (value: string) => {
    setSelectedEstabelecimento(value)
    setSelectedAcomodacao("")
  }

  // Adicione a função para alternar a seleção de adicionais
  const toggleAdicional = (id: string) => {
    setAdicionaisSelecionados((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Coletar dados do formulário
    const formElement = e.target as HTMLFormElement
    const formData = new FormData(formElement)

    const clienteNome = formData.get("nome") as string
    const clienteTelefone = formData.get("telefone") as string
    const clienteEmail = formData.get("email") as string
    const observacoes = formData.get("observacoes") as string
    const acomodacaoId = selectedAcomodacao
    const estabelecimentoId = selectedEstabelecimento

    if (
      !clienteNome ||
      !clienteTelefone ||
      !clienteEmail ||
      !acomodacaoId ||
      !estabelecimentoId ||
      !checkIn ||
      !checkOut
    ) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    // Dentro da função handleSubmit, antes do try/catch, adicione:
    const reservationData = {
      clienteId: "", // The client ID will be set later
      acomodacaoId,
      estabelecimentoId,
      dataCheckIn: checkIn.toISOString(),
      dataCheckOut: checkOut.toISOString(),
      numeroPessoas: acomodacoes.find((a) => a.id === acomodacaoId)?.capacidade || 1,
      status: "CONFIRMADA",
      observacoes,
      adicionais: adicionaisSelecionados.map((id) => ({ addonId: id })),
    }

    try {
      // Primeiro, verificar se o cliente já existe ou criar um novo
      let clienteId
      const clientesResponse = await fetch(`/api/clientes?search=${encodeURIComponent(clienteEmail)}`)
      const clientesData = await clientesResponse.json()

      if (clientesData.length > 0) {
        // Cliente já existe
        clienteId = clientesData[0].id
      } else {
        // Criar novo cliente
        const novoClienteResponse = await fetch("/api/clientes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: clienteNome,
            email: clienteEmail,
            telefone: clienteTelefone,
          }),
        })

        if (!novoClienteResponse.ok) {
          throw new Error("Falha ao criar cliente")
        }

        const novoCliente = await novoClienteResponse.json()
        clienteId = novoCliente.id
      }

      // Criar a reserva
      const reservaResponse = await fetch("/api/reservas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...reservationData,
          clienteId,
        }),
      })

      if (!reservaResponse.ok) {
        throw new Error("Falha ao criar reserva")
      }

      alert("Reserva criada com sucesso!")
      onClose()
    } catch (error) {
      console.error("Erro ao criar reserva:", error)
      alert("Ocorreu um erro ao criar a reserva. Por favor, tente novamente.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Reserva</DialogTitle>
          <DialogDescription>Preencha os dados para criar uma nova reserva.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="checkIn">Check-in</Label>
                <DatePicker date={checkIn} setDate={setCheckIn} />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="checkOut">Check-out</Label>
                <DatePicker date={checkOut} setDate={setCheckOut} />
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="estabelecimento">Estabelecimento</Label>
              <Select value={selectedEstabelecimento} onValueChange={handleEstabelecimentoChange}>
                <SelectTrigger id="estabelecimento">
                  <SelectValue placeholder="Selecione um estabelecimento" />
                </SelectTrigger>
                <SelectContent>
                  {estabelecimentos.map((estabelecimento) => (
                    <SelectItem key={estabelecimento.id} value={estabelecimento.nome}>
                      {estabelecimento.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="acomodacao">Acomodação</Label>
              <Select
                value={selectedAcomodacao}
                onValueChange={setSelectedAcomodacao}
                disabled={!selectedEstabelecimento || filteredAcomodacoes.length === 0}
              >
                <SelectTrigger id="acomodacao">
                  <SelectValue
                    placeholder={
                      !selectedEstabelecimento
                        ? "Selecione um estabelecimento primeiro"
                        : filteredAcomodacoes.length === 0
                          ? "Nenhuma acomodação disponível"
                          : "Selecione uma acomodação"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredAcomodacoes.map((acomodacao) => (
                    <SelectItem key={acomodacao.id} value={acomodacao.id}>
                      {acomodacao.nome} - {acomodacao.numeroQuarto} (Capacidade: {acomodacao.capacidade})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="nome">Nome do Hóspede</Label>
                <Input id="nome" name="nome" placeholder="Nome completo" />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" name="telefone" placeholder="(00) 00000-0000" />
              </div>
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" name="email" placeholder="email@exemplo.com" />
            </div>

            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" name="observacoes" placeholder="Informações adicionais sobre a reserva" />
            </div>
          </div>
          {/* Adicione a seção de adicionais no formulário, antes do DialogFooter */}
          {/* Adicione após a seção de datas ou onde for mais apropriado: */}
          <div className="grid gap-2 mt-4">
            <Label>Adicionais</Label>
            <div className="grid gap-2">
              {adicionaisDisponiveis.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum adicional disponível</p>
              ) : (
                adicionaisDisponiveis.map((adicional) => (
                  <div key={adicional.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`adicional-${adicional.id}`}
                      checked={adicionaisSelecionados.includes(adicional.id)}
                      onCheckedChange={() => toggleAdicional(adicional.id)}
                    />
                    <Label htmlFor={`adicional-${adicional.id}`} className="flex justify-between w-full">
                      <span>{adicional.nome}</span>
                      <span className="text-muted-foreground">{formatCurrency(adicional.preco)}</span>
                    </Label>
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Criar Reserva</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

