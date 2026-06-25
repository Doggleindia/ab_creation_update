"use client";

interface Stat {
  label: string;
  value: number;
}

interface StatsCardsProps {
  stats: Stat[];
  loading?: boolean;
}

export default function StatsCards({ stats, loading = false }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white p-4 rounded-lg shadow-sm"
        >
          <p className="text-sm text-muted-foreground">
            {s.label}
          </p>
          <p className="text-xl font-semibold">
            {loading ? (
              <span className="animate-pulse bg-gray-300 h-6 w-12 rounded inline-block"></span>
            ) : (
              s.value
            )}
          </p>
        </div>
      ))}
    </div>
  )
}
