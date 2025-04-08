"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function DashboardChart() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-[350px] w-full bg-muted/20 rounded-md">
        <p className="text-muted-foreground">Carregando gráfico...</p>
      </div>
    )
  }

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `R$${value}`}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Tooltip
            formatter={(value) => [`R$${value}`, "Valor"]}
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              borderColor: "hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const data = [
  {
    name: "Jan",
    total: 45000,
  },
  {
    name: "Fev",
    total: 63500,
  },
  {
    name: "Mar",
    total: 58200,
  },
  {
    name: "Abr",
    total: 72800,
  },
  {
    name: "Mai",
    total: 85600,
  },
  {
    name: "Jun",
    total: 92400,
  },
  {
    name: "Jul",
    total: 105200,
  },
  {
    name: "Ago",
    total: 91000,
  },
  {
    name: "Set",
    total: 97500,
  },
  {
    name: "Out",
    total: 110800,
  },
  {
    name: "Nov",
    total: 142500,
  },
  {
    name: "Dez",
    total: 168000,
  },
]

