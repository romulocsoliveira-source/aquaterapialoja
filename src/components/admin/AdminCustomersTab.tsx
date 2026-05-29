import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, Search, Edit2, Trash2, Plus, History, Loader2 } from "lucide-react";

type Customer = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  cpf: string | null;
  birth_date: string | null;
  zip_code: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  observacoes: string | null;
  created_at: string;
};

const empty: Partial<Customer> = {
  full_name: "", email: "", phone: "", cpf: "", birth_date: "",
  zip_code: "", street: "", number: "", complement: "", neighborhood: "",
  city: "", state: "", observacoes: "",
};

export default function AdminCustomersTab() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState<Partial<Customer>>(empty);
  const [saving, setSaving] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyCustomer, setHistoryCustomer] = useState<Customer | null>(null);
  const [historyData, setHistoryData] = useState<{ orders: any[]; agendamentos: any[] }>({ orders: [], agendamentos: [] });
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    if (error) toast.error("Erro ao carregar clientes");
    setCustomers((data as Customer[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setFormOpen(true); };
  const openEdit = (c: Customer) => { setEditing(c); setForm(c); setFormOpen(true); };

  const setField = (k: keyof Customer, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.full_name?.trim()) { toast.error("Nome completo é obrigatório"); return; }
    if (!user) return;
    setSaving(true);
    const payload: any = {
      ...form,
      birth_date: form.birth_date || null,
      created_by: user.id,
    };
    delete payload.id;
    delete payload.created_at;

    let error;
    if (editing) {
      ({ error } = await supabase.from("customers").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("customers").insert(payload));
    }
    setSaving(false);
    if (error) { console.log("[AdminCustomers:save]", error); toast.error(error.message); return; }
    toast.success(editing ? "Cliente atualizado" : "Cliente cadastrado");
    setFormOpen(false);
    fetchCustomers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este cliente?")) return;
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Cliente excluído");
    fetchCustomers();
  };

  const openHistory = async (c: Customer) => {
    setHistoryCustomer(c);
    setHistoryOpen(true);
    setHistoryLoading(true);
    setHistoryData({ orders: [], agendamentos: [] });

    // Find linked user_ids via profile (match by cpf)
    let userIds: string[] = [];
    if (c.cpf) {
      const { data: profs } = await supabase.from("profiles").select("user_id").eq("cpf", c.cpf);
      userIds = (profs || []).map((p: any) => p.user_id);
    }

    if (userIds.length > 0) {
      const [ordersRes, agRes] = await Promise.all([
        supabase.from("orders").select("id, total, status, payment_method, created_at").in("user_id", userIds).order("created_at", { ascending: false }),
        supabase.from("agendamentos").select("id, data, horario, status, observacoes, created_at").in("user_id", userIds).order("created_at", { ascending: false }),
      ]);
      setHistoryData({ orders: ordersRes.data || [], agendamentos: agRes.data || [] });
    }
    setHistoryLoading(false);
  };

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.cpf || "").toLowerCase().includes(q) ||
      (c.phone || "").toLowerCase().includes(q)
    );
  });

  const fmtMoney = (v: number) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <h1 className="font-display text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Cadastro de Clientes
        </h1>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> Novo Cliente
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome, e-mail, CPF ou telefone..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      {loading ? (
        <p className="text-center py-10 text-muted-foreground">Carregando...</p>
      ) : (
        <div className="bg-card rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Nome</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">E-mail</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Telefone</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">CPF</th>
                <th className="text-left p-3 font-medium hidden lg:table-cell">Cidade</th>
                <th className="text-right p-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium">{c.full_name}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{c.email || "—"}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{c.phone || "—"}</td>
                  <td className="p-3 text-muted-foreground hidden lg:table-cell">{c.cpf || "—"}</td>
                  <td className="p-3 text-muted-foreground hidden lg:table-cell">{c.city || "—"}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button variant="ghost" size="icon" aria-label="Histórico" onClick={() => openHistory(c)}>
                      <History className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => openEdit(c)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Excluir" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Nenhum cliente cadastrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <Label>Nome completo *</Label>
              <Input value={form.full_name || ""} onChange={e => setField("full_name", e.target.value)} />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input type="email" value={form.email || ""} onChange={e => setField("email", e.target.value)} />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={form.phone || ""} onChange={e => setField("phone", e.target.value)} />
            </div>
            <div>
              <Label>CPF</Label>
              <Input value={form.cpf || ""} onChange={e => setField("cpf", e.target.value)} />
            </div>
            <div>
              <Label>Data de nascimento</Label>
              <Input type="date" value={form.birth_date || ""} onChange={e => setField("birth_date", e.target.value)} />
            </div>
            <div>
              <Label>CEP</Label>
              <Input value={form.zip_code || ""} onChange={e => setField("zip_code", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Rua</Label>
              <Input value={form.street || ""} onChange={e => setField("street", e.target.value)} />
            </div>
            <div>
              <Label>Número</Label>
              <Input value={form.number || ""} onChange={e => setField("number", e.target.value)} />
            </div>
            <div>
              <Label>Complemento</Label>
              <Input value={form.complement || ""} onChange={e => setField("complement", e.target.value)} />
            </div>
            <div>
              <Label>Bairro</Label>
              <Input value={form.neighborhood || ""} onChange={e => setField("neighborhood", e.target.value)} />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input value={form.city || ""} onChange={e => setField("city", e.target.value)} />
            </div>
            <div>
              <Label>Estado (UF)</Label>
              <Input maxLength={2} value={form.state || ""} onChange={e => setField("state", e.target.value.toUpperCase())} />
            </div>
            <div className="md:col-span-2">
              <Label>Observações</Label>
              <Textarea
                rows={4}
                placeholder="Preferências, alergias do pet, condições especiais, anotações internas..."
                value={form.observacoes || ""}
                onChange={e => setField("observacoes", e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editing ? "Salvar Alterações" : "Cadastrar Cliente"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico — {historyCustomer?.full_name}</DialogTitle>
          </DialogHeader>

          {historyCustomer?.observacoes && (
            <div className="bg-muted/40 border rounded-lg p-3 text-sm">
              <p className="font-semibold mb-1">Observações</p>
              <p className="text-muted-foreground whitespace-pre-wrap">{historyCustomer.observacoes}</p>
            </div>
          )}

          {historyLoading ? (
            <div className="py-10 text-center text-muted-foreground flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Carregando histórico...
            </div>
          ) : (
            <div className="space-y-6">
              <section>
                <h3 className="font-semibold mb-2 text-sm">Pedidos ({historyData.orders.length})</h3>
                {historyData.orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum pedido encontrado.</p>
                ) : (
                  <div className="space-y-2">
                    {historyData.orders.map(o => (
                      <div key={o.id} className="border rounded-lg p-3 text-sm flex justify-between items-center">
                        <div>
                          <p className="font-medium">{fmtDate(o.created_at)} · {o.payment_method || "—"}</p>
                          <p className="text-xs text-muted-foreground">Status: {o.status}</p>
                        </div>
                        <p className="font-semibold">{fmtMoney(o.total)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h3 className="font-semibold mb-2 text-sm">Agendamentos ({historyData.agendamentos.length})</h3>
                {historyData.agendamentos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum agendamento encontrado.</p>
                ) : (
                  <div className="space-y-2">
                    {historyData.agendamentos.map(a => (
                      <div key={a.id} className="border rounded-lg p-3 text-sm">
                        <p className="font-medium">{fmtDate(a.data)} às {a.horario}</p>
                        <p className="text-xs text-muted-foreground">Status: {a.status}</p>
                        {a.observacoes && <p className="text-xs mt-1">{a.observacoes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {!historyCustomer?.cpf && (
                <p className="text-xs text-muted-foreground italic">
                  Cadastre o CPF do cliente para vincular automaticamente pedidos e agendamentos realizados na loja.
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
