import { ModelImportance } from '@/lib/api';

interface ImportanceChartProps {
  data: ModelImportance[];
}

export function ImportanceChart({ data }: ImportanceChartProps) {
  const maxImportance = Math.max(...data.map(d => d.importance), 1);

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.feature} className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">{item.feature}</span>
            <span className="text-xs text-muted-foreground">{(item.importance * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-500"
              style={{ width: `${(item.importance / maxImportance) * 100}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}
