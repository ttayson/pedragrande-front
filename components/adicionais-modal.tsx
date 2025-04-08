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
import { Textarea } from "@/components/ui/textarea"

interface Adicional {
  id: string
  nome: string
  descricao: string
  preco: number
}

interface AdicionaisModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Omit<Adicional, "id">) => void
  adicional: Adicional | null
}

export function AdicionaisModal({ isOpen, onClose, onSave, adicional }: AdicionaisModalProps) {
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [preco, setPreco] = useState("")

  useEffect(() => {
    if (adicional) {
      setNome(adicional.nome)
      setDescricao(adicional.descricao)
      setPreco(adicional.preco.toString())
    } else {
      setNome("")
      setDescricao("")
      setPreco("")
    }
  }, [adicional])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome || !preco) {
      alert("Por favor, preencha todos os campos obrigatórios")
      return
    }

    const precoNumerico = Number.parseFloat(preco.replace(",", "."))

    if (isNaN(precoNumerico) || precoNumerico < 0) {
      alert("Por favor, informe um preço válido")
      return
    }

    onSave({
      nome,
      descricao,
      preco: precoNumerico,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{adicional ? "Editar Adicional" : "Novo Adicional"}</DialogTitle>
          <DialogDescription>
            {adicional ? "Edite as informações do adicional." : "Preencha os dados para criar um novo adicional."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome do adicional"
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descrição do adicional"
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="preco">Preço *</Label>
              <Input
                id="preco"
                type="text"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{adicional ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

