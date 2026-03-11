import { useState, useMemo } from "react";
import {
  DollarSign, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle,
  Plus, Trash2, Check, Clock, Filter, Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/hooks/useStoreData";
import {
  useFinancialTransactions,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  type FinancialTransaction,
} from "@/hooks/useFinancial";

const CATEGORIES_INCOME = ["Vendas Online", "Vendas WhatsApp", "Vendas PDV", "Vendas Mercado Livre", "Outros"];
const CATEGORIES_EXPENSE = ["Fornecedores", "Aluguel", "Marketing", "Embalagens", "Frete", "Impostos", "Salários", "Outros"];

type FilterType = "all" | "income" | "expense" | "payable" | "receivable";

const typeLabels: Record<string, string> = {
  income: "Entrada",
  expense: "Despesa",
  payable: "A Pagar",
  receivable: "A Receber",
};

const typeColors: Record<string, string> = {
  income: "text-green-400",
  expense: "text-red-400",
  payable: "text-yellow-400",
  receivable: "text-blue-400",
};

const typeIcons: Record<string, React.ReactNode> = {
  income: <ArrowUpCircle size={16} className="text-green-400" />,
  expense: <ArrowDownCircle size={16} className="text-red-400" />,
  payable: <Clock size={16} className="text-yellow-400" />,
  receivable: <Clock size={16} className="text-blue-400" />,
};

export default function FinancialTab() {
  const { user } = useAuth();
  const { data: transactions = [], isLoading } = useFinancialTransactions();
  const { data: products = [] } = useProducts();
  const createTx = useCreateTransaction();
  const updateTx = useUpdateTransaction();
  const deleteTx = useDeleteTransaction();

  const [filter, setFilter] = useState<FilterType>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [formType, setFormType] = useState<"income" | "expense" | "payable" | "receivable">("income");

  // Form state
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "",
    due_date: "",
    payment_method: "",
    notes: "",
  });

  const resetForm = () => setForm({ description: "", amount: "", category: "", due_date: "", payment_method: "", notes: "" });

  const filtered = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter(t => t.type === filter);
  }, [transactions, filter]);

  // Financial summaries
  const summary = useMemo(() => {
    const now = new Date();
    const thisMonth = (d: string) => {
      const date = new Date(d);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    };
    const today = (d: string) => new Date(d).toDateString() === now.toDateString();

    const monthTx = transactions.filter(t => thisMonth(t.created_at));
    const todayTx = transactions.filter(t => today(t.created_at));

    const totalIncome = monthTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpense = monthTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const pendingPayable = transactions.filter(t => t.type === "payable" && !t.is_paid).reduce((s, t) => s + t.amount, 0);
    const pendingReceivable = transactions.filter(t => t.type === "receivable" && !t.is_paid).reduce((s, t) => s + t.amount, 0);
    const todayIncome = todayTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);

    // Profit estimation from products
    const totalCost = products.reduce((s, p) => s + ((p as any).cost_price || 0) * (p.stock || 0), 0);
    const estimatedProfit = totalIncome - totalExpense;

    return { totalIncome, totalExpense, pendingPayable, pendingReceivable, todayIncome, estimatedProfit };
  }, [transactions, products]);

  const formatCurrency = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleSubmit = async () => {
    if (!form.description || !form.amount) {
      toast.error("Preencha descrição e valor");
      return;
    }
    try {
      await createTx.mutateAsync({
        type: formType,
        category: form.category || "Geral",
        description: form.description,
        amount: Number(form.amount),
        due_date: form.due_date || null,
        paid_date: formType === "income" || formType === "expense" ? new Date().toISOString().split("T")[0] : null,
        is_paid: formType === "income" || formType === "expense",
        payment_method: form.payment_method || null,
        reference_id: null,
        reference_type: null,
        notes: form.notes || null,
        created_by: user?.id || "",
      });
      toast.success("Lançamento registrado!");
      setFormOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Erro ao registrar");
    }
  };

  const handleMarkPaid = async (tx: FinancialTransaction) => {
    try {
      await updateTx.mutateAsync({
        id: tx.id,
        is_paid: true,
        paid_date: new Date().toISOString().split("T")[0],
      });
      toast.success("Marcado como pago!");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (tx: FinancialTransaction) => {
    if (!confirm(`Excluir "${tx.description}"?`)) return;
    try {
      await deleteTx.mutateAsync(tx.id);
      toast.success("Lançamento excluído");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openForm = (type: "income" | "expense" | "payable" | "receivable") => {
    setFormType(type);
    resetForm();
    setFormOpen(true);
  };

  const stats = [
    { label: "Faturamento Hoje", value: formatCurrency(summary.todayIncome), icon: DollarSign, color: "text-green-400" },
    { label: "Receitas (Mês)", value: formatCurrency(summary.totalIncome), icon: TrendingUp, color: "text-green-400" },
    { label: "Despesas (Mês)", value: formatCurrency(summary.totalExpense), icon: TrendingDown, color: "text-red-400" },
    { label: "Lucro Estimado", value: formatCurrency(summary.estimatedProfit), icon: Wallet, color: summary.estimatedProfit >= 0 ? "text-green-400" : "text-red-400" },
    { label: "A Receber", value: formatCurrency(summary.pendingReceivable), icon: ArrowUpCircle, color: "text-blue-400" },
    { label: "A Pagar", value: formatCurrency(summary.pendingPayable), icon: ArrowDownCircle, color: "text-yellow-400" },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-xl p-4">
            <s.icon size={20} className={s.color} />
            <p className="text-lg font-bold mt-2">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => openForm("income")} className="bg-green-600 hover:bg-green-700 text-white font-body text-xs gap-1.5">
          <ArrowUpCircle size={14} /> Nova Entrada
        </Button>
        <Button onClick={() => openForm("expense")} className="bg-red-600 hover:bg-red-700 text-white font-body text-xs gap-1.5">
          <ArrowDownCircle size={14} /> Nova Despesa
        </Button>
        <Button onClick={() => openForm("payable")} variant="outline" className="font-body text-xs gap-1.5 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10">
          <Clock size={14} /> Conta a Pagar
        </Button>
        <Button onClick={() => openForm("receivable")} variant="outline" className="font-body text-xs gap-1.5 border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
          <Clock size={14} /> Conta a Receber
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "income", "expense", "payable", "receivable"] as FilterType[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-body transition-colors ${
              filter === f ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "Todos" : typeLabels[f]}
          </button>
        ))}
      </div>

      {/* Transactions list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Nenhum lançamento encontrado. Registre sua primeira entrada ou despesa!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-3 font-body font-semibold text-muted-foreground">Tipo</th>
                  <th className="text-left p-3 font-body font-semibold text-muted-foreground">Descrição</th>
                  <th className="text-left p-3 font-body font-semibold text-muted-foreground hidden md:table-cell">Categoria</th>
                  <th className="text-left p-3 font-body font-semibold text-muted-foreground hidden md:table-cell">Vencimento</th>
                  <th className="text-right p-3 font-body font-semibold text-muted-foreground">Valor</th>
                  <th className="text-right p-3 font-body font-semibold text-muted-foreground">Status</th>
                  <th className="text-right p-3 font-body font-semibold text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map(tx => (
                  <tr key={tx.id} className="border-b border-border/50 hover:bg-secondary/30">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {typeIcons[tx.type]}
                        <span className={`text-xs font-semibold ${typeColors[tx.type]}`}>{typeLabels[tx.type]}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="font-medium truncate max-w-[200px]">{tx.description}</p>
                      {tx.notes && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{tx.notes}</p>}
                    </td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell">{tx.category}</td>
                    <td className="p-3 text-muted-foreground hidden md:table-cell">
                      {tx.due_date ? new Date(tx.due_date).toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td className={`p-3 text-right font-bold ${tx.type === "income" || tx.type === "receivable" ? "text-green-400" : "text-red-400"}`}>
                      {tx.type === "expense" || tx.type === "payable" ? "- " : "+ "}
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="p-3 text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${tx.is_paid ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                        {tx.is_paid ? "Pago" : "Pendente"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!tx.is_paid && (
                          <button onClick={() => handleMarkPaid(tx)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-green-400" title="Marcar como pago">
                            <Check size={14} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(tx)} className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-destructive" title="Excluir">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Transaction Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              {typeIcons[formType]} Novo Lançamento — {typeLabels[formType]}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Ex: Venda #1234" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor (R$) *</Label>
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
            {(formType === "payable" || formType === "receivable") && (
              <div className="space-y-2">
                <Label>Data de Vencimento</Label>
                <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
              </div>
            )}
            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Select value={form.payment_method} onValueChange={v => setForm(f => ({ ...f, payment_method: v }))}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {["Pix", "Cartão de Crédito", "Cartão de Débito", "Dinheiro", "Boleto", "Transferência"].map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Notas adicionais..." />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={createTx.isPending} className="gradient-purple-pink text-primary-foreground">
                {createTx.isPending ? "Salvando..." : "Registrar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
