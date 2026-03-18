import { useState, useMemo } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle,
  Plus, Trash2, Check, Clock, Wallet, Building2, FileText, Download,
  BarChart3, RefreshCw, ChevronRight, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/hooks/useStoreData";
import {
  useFinancialTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction,
  useBankAccounts, useCreateBankAccount, useUpdateBankAccount,
  type FinancialTransaction, type BankAccount,
} from "@/hooks/useFinancial";

const CHANNELS = ["PDV", "Mercado Livre", "WhatsApp", "Loja Virtual"];
const CATEGORIES_INCOME = ["Venda PDV", "Venda Online", "Venda WhatsApp", "Venda Mercado Livre", "Outros"];
const CATEGORIES_EXPENSE = ["Fornecedores", "Aluguel", "Energia", "Combustível", "Marketing", "Embalagens", "Frete", "Impostos", "Salários", "Outros"];
const PAYMENT_METHODS = ["Pix", "Cartão de Crédito", "Cartão de Débito", "Dinheiro", "Boleto", "Transferência"];

const typeLabels: Record<string, string> = { income: "Entrada", expense: "Despesa", payable: "A Pagar", receivable: "A Receber" };
const typeColors: Record<string, string> = { income: "text-green-500", expense: "text-red-500", payable: "text-amber-500", receivable: "text-blue-500" };
const channelColors: Record<string, string> = { PDV: "bg-emerald-500/20 text-emerald-400", "Mercado Livre": "bg-yellow-500/20 text-yellow-400", WhatsApp: "bg-green-500/20 text-green-400", "Loja Virtual": "bg-blue-500/20 text-blue-400" };

