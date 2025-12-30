import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { emissions } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from "recharts";
import { TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function Comparison() {
  const { data: comparisonData, isLoading } = useQuery({
    queryKey: ["emissions-comparison"],
    queryFn: async () => {
      const res = await emissions.getComparison();
      return res.data;
    },
  });

  if (isLoading) return <div className="p-8">Loading comparison data...</div>;

  const { yearly = [], monthly = [] } = comparisonData || {};

  // Calculate simple trend (This year total vs Last year total based on monthly sums)
  const thisYearTotal = monthly.reduce((acc: number, curr: any) => acc + curr.thisYear, 0);
  const lastYearTotal = monthly.reduce((acc: number, curr: any) => acc + curr.lastYear, 0);
  const trendPercentage = lastYearTotal > 0
    ? ((thisYearTotal - lastYearTotal) / lastYearTotal) * 100
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Comparison & Trends</h1>
            <p className="text-muted-foreground">Analyze historical emission data and trends</p>
          </div>
        </div>

        {/* High Level Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Year-over-Year Trend</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trendPercentage > 0 ? "+" : ""}{trendPercentage.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Compared to last year
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Year So Far</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{thisYearTotal.toLocaleString()} kg</div>
              <p className="text-xs text-muted-foreground">
                Total CO₂e emissions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Yearly Comparison Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Total Emissions by Year</CardTitle>
              <CardDescription>Historical annual overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={yearly}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${Number(value).toLocaleString()} kg`, "Emissions"]}
                      contentStyle={{ borderRadius: '8px' }}
                    />
                    <Bar dataKey="total" fill="hsl(158, 64%, 32%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trend Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>This Year vs Last Year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `${Number(value).toLocaleString()} kg`}
                      contentStyle={{ borderRadius: '8px' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="thisYear"
                      name={`${new Date().getFullYear()} (Current)`}
                      stroke="hsl(158, 64%, 32%)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="lastYear"
                      name={`${new Date().getFullYear() - 1} (Previous)`}
                      stroke="hsl(200, 65%, 45%)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
