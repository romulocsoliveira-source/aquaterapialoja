import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Building2, Plus, Edit2, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

const statusOptions = ["pendente", "aguardando_pagamento", "confirmada", "em_andamento", "concluida", "cancelada"];
const statusColor = (s: string) => {
  if (s === "confirmada" || s === "concluida") return "bg-primary/10 text-primary";
  if (s === "cancelada") return "bg-destructive/10 text-destructive";
  if (s === "em_andamento") return "bg-accent/20 text-accent-foreground";
  return "bg-muted text-muted-foreground";
};

export default function AdminHotelTab() {
  const [tab, setTab] = useState<"reservas" | "acomodacoes">("reservas");
  const [reservas, setReservas] = useState<any[]>([]);
  const [acomodacoes, setAcomodacoes] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [petsMap, setPetsMap] = useState<Record<string, string>>({});
  const [acomMap, setAcomMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<any>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editObs, setEditObs] = useState("");
  const [saving, setSaving] = useState(false);

  const [acomDialog, setAcomDialog] = useState(false);
  const [editAcom, setEditAcom] = useState<any>(null);
  const [acomNome, setAcomNome] = useState("");
  const [acomDesc, setAcomDesc] = useState("");
  const [acomPreco, setAcomPreco] = useState("");
  const [acomCap, setAcomCap] = useState("1");

  const fetchData = async () => {
    setLoading(true);
    const [{ data: res }, { data: acoms }] = await Promise.all([
      supabase.from("reservas_hotel").select("*").order("checkin", { ascending: false }),
      supabase.from("acomodacoes_hotel").select("*").order("preco_diaria"),
    ]);
    setReservas((res as any[]) || []);
    setAcomodacoes((acoms as any[]) || []);

    const aMap: Record<string, string> = {};
    (acoms as any[] || []).forEach((a: any) => { aMap[a.id] = a.nome; });
    setAcomMap(aMap);

    if (res && res.length > 0) {
      const userIds = [...new Set((res as any[]).map((r: any) => r.user_id))];
      const petIds = [...new Set((res as any[]).map((r: any) => r.pet_id))];
      const [{ data: profs }, { data: petsData }] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name").in("user_id", userIds),
        supabase.from("pets").select("id, nome").in("id", petIds),
      ]);
      const pMap: Record<string, string> = {};
      profs?.forEach((p: any) => { pMap[p.user_id] = p.full_name || "Cliente"; });
      setProfiles(pMap);
      const petMap: Record<string, string> = {};
      petsData?.forEach((p: any) => { petMap[p.id] = p.nome; });
      setPetsMap(petMap);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openDetail = (r: any) => { setSelected(r); setEditStatus(r.status); setEditObs(r.observacoes || ""); };

  const handleUpdateReserva = async () => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase.from("reservas_hotel").update({
      status: editStatus, observacoes: editObs || null, updated_at: new Date().toISOString(),
    } as any).eq("id", selected.id);
    if (error) toast.error(error.message);
    else { toast.success("Reserva atualizada!"); setSelected(null); fetchData(); }
    setSaving(false);
  };

  const openAcomForm = (a?: any) => {
    setEditAcom(a || null);
    setAcomNome(a?.nome || "");
    setAcomDesc(a?.descricao || "");
    setAcomPreco(a ? String(a.preco_diaria) : "");
    setAcomCap(a ? String(a.capacidade) : "1");
    setAcomDialog(true);
  };

  const handleSaveAcom = async () => {
    if (!acomNome || !acomPreco) { toast.error("Preencha nome e preço"); return; }
    setSaving(true);
    const payload = { nome: acomNome, descricao: acomDesc, preco_diaria: Number(acomPreco), capacidade: Number(acomCap) };
    const { error } = editAcom
      ? await supabase.from("acomodacoes_hotel").update(payload as any).eq("id", editAcom.id)
      : await supabase.from("acomodacoes_hotel").insert(payload as any);
    if (error) toast.error(error.message);
    else { toast.success(editAcom ? "Acomodação atualizada!" : "Acomodação criada!"); setAcomDialog(false); fetchData(); }
    setSaving(false);
  };

  const toggleAcomAtivo = async (a: any) => {
    await supabase.from("acomodacoes_hotel").update({ ativo: !a.ativo } as any).eq("id", a.id);
    fetchData();
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6 flex items-center gap-2"><Building2 className="w-6 h-6 text-primary" /> Hotel Pet</h1>

      <div className="flex gap-2 mb-6">
        <Button variant={tab === "reservas" ? "default" : "outline"} size="sm" onClick={() => setTab("reservas")}>Reservas</Button>
        <Button variant={tab === "acomodacoes" ? "default" : "outline"} size="sm" onClick={() => setTab("acomodacoes")}>Acomodações</Button>
      </div>

      {loading && <p className="text-muted-foreground text-center py-10">Carregando...</p>}

      {!loading && tab === "reservas" && (
        <div className="space-y-3">
          {reservas.length === 0 && <p className="text-center text-muted-foreground py-10">Nenhuma reserva registrada.</p>}
          {reservas.map((r: any) => (
            <div key={r.id} onClick={() => openDetail(r)} className="bg-card rounded-xl border p-4 flex items-center gap-4 cursor-pointer hover:shadow-sm transition-shadow">
              <div className="w-12 h-12 rounded-full gradient-pet flex items-center justify-center text-primary-foreground">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-sm">{acomMap[r.acomodacao_id] || "Acomodação"}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColor(r.status)}`}>{r.status.replace("_", " ")}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  🐾 {petsMap[r.pet_id] || "Pet"} • 👤 {profiles[r.user_id] || "Cliente"}
                  {r.forma_pagamento && <> • 💳 {r.forma_pagamento.replace("_", " ")}</>}
                </p>
              </div>
              <div className="text-right text-sm">
                <p className="font-bold text-primary">R$ {Number(r.valor_total).toFixed(2).replace(".", ",")}</p>
                <p className="text-xs text-muted-foreground">{format(new Date(r.checkin + "T12:00:00"), "dd/MM")} → {format(new Date(r.checkout + "T12:00:00"), "dd/MM")}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && tab === "acomodacoes" && (
        <div>
          <Button size="sm" onClick={() => openAcomForm()} className="mb-4"><Plus className="w-4 h-4 mr-1" /> Nova Acomodação</Button>
          <div className="space-y-3">
            {acomodacoes.map((a: any) => (
              <div key={a.id} className="bg-card rounded-xl border p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{a.nome} {!a.ativo && <span className="text-xs text-destructive">(inativa)</span>}</p>
                  <p className="text-xs text-muted-foreground">{a.descricao}</p>
                  <p className="text-sm font-bold text-primary mt-1">R$ {Number(a.preco_diaria).toFixed(2).replace(".", ",")} /dia</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openAcomForm(a)}><Edit2 className="w-3 h-3" /></Button>
                  <Button size="sm" variant={a.ativo ? "destructive" : "default"} onClick={() => toggleAcomAtivo(a)}>
                    {a.ativo ? <X className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={v => !v && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Detalhes da Reserva</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Cliente:</span> {profiles[selected.user_id]}</div>
                <div><span className="text-muted-foreground">Pet:</span> {petsMap[selected.pet_id]}</div>
                <div><span className="text-muted-foreground">Acomodação:</span> {acomMap[selected.acomodacao_id]}</div>
                <div><span className="text-muted-foreground">Valor:</span> R$ {Number(selected.valor_total).toFixed(2).replace(".", ",")}</div>
                <div><span className="text-muted-foreground">Check-in:</span> {format(new Date(selected.checkin + "T12:00:00"), "dd/MM/yyyy")}</div>
                <div><span className="text-muted-foreground">Check-out:</span> {format(new Date(selected.checkout + "T12:00:00"), "dd/MM/yyyy")}</div>
                <div><span className="text-muted-foreground">Pagamento:</span> {selected.forma_pagamento?.replace("_", " ") || "—"}</div>
              </div>
              <div>
                <Label>Status</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                  {statusOptions.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
              </div>
              <div>
                <Label>Observações</Label>
                <textarea className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm min-h-[80px]" value={editObs} onChange={e => setEditObs(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button>
                <Button onClick={handleUpdateReserva} disabled={saving}>{saving ? "Salvando..." : "Atualizar"}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={acomDialog} onOpenChange={setAcomDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editAcom ? "Editar Acomodação" : "Nova Acomodação"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome *</Label><Input value={acomNome} onChange={e => setAcomNome(e.target.value)} className="mt-1" /></div>
            <div><Label>Descrição</Label><Input value={acomDesc} onChange={e => setAcomDesc(e.target.value)} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Preço/diária *</Label><Input type="number" step="0.01" value={acomPreco} onChange={e => setAcomPreco(e.target.value)} className="mt-1" /></div>
              <div><Label>Capacidade</Label><Input type="number" value={acomCap} onChange={e => setAcomCap(e.target.value)} className="mt-1" /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setAcomDialog(false)}>Cancelar</Button>
              <Button onClick={handleSaveAcom} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
