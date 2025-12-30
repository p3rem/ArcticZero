import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmissionChart } from "@/components/dashboard/EmissionChart";
import { CategoryPieChart } from "@/components/dashboard/CategoryPieChart";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { Zap, Car, Trash2, Activity } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { emissions } from "@/lib/api";


export default function Dashboard() {
  const [year, setYear] = useState("2024");

  const { data: summaryData, isLoading } = useQuery({
    queryKey: ["emissions-summary", year],
    queryFn: async () => {
      const res = await emissions.getSummary({ year });
      return res.data;
    },
  });

  const kpi = summaryData || { totalEmissions: 0, totalEmissionsChange: 0, byCategory: [] };

  // Helper to find category total safely
  const getCatTotal = (cat: string) => {
    const found = kpi.byCategory?.find((c: any) => c.category === cat);
    return {
      value: found ? Number(found.total) : 0,
      change: found ? Number(found.change) : 0
    };
  };

  const elec = getCatTotal('electricity');
  const trans = getCatTotal('transport');
  const waste = getCatTotal('waste');

  if (isLoading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
            <p className="text-muted-foreground">Track and analyze your carbon footprint</p>
          </div>
          <div className="flex gap-3">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total CO₂ Emissions"
            value={Number(kpi.totalEmissions)}
            icon={<Activity className="h-6 w-6" />}
            change={Number(kpi.totalEmissionsChange)}
            delay={0}
          />
          <StatCard
            title="Electricity Emissions"
            value={elec.value}
            icon={<Zap className="h-6 w-6" />}
            change={elec.change}
            delay={100}
          />
          <StatCard
            title="Transport Emissions"
            value={trans.value}
            icon={<Car className="h-6 w-6" />}
            change={trans.change}
            delay={200}
          />
          <StatCard
            title="Waste Emissions"
            value={waste.value}
            icon={<Trash2 className="h-6 w-6" />}
            change={waste.change}
            delay={300}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="lg:col-span-2">
              <EmissionChart data={kpi.byMonth?.map((m: any) => ({
                month: m.month,
                total: Number(m.total),
                electricity: Number(m.electricity),
                transport: Number(m.transport),
                waste: Number(m.waste)
              })) || []} />
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-6">
              <CategoryPieChart data={kpi.byCategory?.map((c: any) => ({
                name: c.category.charAt(0).toUpperCase() + c.category.slice(1),
                value: Number(c.total),
                color: c.category === 'electricity' ? 'hsl(158, 64%, 32%)' :
                  c.category === 'transport' ? 'hsl(200, 65%, 45%)' :
                    c.category === 'waste' ? 'hsl(174, 60%, 45%)' : 'hsl(0, 0%, 50%)'
              }))} />
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <ProgressRing
            progress={Math.min(Math.round((Number(kpi.totalEmissions) / 25000) * 100), 100)}
            target={25000}
            current={Number(kpi.totalEmissions)}
          />
          <div className="glass-card rounded-xl p-6 md:col-span-1 lg:col-span-2 opacity-0 animate-fade-in" style={{ animationDelay: "600ms" }}>
            <h3 className="text-lg font-semibold mb-4">Quick Insights</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-success/10 p-4">
                <p className="text-sm font-medium text-success">Status</p>
                <p className="mt-1 text-lg font-semibold">Tracking Active</p>
                <p className="mt-1 text-xs text-muted-foreground">Data is being recorded in real-time.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
