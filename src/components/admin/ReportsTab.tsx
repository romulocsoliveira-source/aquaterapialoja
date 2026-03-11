import { useMemo, useState } from "react";
import { useProducts } from "@/hooks/useStoreData";
import { useFinancialTransactions } from "@/hooks/useFinancial";
import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  DollarSign, TrendingUp, Package, AlertTriangle, ArrowUpCircle, ArrowDownCircle,
} from "lucide-react";

const COLORS = [
  "hsl(280, 80%, 60%)", "hsl(330, 80%, 60%)", "hsl(45, 90%, 55%)",
  "hsl(200, 80%, 55%)", "hsl(150, 70%, 50%)", "hsl(10, 80%, 55%)",
];

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Period = "7d" | "30d" | "90d";

export default function ReportsTab() {
  const { data: products = [] } = useProducts();
  const { data: transactions = [] } = useFinancialTransactions();
  const [period, setPeriod] = useState<Period>("30d");

  const periodDays = period === "7d" ? 7 : period === "30d" ? 30 : 90;

  const filteredTx = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - periodDays);
    return transactions.filter(t => new Date(t.created_at) >= cutoff);
  }, [transactions, periodDays]);

  // KPIs
  const kpis = useMemo(() => {
    const income = filteredTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = filteredTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const profit = income - expense;
    const margin = income > 0 ? (profit / income) * 100 : 0;
    const totalStockValue = products.reduce((s, p) => s + (p.costPrice || 0) * (p.stock || 0), 0);
    const lowStockCount = products.filter(p => (p.stock || 0) < 10).length;

    return { income, expense, profit, margin, totalStockValue, lowStockCount };
  }, [filteredTx, products]);

  // Daily revenue chart
  const dailyRevenue = useMemo(() => {
    const map: Record<string, { date: string; receita: number; despesa: number }> = {};
    const now = new Date();
    for (let i = periodDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      map[key] = { date: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), receita: 0, despesa: 0 };
    }
    filteredTx.forEach(tx => {
      const key = new Date(tx.created_at).toISOString().split("T")[0];
      if (map[key]) {
        if (tx.type === "income") map[key].receita += tx.amount;
        if (tx.type === "expense") map[key].despesa += tx.amount;
      }
    });
    // For 90d show weekly aggregates
    const entries = Object.values(map);
    if (period === "90d") {
      const weekly: typeof entries = [];
      for (let i = 0; i < entries.length; i += 7) {
        const chunk = entries.slice(i, i + 7);
        weekly.push({
          date: chunk[0].date,
          receita: chunk.reduce((s, c) => s + c.receita, 0),
          despesa: chunk.reduce((s, c) => s + c.despesa, 0),
        });
      }
      return weekly;
    }
    return entries;
  }, [filteredTx, periodDays, period]);

  // Revenue by category (pie)
  const categoryRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTx.filter(t => t.type === "income").forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredTx]);

  // Top products by stock value
  const topProducts = useMemo(() => {
    return [...products]
      .map(p => ({
        name: p.name.length > 20 ? p.name.slice(0, 20) + "…" : p.name,
        valor: (p.promoPrice || p.price) * (p.stock || 0),
        margem: p.costPrice && p.costPrice > 0
          ? Math.round((1 - p.costPrice / (p.promoPrice || p.price)) * 100)
          : 0,
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 8);
  }, [products]);

  // Low stock products
  const lowStock = useMemo(() => {
    return [...products]
      .filter(p => (p.stock || 0) < 15)
      .sort((a, b) => (a.stock || 0) - (b.stock || 0))
      .slice(0, 8);
  }, [products]);

  // Expense breakdown (pie)
  const expenseBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredTx.filter(t => t.type === "expense").forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [filteredTx]);

  const stats = [
    { label: "Receita Total", value: formatCurrency(kpis.income), icon: ArrowUpCircle, color: "text-green-400" },
    { label: "Despesas Totais", value: formatCurrency(kpis.expense), icon: ArrowDownCircle, color: "text-red-400" },
    { label: "Lucro Líquido", value: formatCurrency(kpis.profit), icon: DollarSign, color: kpis.profit >= 0 ? "text-green-400" : "text-red-400" },
    { label: "Margem de Lucro", value: `${kpis.margin.toFixed(1)}%`, icon: TrendingUp, color: "text-accent" },
    { label: "Valor em Estoque", value: formatCurrency(kpis.totalStockValue), icon: Package, color: "text-blue-400" },
    { label: "Estoque Baixo", value: String(kpis.lowStockCount), icon: AlertTriangle, color: kpis.lowStockCount > 0 ? "text-red-400" : "text-green-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex gap-2">
        {([["7d", "7 dias"], ["30d", "30 dias"], ["90d", "90 dias"]] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setPeriod(key)}
            className={`px-4 py-1.5 rounded-lg text-xs font-body transition-colors ${
              period === key ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="bg-card border border-border rounded-xl p-4">
            <s.icon size={20} className={s.color} />
            <p className="text-lg font-bold mt-2">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue vs Expenses chart */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-body font-semibold mb-4">Receita × Despesa</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 20%)" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(0 0% 60%)" }} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(0 0% 60%)" }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 20%)", borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => formatCurrency(v)}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="receita" name="Receita" fill="hsl(150, 70%, 50%)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="despesa" name="Despesa" fill="hsl(0, 70%, 50%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Revenue by category */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-body font-semibold mb-4">Receita por Categoria</h3>
          {categoryRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryRevenue} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {categoryRevenue.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 20%)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">Sem dados de receita no período</p>
          )}
        </div>

        {/* Expense breakdown */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-body font-semibold mb-4">Despesas por Categoria</h3>
          {expenseBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={expenseBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {expenseBreakdown.map((_, i) => <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 20%)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">Sem dados de despesa no período</p>
          )}
        </div>
      </div>

      {/* Products: stock value + margin */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-body font-semibold mb-4">Valor em Estoque por Produto (Top 8)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topProducts} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 20%)" />
            <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(0 0% 60%)" }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(0 0% 60%)" }} width={150} />
            <Tooltip
              contentStyle={{ background: "hsl(0 0% 10%)", border: "1px solid hsl(0 0% 20%)", borderRadius: 8, fontSize: 12 }}
              formatter={(v: number, name: string) => name === "valor" ? formatCurrency(v) : `${v}%`}
            />
            <Bar dataKey="valor" name="Valor" fill="hsl(280, 80%, 60%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Low stock table */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-body font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-red-400" /> Produtos com Estoque Baixo
        </h3>
        {lowStock.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Todos os produtos estão com estoque adequado! 🎉</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2 text-muted-foreground font-body">Produto</th>
                  <th className="text-left p-2 text-muted-foreground font-body">SKU</th>
                  <th className="text-right p-2 text-muted-foreground font-body">Estoque</th>
                  <th className="text-right p-2 text-muted-foreground font-body">Custo Unit.</th>
                  <th className="text-right p-2 text-muted-foreground font-body">Margem</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map(p => (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="p-2 flex items-center gap-2">
                      <img src={p.image} alt="" className="w-8 h-8 rounded object-cover" />
                      <span className="truncate max-w-[180px]">{p.name}</span>
                    </td>
                    <td className="p-2 text-muted-foreground">{p.sku}</td>
                    <td className="p-2 text-right">
                      <span className={`font-bold ${(p.stock || 0) < 5 ? "text-red-400" : "text-yellow-400"}`}>{p.stock}</span>
                    </td>
                    <td className="p-2 text-right text-muted-foreground">
                      {p.costPrice ? `R$ ${p.costPrice.toFixed(2)}` : "—"}
                    </td>
                    <td className="p-2 text-right">
                      {p.costPrice && p.costPrice > 0 ? (
                        <span className="font-bold text-green-400">
                          {((1 - p.costPrice / (p.promoPrice || p.price)) * 100).toFixed(0)}%
                        </span>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
