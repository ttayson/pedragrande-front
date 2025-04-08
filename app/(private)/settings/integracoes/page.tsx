"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { CreditCard, Mail, MessageSquare, Globe } from "lucide-react"

export default function IntegracoesPage() {
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    // Simulate saving
    setTimeout(() => {
      setSaving(false)
    }, 1000)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Integrações</h1>
        <p className="text-muted-foreground">Configure integrações com serviços externos</p>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Integração de Pagamento
              </CardTitle>
              <CardDescription>Conecte-se a gateways de pagamento</CardDescription>
            </div>
            <Switch id="payment-integration" defaultChecked />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment-api-key">Chave de API</Label>
              <Input id="payment-api-key" type="password" value="••••••••••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-secret">Chave Secreta</Label>
              <Input id="payment-secret" type="password" value="••••••••••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-webhook">URL de Webhook</Label>
              <Input id="payment-webhook" value="https://sambo.com/api/webhooks/payment" />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Integração de Email
              </CardTitle>
              <CardDescription>Configure o serviço de envio de emails</CardDescription>
            </div>
            <Switch id="email-integration" defaultChecked />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-server">Servidor SMTP</Label>
              <Input id="smtp-server" value="smtp.example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port">Porta</Label>
              <Input id="smtp-port" value="587" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-username">Usuário</Label>
              <Input id="smtp-username" value="notifications@sambo.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-password">Senha</Label>
              <Input id="smtp-password" type="password" value="••••••••••••••••" />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Integração de SMS
              </CardTitle>
              <CardDescription>Configure o serviço de envio de SMS</CardDescription>
            </div>
            <Switch id="sms-integration" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sms-api-key">Chave de API</Label>
              <Input id="sms-api-key" placeholder="Insira sua chave de API" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sms-sender-id">ID do Remetente</Label>
              <Input id="sms-sender-id" placeholder="Sambo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sms-webhook">URL de Webhook</Label>
              <Input id="sms-webhook" placeholder="https://sambo.com/api/webhooks/sms" />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Integração com OTAs
              </CardTitle>
              <CardDescription>Conecte-se a agências de viagens online</CardDescription>
            </div>
            <Switch id="ota-integration" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="booking-api-key">Booking.com API Key</Label>
              <Input id="booking-api-key" placeholder="Insira sua chave de API" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="airbnb-api-key">Airbnb API Key</Label>
              <Input id="airbnb-api-key" placeholder="Insira sua chave de API" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expedia-api-key">Expedia API Key</Label>
              <Input id="expedia-api-key" placeholder="Insira sua chave de API" />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

