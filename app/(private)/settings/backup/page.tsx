"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Download, Upload } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BackupPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleBackup = () => {
    setIsLoading(true)
    // Simulate backup process
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Backup e Restauração</h1>
        <p className="text-muted-foreground">Gerencie backups do sistema e restaure dados quando necessário</p>
      </div>

      <Tabs defaultValue="backup" className="space-y-4">
        <TabsList>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="restore">Restauração</TabsTrigger>
          <TabsTrigger value="schedule">Agendamento</TabsTrigger>
        </TabsList>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup Manual</CardTitle>
              <CardDescription>Crie um backup completo do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backup-name">Nome do Backup</Label>
                  <Input id="backup-name" defaultValue={`backup_${new Date().toISOString().split("T")[0]}`} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backup-type">Tipo de Backup</Label>
                  <Select defaultValue="full">
                    <SelectTrigger id="backup-type">
                      <SelectValue placeholder="Selecione o tipo de backup" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Completo</SelectItem>
                      <SelectItem value="data">Apenas Dados</SelectItem>
                      <SelectItem value="config">Apenas Configurações</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Incluir no Backup</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="include-reservations" defaultChecked />
                    <Label htmlFor="include-reservations">Reservas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="include-clients" defaultChecked />
                    <Label htmlFor="include-clients">Clientes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="include-payments" defaultChecked />
                    <Label htmlFor="include-payments">Pagamentos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="include-settings" defaultChecked />
                    <Label htmlFor="include-settings">Configurações</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleBackup} disabled={isLoading} className="gap-2">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isLoading ? "Criando Backup..." : "Criar Backup"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Backups Recentes</CardTitle>
              <CardDescription>Lista dos últimos backups realizados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backups.map((backup, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <div className="font-medium">{backup.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {backup.date} • {backup.size} • {backup.type}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        Restaurar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restore">
          <Card>
            <CardHeader>
              <CardTitle>Restaurar Backup</CardTitle>
              <CardDescription>Restaure o sistema a partir de um backup existente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="backup-file">Arquivo de Backup</Label>
                <Input id="backup-file" type="file" />
              </div>

              <div className="rounded-md bg-amber-50 p-4 dark:bg-amber-950">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-amber-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">Atenção</h3>
                    <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                      <p>
                        A restauração de um backup substituirá todos os dados atuais. Esta ação não pode ser desfeita.
                        Certifique-se de criar um backup dos dados atuais antes de prosseguir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="destructive" className="gap-2">
                <Upload className="h-4 w-4" />
                Restaurar Sistema
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Backup Automático</CardTitle>
              <CardDescription>Configure backups automáticos periódicos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="auto-backup" defaultChecked />
                <Label htmlFor="auto-backup">Habilitar backup automático</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Frequência</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger id="backup-frequency">
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="backup-time">Horário</Label>
                  <Select defaultValue="02:00">
                    <SelectTrigger id="backup-time">
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="00:00">00:00</SelectItem>
                      <SelectItem value="02:00">02:00</SelectItem>
                      <SelectItem value="04:00">04:00</SelectItem>
                      <SelectItem value="22:00">22:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retention-period">Período de Retenção</Label>
                <Select defaultValue="30">
                  <SelectTrigger id="retention-period">
                    <SelectValue placeholder="Selecione o período de retenção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="14">14 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                    <SelectItem value="365">1 ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage-location">Local de Armazenamento</Label>
                <Select defaultValue="cloud">
                  <SelectTrigger id="storage-location">
                    <SelectValue placeholder="Selecione o local de armazenamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Servidor Local</SelectItem>
                    <SelectItem value="cloud">Nuvem (AWS S3)</SelectItem>
                    <SelectItem value="google">Google Drive</SelectItem>
                    <SelectItem value="dropbox">Dropbox</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Salvar Configurações</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Mock data for recent backups
const backups = [
  {
    name: "backup_2025-03-24_full",
    date: "24/03/2025 02:00",
    size: "45.2 MB",
    type: "Completo",
  },
  {
    name: "backup_2025-03-23_full",
    date: "23/03/2025 02:00",
    size: "44.8 MB",
    type: "Completo",
  },
  {
    name: "backup_2025-03-22_full",
    date: "22/03/2025 02:00",
    size: "44.5 MB",
    type: "Completo",
  },
  {
    name: "backup_2025-03-21_full",
    date: "21/03/2025 02:00",
    size: "43.9 MB",
    type: "Completo",
  },
  {
    name: "backup_2025-03-20_full",
    date: "20/03/2025 02:00",
    size: "43.7 MB",
    type: "Completo",
  },
]

// Missing components
function Loader2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

function AlertTriangle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

