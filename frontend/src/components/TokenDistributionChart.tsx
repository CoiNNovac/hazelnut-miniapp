import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import type { TokenDistribution } from '@/types';

interface TokenDistributionChartProps {
  distribution: TokenDistribution[];
}

export default function TokenDistributionChart({ distribution }: TokenDistributionChartProps) {
  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={distribution}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.value}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {distribution.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(_value, entry: any) => (
              <span className="text-sm text-white/80">
                {entry.payload.label}: {entry.payload.value}%
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
