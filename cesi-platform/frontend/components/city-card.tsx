import Link from 'next/link'

interface CityCardProps {
  name: string
  score: number
  riskLevel?: string
  highlighted?: boolean
  href: string
}

export function CityCard({
  name,
  score,
  riskLevel,
  highlighted,
  href,
}: CityCardProps) {
  return (
    <Link href={href}>
      <div
        className={`bg-card border border-border rounded-lg p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg
        ${highlighted ? 'ring-2 ring-primary scale-105' : ''}`}
      >
        <h3 className="text-lg font-bold mb-2">{name}</h3>
        <p className="text-muted-foreground text-sm mb-2">
          CESI Score
        </p>
        <p className="text-2xl font-bold">{score}</p>

        {riskLevel && (
          <p className="mt-3 text-sm font-medium">
            Risk: {riskLevel}
          </p>
        )}
      </div>
    </Link>
  )
}