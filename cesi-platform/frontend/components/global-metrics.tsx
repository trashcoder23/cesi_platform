import { RankingCity } from '@/lib/api'

interface Props {
  data: RankingCity[]
}

export function GlobalMetrics({ data }: Props) {
  const total = data.length
  const critical = data.filter(c => c.risk_level === 'Critical').length
  const warning = data.filter(c => c.risk_level === 'Warning').length
  const stable = data.filter(c => c.risk_level === 'Stable').length
  const avgCesi =
    data.reduce((sum, c) => sum + c.cesi, 0) / (data.length || 1)

  const cards = [
    { label: 'Total Cities', value: total },
    { label: 'Critical Risk', value: critical },
    { label: 'Warning Risk', value: warning },
    { label: 'Stable Cities', value: stable },
    { label: 'Avg CESI', value: avgCesi.toFixed(2) },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-card border border-border rounded-lg p-4 text-center transition hover:scale-105"
        >
          <p className="text-sm text-muted-foreground">{card.label}</p>
          <p className="text-2xl font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  )
}