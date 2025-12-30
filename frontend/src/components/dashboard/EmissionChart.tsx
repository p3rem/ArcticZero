import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface EmissionChartProps {
  data?: any[];
}

export function EmissionChart({ data = [] }: EmissionChartProps) {
  // If no data, show placeholder or empty state
  const chartData = data.length > 0 ? data : [{ month: 'No Data', electricity: 0, transport: 0, waste: 0 }];

  return (
    <div className="glass-card rounded-xl p-6 opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Emissions Over Time</h3>
        <p className="text-sm text-muted-foreground">Monthly carbon footprint breakdown</p>
      </div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="electricityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(158, 64%, 32%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(158, 64%, 32%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="transportGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(200, 65%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(200, 65%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(160, 20%, 88%)" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(160, 10%, 45%)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(160, 10%, 45%)", fontSize: 12 }}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(160, 20%, 88%)",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px hsla(160, 30%, 10%, 0.08)",
              }}
              labelStyle={{ fontWeight: 600, color: "hsl(160, 30%, 10%)" }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="circle"
              formatter={(value) => <span className="text-sm text-muted-foreground capitalize">{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="electricity"
              stroke="hsl(158, 64%, 32%)"
              strokeWidth={3}
              dot={{ fill: "hsl(158, 64%, 32%)", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: "hsl(158, 64%, 32%)", strokeWidth: 2, fill: "white" }}
            />
            <Line
              type="monotone"
              dataKey="transport"
              stroke="hsl(200, 65%, 45%)"
              strokeWidth={3}
              dot={{ fill: "hsl(200, 65%, 45%)", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: "hsl(200, 65%, 45%)", strokeWidth: 2, fill: "white" }}
            />
            <Line
              type="monotone"
              dataKey="waste"
              stroke="hsl(174, 60%, 45%)"
              strokeWidth={3}
              dot={{ fill: "hsl(174, 60%, 45%)", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: "hsl(174, 60%, 45%)", strokeWidth: 2, fill: "white" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
