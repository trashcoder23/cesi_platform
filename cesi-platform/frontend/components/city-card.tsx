import Link from "next/link";

interface CityCardProps {
  name: string;
  score: number;
  href: string;
  riskLevel?: string;
}

export function CityCard({ name, score, href, riskLevel }: CityCardProps) {
  function getRiskColor(level?: string) {
    if (!level) return "bg-gray-200 text-gray-800";

    switch (level.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-700";
      case "warning":
        return "bg-orange-100 text-orange-700";
      case "stable":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-200 text-gray-800";
    }
  }

  return (
    <Link href={href}>
      <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition cursor-pointer">
        <h3 className="text-xl font-bold mb-2">{name}</h3>

        <p className="text-muted-foreground text-sm mb-4">
          CESI Score
        </p>

        <p className="text-3xl font-bold text-accent mb-4">
          {score.toFixed(2)}
        </p>

        {riskLevel && (
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(
              riskLevel
            )}`}
          >
            {riskLevel}
          </span>
        )}
      </div>
    </Link>
  );
}