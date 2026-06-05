import { Bar, BarChart, CartesianGrid, XAxis, Legend, Line, LineChart, ResponsiveContainer, YAxis, Tooltip } from "recharts";
import { Download, TrendingUp, Clock, CheckCircle2, AlertCircle, Loader2, MousePointer2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useStore, Delivery, AnalyticsEvent } from "@/lib/store";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export function BusinessAnalytics() {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const { deliveries, events, loading } = useStore();

  // Derived Stats
  const total = deliveries.length;
  const successful = deliveries.filter(d => d.status === "delivered");
  const failed = deliveries.filter(d => d.status === "failed");
  const successRate = total > 0 ? ((successful.length / total) * 100).toFixed(1) : "0";
  
  const avgTime = successful.length > 0 
    ? (successful.reduce((acc, d) => acc + (d.endTime! - d.startTime), 0) / successful.length / 60000).toFixed(0) 
    : "0";

  // Reach Stats
  const searchCount = events.filter(e => e.type === "search").length;
  const clickCount = events.filter(e => e.type === "click").length;

  // Group Reach by Day
  const reachByDay = events.reduce((acc, e) => {
    const day = new Date(e.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (!acc[day]) acc[day] = { day, searches: 0, clicks: 0 };
    if (e.type === "search") acc[day].searches++;
    if (e.type === "click") acc[day].clicks++;
    return acc;
  }, {} as Record<string, { day: string, searches: number, clicks: number }>);

  const reachData = Object.values(reachByDay).sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime());

  // Group by Driver
  const driverStats = deliveries.reduce((acc, d) => {
    const id = d.driverId;
    if (!acc[id]) acc[id] = { name: id === 'anonymous_driver' ? t("Anonymous", "Anonyme") : t("Agent", "Livreur") + " " + id.slice(0,4), total: 0, success: 0, time: 0 };
    acc[id].total++;
    if (d.status === "delivered") {
      acc[id].success++;
      acc[id].time += (d.endTime! - d.startTime);
    }
    return acc;
  }, {} as any);

  const drivers = Object.values(driverStats).map((d: any) => ({
    name: d.name,
    totalDeliveries: d.total,
    successRate: ((d.success / d.total) * 100).toFixed(0),
    avgTime: d.success > 0 ? (d.time / d.success / 60000).toFixed(0) : "0"
  }));

  const exportReport = () => {
    const headers = ["Driver Name", "Success Rate (%)", "Avg Time (min)", "Total Deliveries"];
    const rows = drivers.map(d => [d.name, d.successRate, d.avgTime, d.totalDeliveries]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pinpoint_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const chartConfig = {
    success: { label: t("Successful", "Réussies"), color: "var(--primary)" },
    failed: { label: t("Failed", "Échouées"), color: "var(--destructive)" },
    searches: { label: t("Searches", "Recherches"), color: "var(--primary)" },
    clicks: { label: t("Clicks", "Clics"), color: "var(--accent)" },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-semibold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            {t("Business Performance", "Performance Business")}
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            {t("Monitor your delivery operations and reach metrics.", "Suivez vos opérations de livraison et vos métriques de portée.")}
          </p>
        </div>
        <Button onClick={exportReport} variant="outline" className="rounded-full shadow-sm">
          <Download className="w-4 h-4 mr-2" />
          {t("Export Report", "Exporter le rapport")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title={t("Success Rate", "Taux de réussite")} value={`${successRate}%`} change="" trend="up" icon={CheckCircle2} />
        <MetricCard title={t("Total Reach", "Portée totale")} value={(searchCount + clickCount).toString()} change="" trend="up" icon={MousePointer2} />
        <MetricCard title={t("Total Deliveries", "Livraisons totales")} value={total.toString()} change="" trend="up" icon={TrendingUp} />
        <MetricCard title={t("Failed Deliveries", "Échecs")} value={failed.length.toString()} change="" trend="up" icon={AlertCircle} />
      </div>

      {/* Reach Analytics Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-3xl overflow-hidden border-border bg-card/50">
          <CardHeader>
            <CardTitle>{t("Customer Reach", "Portée client")}</CardTitle>
            <CardDescription>{t("Visibility and clicks over time.", "Visibilité et clics au fil du temps.")}</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <LineChart data={reachData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="searches" name={t("Searches", "Recherches")} stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="clicks" name={t("Clicks", "Clics")} stroke="var(--accent)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid grid-rows-2 gap-4">
          <Card className="rounded-3xl border-border bg-card/50 flex flex-col justify-center p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold">{searchCount}</p>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{t("Total searches", "Recherches totales")}</p>
              </div>
            </div>
          </Card>
          <Card className="rounded-3xl border-border bg-card/50 flex flex-col justify-center p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                <MousePointer2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold">{clickCount}</p>
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{t("Total clicks", "Clics totaux")}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-3xl overflow-hidden border-border bg-card/50">
          <CardHeader>
            <CardTitle>{t("Driver Comparison", "Comparaison des livreurs")}</CardTitle>
            <CardDescription>{t("Efficiency rankings based on success rate.", "Classement d'efficacité basé sur le taux de réussite.")}</CardDescription>
          </CardHeader>
          <CardContent className="px-2">
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={drivers}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="successRate" name={t("Success Rate %", "Taux de réussite %")} fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border bg-card/50">
          <CardHeader>
            <CardTitle>{t("Driver Performance", "Performance des livreurs")}</CardTitle>
            <CardDescription>{t("Efficiency metrics per driver.", "Métriques d'efficacité par livreur.")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {drivers.sort((a,b) => parseInt(b.successRate) - parseInt(a.successRate)).map((driver) => (
                <div key={driver.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                      {driver.name.slice(0,2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{driver.name}</p>
                      <p className="text-[10px] text-muted-foreground">{driver.totalDeliveries} {t("deliveries", "livraisons")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{driver.successRate}%</p>
                    <p className="text-[10px] text-muted-foreground">{driver.avgTime} min avg</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, trend, icon: Icon }: { title: string; value: string; change: string; trend: 'up' | 'down'; icon: any }) {
  return (
    <Card className="rounded-2xl border-border bg-card/50 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Icon className="w-5 h-5" />
          </div>
          <span className={`text-xs font-bold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {change}
          </span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-semibold">{title}</p>
      </CardContent>
    </Card>
  );
}
