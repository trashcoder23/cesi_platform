interface RiskBadgeProps {
  label: string;
}

export function RiskBadge({ label }: RiskBadgeProps) {
  function getColor(level: string) {
    switch (level.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-300";
      case "warning":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "stable":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  }

  return (
    <span
      className={`px-4 py-1 rounded-full text-sm font-semibold border ${getColor(
        label
      )}`}
    >
      {label}
    </span>
  );
}