const formatCurrency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function FinancialTab() {
  const { user } = useAuth();
  const { data: transactions = [], isLoading } = useFinancialTransactions();
  const { data: products = [] } = useProducts();
  const { data: bankAccounts = [] } = useBankAccounts();
  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();
  const deleteTx = useDeleteTransaction();
  const createAccount = useCreateBankAccount();
  const updateAccount = useUpdateBankAccount();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState<"income" | "expense" | "payable" | "receivable">("income");
  const [accountFormOpen, setAccountFormOpen] = useState(false);
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("month");

  const [form, setForm] = useState({ description: "", amount: "", category: "", due_date: "", payment_method: "", notes: "", sales_channel: "", bank_account_id: "" });
  const [accountForm, setAccountForm] = useState({ name: "", type: "checking", bank_name: "", initial_balance: "0" });

  const resetForm = () => setForm({ description: "", amount: "", category: "", due_date: "", payment_method: "", notes: "", sales_channel: "", bank_account_id: "" });

  const filteredByPeriod = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      const d = new Date(t.created_at);
      if (periodFilter === "today") return d.toDateString() === now.toDateString();
      if (periodFilter === "week") { const w = new Date(now); w.setDate(w.getDate() - 7); return d >= w; }
      if (periodFilter === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (periodFilter === "year") return d.getFullYear() === now.getFullYear();
      return true;
    });
  }, [transactions, periodFilter]);

  const filteredByChannel = useMemo(() => {
    if (channelFilter === "all") return filteredByPeriod;
    return filteredByPeriod.filter(t => t.sales_channel === channelFilter || t.category?.includes(channelFilter));
  }, [filteredByPeriod, channelFilter]);

  const summary = useMemo(() => {
    const income = filteredByPeriod.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = filteredByPeriod.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const payable = transactions.filter(t => t.type === "payable" && !t.is_paid).reduce((s, t) => s + t.amount, 0);
    const receivable = transactions.filter(t => t.type === "receivable" && !t.is_paid).reduce((s, t) => s + t.amount, 0);
    const totalBalance = bankAccounts.reduce((s, a) => s + a.current_balance, 0);
    const profit = income - expense;
    const byChannel: Record<string, number> = {};
    filteredByPeriod.filter(t => t.type === "income").forEach(t => {
      const ch = t.sales_channel || t.category?.replace("Venda ", "") || "Outros";
      byChannel[ch] = (byChannel[ch] || 0) + t.amount;
    });
    return { income, expense, payable, receivable, totalBalance, profit, byChannel };
  }, [filteredByPeriod, transactions, bankAccounts]);

  const overdueCount = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => !t.is_paid && t.due_date && new Date(t.due_date) < now).length;
  }, [transactions]);

  const handleSubmit = async () => {
    if (!form.description || !form.amount) { toast.error("Preencha descrição e valor"); return; }
    try {
      await createTx.mutateAsync({
        type: formType, category: form.category || "Geral", description: form.description,
        amount: Number(form.amount),
        due_date: form.due_date || null,
        paid_date: formType === "income" || formType === "expense" ? new Date().toISOString().split("T")[0] : null,
        is_paid: formType === "income" || formType === "expense",
        payment_method: form.payment_method || null,
        reference_id: null, reference_type: null,
        notes: form.notes || null, created_by: user?.id || "",
        sales_channel: form.sales_channel || null,
        bank_account_id: form.bank_account_id || null,
      });
      toast.success("Lançamento registrado!");
      setFormOpen(false); resetForm();
    } catch (err: any) { toast.error(err.message || "Erro ao registrar"); }
  };

  const handleCreateAccount = async () => {
    if (!accountForm.name) { toast.error("Informe o nome da conta"); return; }
    try {
      await createAccount.mutateAsync({
        name: accountForm.name, type: accountForm.type, bank_name: accountForm.bank_name || null,
        initial_balance: Number(accountForm.initial_balance) || 0,
        current_balance: Number(accountForm.initial_balance) || 0,
        is_active: true, created_by: user?.id || "",
      });
      toast.success("Conta criada!");
      setAccountFormOpen(false);
      setAccountForm({ name: "", type: "checking", bank_name: "", initial_balance: "0" });
    } catch (err: any) { toast.error(err.message); }
  };

  const handleMarkPaid = async (tx: FinancialTransaction) => {
    try {
      await updateTx.mutateAsync({ id: tx.id, is_paid: true, paid_date: new Date().toISOString().split("T")[0] });
      toast.success(tx.type === "receivable" ? "Recebi! ✓" : "Paguei! ✓");
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDelete = async (tx: FinancialTransaction) => {
    if (!confirm(`Excluir "${tx.description}"?`)) return;
    try { await deleteTx.mutateAsync(tx.id); toast.success("Excluído"); } catch (err: any) { toast.error(err.message); }
  };

  const openForm = (type: "income" | "expense" | "payable" | "receivable") => { setFormType(type); resetForm(); setFormOpen(true); };

  const exportCSV = () => {
    const headers = "Data,Tipo,Descrição,Categoria,Canal,Valor,Status\n";
    const rows = filteredByChannel.map(t =>
      `${new Date(t.created_at).toLocaleDateString("pt-BR")},${typeLabels[t.type]},${t.description.replace(/,/g, ";")},${t.category},${t.sales_channel || ""},${t.amount},${t.is_paid ? "Pago" : "Pendente"}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `financeiro-${periodFilter}.csv`; a.click();
    toast.success("CSV exportado!");
  };

  const cashFlow = useMemo(() => {
    const sorted = [...filteredByChannel].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    let balance = 0;
    return sorted.map(t => {
      const delta = t.type === "income" || t.type === "receivable" ? t.amount : -t.amount;
      if (t.is_paid) balance += delta;
      return { ...t, runningBalance: balance };
    });
  }, [filteredByChannel]);

  const maxChannelValue = Math.max(...Object.values(summary.byChannel), 1);

  return (
    <div className="space-y-4">
      {/* Period + Channel filters */}
      <div className="flex flex-wrap items-center gap-2">
        {["today", "week", "month", "year", "all"].map(p => (
          <button key={p} onClick={() => setPeriodFilter(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-body transition-colors ${periodFilter === p ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
            {p === "today" ? "Hoje" : p === "week" ? "Semana" : p === "month" ? "Mês" : p === "year" ? "Ano" : "Tudo"}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={exportCSV} className="gap-1.5 text-xs"><Download size={14} /> CSV</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="dashboard" className="gap-1.5 text-xs"><BarChart3 size={14} /> Visão Geral</TabsTrigger>
          <TabsTrigger value="transactions" className="gap-1.5 text-xs"><DollarSign size={14} /> Lançamentos</TabsTrigger>
          <TabsTrigger value="receivable" className="gap-1.5 text-xs"><ArrowUpCircle size={14} /> A Receber</TabsTrigger>
          <TabsTrigger value="payable" className="gap-1.5 text-xs"><ArrowDownCircle size={14} /> A Pagar</TabsTrigger>
          <TabsTrigger value="cashflow" className="gap-1.5 text-xs"><TrendingUp size={14} /> Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="accounts" className="gap-1.5 text-xs"><Building2 size={14} /> Contas</TabsTrigger>
          <TabsTrigger value="dre" className="gap-1.5 text-xs"><FileText size={14} /> DRE</TabsTrigger>
        </TabsList>

        {/* DASHBOARD */}
        <TabsContent value="dashboard" className="space-y-6 mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Saldo Total", value: formatCurrency(summary.totalBalance), icon: Wallet, color: "text-primary" },
              { label: "Faturamento", value: formatCurrency(summary.income), icon: TrendingUp, color: "text-green-500" },
              { label: "Despesas", value: formatCurrency(summary.expense), icon: TrendingDown, color: "text-red-500" },
              { label: "Lucro", value: formatCurrency(summary.profit), icon: DollarSign, color: summary.profit >= 0 ? "text-green-500" : "text-red-500" },
              { label: "A Receber", value: formatCurrency(summary.receivable), icon: ArrowUpCircle, color: "text-blue-500" },
              { label: "A Pagar", value: formatCurrency(summary.payable), icon: ArrowDownCircle, color: "text-amber-500" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-xl p-4">
                <s.icon size={20} className={s.color} />
                <p className="text-lg font-bold mt-2">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-display text-sm font-bold mb-3">Entradas vs Saídas</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-green-500">Entradas</span><span>{formatCurrency(summary.income)}</span></div>
                <div className="h-4 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${summary.income + summary.expense > 0 ? (summary.income / (summary.income + summary.expense)) * 100 : 50}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-red-500">Saídas</span><span>{formatCurrency(summary.expense)}</span></div>
                <div className="h-4 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${summary.income + summary.expense > 0 ? (summary.expense / (summary.income + summary.expense)) * 100 : 50}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-display text-sm font-bold mb-3">Vendas por Canal</h3>
            {Object.keys(summary.byChannel).length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Nenhuma venda no período</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(summary.byChannel).sort((a, b) => b[1] - a[1]).map(([ch, val]) => (
                  <div key={ch}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${channelColors[ch] || "bg-secondary text-muted-foreground"}`}>{ch}</span>
                      <span className="font-bold">{formatCurrency(val)}</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full transition-all" style={{ width: `${(val / maxChannelValue) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {overdueCount > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
              <Clock size={20} className="text-red-500" />
              <div>
                <p className="text-sm font-bold text-red-500">{overdueCount} conta(s) vencida(s)</p>
                <p className="text-xs text-muted-foreground">Verifique a aba "A Pagar" ou "A Receber"</p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* TRANSACTIONS */}
        <TabsContent value="transactions" className="space-y-4 mt-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => openForm("income")} size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs gap-1.5">
              <ArrowUpCircle size={14} /> Recebi
            </Button>
            <Button onClick={() => openForm("expense")} size="sm" className="bg-red-600 hover:bg-red-700 text-white text-xs gap-1.5">
              <ArrowDownCircle size={14} /> Paguei
            </Button>
            <Button onClick={() => openForm("receivable")} size="sm" variant="outline" className="text-xs gap-1.5 border-blue-500/50 text-blue-500">
              <Plus size={14} /> A Receber
            </Button>
            <Button onClick={() => openForm("payable")} size="sm" variant="outline" className="text-xs gap-1.5 border-amber-500/50 text-amber-500">
              <Plus size={14} /> A Pagar
            </Button>
            <div className="ml-auto">
              <Select value={channelFilter} onValueChange={setChannelFilter}>
                <SelectTrigger className="h-8 text-xs w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos canais</SelectItem>
                  {CHANNELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <TransactionTable transactions={filteredByChannel} onMarkPaid={handleMarkPaid} onDelete={handleDelete} />
        </TabsContent>

        {/* RECEIVABLE */}
        <TabsContent value="receivable" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold">Contas a Receber</h3>
              <p className="text-xs text-muted-foreground">Total pendente: <span className="font-bold text-blue-500">{formatCurrency(summary.receivable)}</span></p>
            </div>
            <Button onClick={() => openForm("receivable")} size="sm" className="gap-1.5 text-xs"><Plus size={14} /> Nova</Button>
          </div>
          <TransactionTable transactions={transactions.filter(t => t.type === "receivable")} onMarkPaid={handleMarkPaid} onDelete={handleDelete} actionLabel="Recebi ✓" />
        </TabsContent>

        {/* PAYABLE */}
        <TabsContent value="payable" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold">Contas a Pagar</h3>
              <p className="text-xs text-muted-foreground">Total pendente: <span className="font-bold text-amber-500">{formatCurrency(summary.payable)}</span></p>
            </div>
            <Button onClick={() => openForm("payable")} size="sm" className="gap-1.5 text-xs"><Plus size={14} /> Nova</Button>
          </div>
          <TransactionTable transactions={transactions.filter(t => t.type === "payable")} onMarkPaid={handleMarkPaid} onDelete={handleDelete} actionLabel="Paguei ✓" />
        </TabsContent>

        {/* CASH FLOW */}
        <TabsContent value="cashflow" className="space-y-4 mt-4">
          <h3 className="font-display font-bold">Fluxo de Caixa</h3>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-3 text-xs text-muted-foreground">Data</th>
                    <th className="text-left p-3 text-xs text-muted-foreground">Descrição</th>
                    <th className="text-right p-3 text-xs text-muted-foreground">Entrada</th>
                    <th className="text-right p-3 text-xs text-muted-foreground">Saída</th>
                    <th className="text-right p-3 text-xs text-muted-foreground">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {cashFlow.filter(t => t.is_paid).map(t => {
                    const isIncome = t.type === "income" || t.type === "receivable";
                    return (
                      <tr key={t.id} className="border-b border-border/50 hover:bg-secondary/30">
                        <td className="p-3 text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString("pt-BR")}</td>
                        <td className="p-3 text-xs truncate max-w-[200px]">{t.description}</td>
                        <td className="p-3 text-right text-xs text-green-500 font-bold">{isIncome ? formatCurrency(t.amount) : ""}</td>
                        <td className="p-3 text-right text-xs text-red-500 font-bold">{!isIncome ? formatCurrency(t.amount) : ""}</td>
                        <td className={`p-3 text-right text-xs font-bold ${t.runningBalance >= 0 ? "text-green-500" : "text-red-500"}`}>{formatCurrency(t.runningBalance)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {cashFlow.filter(t => t.is_paid).length === 0 && (
                <p className="text-center text-muted-foreground text-xs py-8">Nenhuma movimentação no período</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ACCOUNTS */}
        <TabsContent value="accounts" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold">Contas Bancárias</h3>
            <Button onClick={() => setAccountFormOpen(true)} size="sm" className="gap-1.5 text-xs"><Plus size={14} /> Nova Conta</Button>
          </div>
          {bankAccounts.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <Building2 size={32} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhuma conta cadastrada</p>
              <p className="text-xs text-muted-foreground">Crie contas para controlar Caixa, Banco, etc.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bankAccounts.map(a => (
                <div key={a.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 size={18} className="text-primary" />
                    <div>
                      <p className="font-bold text-sm">{a.name}</p>
                      {a.bank_name && <p className="text-[10px] text-muted-foreground">{a.bank_name}</p>}
                    </div>
                  </div>
                  <p className={`text-2xl font-bold ${a.current_balance >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatCurrency(a.current_balance)}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {a.type === "cash" ? "Caixa" : a.type === "checking" ? "Conta Corrente" : "Poupança"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* DRE */}
        <TabsContent value="dre" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold">Demonstrativo de Resultado (DRE Simplificado)</h3>
            <Button size="sm" variant="outline" onClick={exportCSV} className="gap-1.5 text-xs"><Download size={14} /> Exportar</Button>
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-border bg-green-500/5">
                  <td className="p-4 font-bold text-green-500">RECEITA BRUTA</td>
                  <td className="p-4 text-right font-bold text-green-500 text-lg">{formatCurrency(summary.income)}</td>
                </tr>
                {Object.entries(summary.byChannel).sort((a, b) => b[1] - a[1]).map(([ch, val]) => (
                  <tr key={ch} className="border-b border-border/50">
                    <td className="p-3 pl-8 text-xs text-muted-foreground">{ch}</td>
                    <td className="p-3 text-right text-xs">{formatCurrency(val)}</td>
                  </tr>
                ))}
                <tr className="border-b border-border bg-red-500/5">
                  <td className="p-4 font-bold text-red-500">( - ) DESPESAS</td>
                  <td className="p-4 text-right font-bold text-red-500 text-lg">{formatCurrency(summary.expense)}</td>
                </tr>
                {(() => {
                  const byCategory: Record<string, number> = {};
                  filteredByPeriod.filter(t => t.type === "expense").forEach(t => { byCategory[t.category] = (byCategory[t.category] || 0) + t.amount; });
                  return Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
                    <tr key={cat} className="border-b border-border/50">
                      <td className="p-3 pl-8 text-xs text-muted-foreground">{cat}</td>
                      <td className="p-3 text-right text-xs">{formatCurrency(val)}</td>
                    </tr>
                  ));
                })()}
                <tr className={`${summary.profit >= 0 ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  <td className={`p-4 font-bold text-lg ${summary.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {summary.profit >= 0 ? "LUCRO" : "PREJUÍZO"}
                  </td>
                  <td className={`p-4 text-right font-bold text-xl ${summary.profit >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatCurrency(Math.abs(summary.profit))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* TRANSACTION FORM */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              {formType === "income" ? <ArrowUpCircle className="text-green-500" size={20} /> :
               formType === "expense" ? <ArrowDownCircle className="text-red-500" size={20} /> :
               <Clock className="text-amber-500" size={20} />}
              {formType === "income" ? "Recebi" : formType === "expense" ? "Paguei" : formType === "payable" ? "Conta a Pagar" : "Conta a Receber"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>O quê? *</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Ex: Venda balcão, Aluguel..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quanto? (R$) *</Label>
                <Input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0,00" />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {(formType === "income" || formType === "receivable" ? CATEGORIES_INCOME : CATEGORIES_EXPENSE).map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(formType === "income" || formType === "receivable") && (
              <div className="space-y-2">
                <Label>Canal de Venda</Label>
                <Select value={form.sales_channel} onValueChange={v => setForm(f => ({ ...f, sales_channel: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione o canal..." /></SelectTrigger>
                  <SelectContent>
                    {CHANNELS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {(formType === "payable" || formType === "receivable") && (
              <div className="space-y-2">
                <Label>Vencimento</Label>
                <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Como pagou?</Label>
              <Select value={form.payment_method} onValueChange={v => setForm(f => ({ ...f, payment_method: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {bankAccounts.length > 0 && (
              <div className="space-y-2">
                <Label>Conta</Label>
                <Select value={form.bank_account_id} onValueChange={v => setForm(f => ({ ...f, bank_account_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione a conta..." /></SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Notas..." />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={createTx.isPending}
                className={formType === "income" ? "bg-green-600 hover:bg-green-700 text-white" : formType === "expense" ? "bg-red-600 hover:bg-red-700 text-white" : ""}>
                {createTx.isPending ? "Salvando..." : formType === "income" ? "Recebi ✓" : formType === "expense" ? "Paguei ✓" : "Registrar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ACCOUNT FORM */}
      <Dialog open={accountFormOpen} onOpenChange={setAccountFormOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="font-display">Nova Conta</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da Conta *</Label>
              <Input value={accountForm.name} onChange={e => setAccountForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Caixa, Nubank..." />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={accountForm.type} onValueChange={v => setAccountForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Caixa (Dinheiro)</SelectItem>
                  <SelectItem value="checking">Conta Corrente</SelectItem>
                  <SelectItem value="savings">Poupança</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Banco (opcional)</Label>
              <Input value={accountForm.bank_name} onChange={e => setAccountForm(f => ({ ...f, bank_name: e.target.value }))} placeholder="Ex: Itaú, Nubank..." />
            </div>
            <div className="space-y-2">
              <Label>Saldo Inicial (R$)</Label>
              <Input type="number" step="0.01" value={accountForm.initial_balance} onChange={e => setAccountForm(f => ({ ...f, initial_balance: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setAccountFormOpen(false)}>Cancelar</Button>
              <Button onClick={handleCreateAccount} disabled={createAccount.isPending}>
                {createAccount.isPending ? "Criando..." : "Criar Conta"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* REUSABLE TRANSACTION TABLE */
function TransactionTable({
  transactions, onMarkPaid, onDelete, actionLabel,
}: {
  transactions: FinancialTransaction[];
  onMarkPaid: (t: FinancialTransaction) => void;
  onDelete: (t: FinancialTransaction) => void;
  actionLabel?: string;
}) {
  const now = new Date();
  if (transactions.length === 0) {
    return <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground text-sm">Nenhum lançamento encontrado</div>;
  }
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left p-3 text-xs text-muted-foreground">Data</th>
              <th className="text-left p-3 text-xs text-muted-foreground">Descrição</th>
              <th className="text-left p-3 text-xs text-muted-foreground hidden md:table-cell">Categoria</th>
              <th className="text-left p-3 text-xs text-muted-foreground hidden md:table-cell">Vencimento</th>
              <th className="text-right p-3 text-xs text-muted-foreground">Valor</th>
              <th className="text-center p-3 text-xs text-muted-foreground">Status</th>
              <th className="text-right p-3 text-xs text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions.slice(0, 100).map(tx => {
              const isOverdue = !tx.is_paid && tx.due_date && new Date(tx.due_date) < now;
              const isIncome = tx.type === "income" || tx.type === "receivable";
              return (
                <tr key={tx.id} className={`border-b border-border/50 hover:bg-secondary/30 ${isOverdue ? "bg-red-500/5" : ""}`}>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString("pt-BR")}</td>
                  <td className="p-3">
                    <p className="font-medium text-xs truncate max-w-[200px]">{tx.description}</p>
                    {tx.sales_channel && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded mt-0.5 inline-block ${channelColors[tx.sales_channel] || "bg-secondary text-muted-foreground"}`}>
                        {tx.sales_channel}
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">{tx.category}</td>
                  <td className={`p-3 text-xs hidden md:table-cell ${isOverdue ? "text-red-500 font-bold" : "text-muted-foreground"}`}>
                    {tx.due_date ? new Date(tx.due_date).toLocaleDateString("pt-BR") : "—"}
                    {isOverdue && " ⚠"}
                  </td>
                  <td className={`p-3 text-right font-bold text-xs ${isIncome ? "text-green-500" : "text-red-500"}`}>
                    {isIncome ? "+" : "-"} {formatCurrency(tx.amount)}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${tx.is_paid ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                      {tx.is_paid ? "Pago" : "Pendente"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!tx.is_paid && (
                        <button onClick={() => onMarkPaid(tx)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-green-400" title={actionLabel || "Marcar como pago"}>
                          <Check size={14} />
                        </button>
                      )}
                      <button onClick={() => onDelete(tx)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive" title="Excluir">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
