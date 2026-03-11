import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calendar, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

interface Agendamento {
  id: string;
  user_id: string;
  pet_id: string;
  servico_id: string | null;
  data: string;
  horario: string;
  status: string;
  observacoes: string | null;
  created_at: string;
}

const statusOptions = ["pendente", "confirmado", "em_andamento", "concluido", "cancelado"];

export default function AdminAgendaTab() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [pets, setPets] = useState<Record<string, string>>({});
  const [servicos, setServicos] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selected, setSelected] = useState<Agendamento | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editObs, setEditObs] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data: ags } = await supabase
      .from("agendamentos")
      .select("*")
      .order("data", { ascending: true })
      .order("horario", { ascending: true });
    
    setAgendamentos((ags as any[]) || []);

    if (ags && ags.length > 0) {
      const userIds = [...new Set(ags.map((a: any) => a.user_id))];
      const petIds = [...new Set(ags.map((a: any) => a.pet_id))];
      const servIds = [...new Set(ags.filter((a: any) => a.servico_id).map((a: any) => a.servico_id!))];

      const [{ data: profs }, { data: petsData }, { data: servsData }] = await Promise.all([
        supabase.from("profiles").select("user_id, full_name").in("user_id", userIds),
        supabase.from("pets").select("id, nome").in("id", petIds),
        servIds.length > 0 ? supabase.from("servicos").select("id, nome").in("id", servIds) : { data: [] },
      ]);

      const pMap: Record<string, string> = {};
      profs?.forEach((p: any) => { pMap[p.user_id] = p.full_name || "Cliente"; });
      setProfiles(pMap);

      const petMap: Record<string, string> = {};
      petsData?.forEach((p: any) => { petMap[p.id] = p.nome; });
      setPets(petMap);

      const sMap: Record<string, string> = {};
      servsData?.forEach((s: any) => { sMap[s.id] = s.nome; });
      setServicos(sMap);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openDetails = (a: Agendamento) => {
    setSelected(a);
    setEditStatus(a.status);
    setEditObs(a.observacoes || "");
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase.from("agendamentos").update({
      status: editStatus,
      observacoes: editObs || null,
      updated_at: new Date().toISOString(),
    } as any).eq("id", selected.id);
    if (error) toast.error(error.message);
    else { toast.success("Agendamento atualizado!"); setSelected(null); fetchData(); }
    setSaving(false);
  };

  const filtered = agendamentos.filter((a: any) => {
    if (filterDate) return a.data === filterDate;
    return true;
  });

  const statusColor = (s: string) => {
    if (s === "confirmado" || s === "concluido") return "bg-primary/10 text-primary";
    if (s === "cancelado") return "bg-destructive/10 text-destructive";
    if (s === "em_andamento") return "bg-accent/20 text-accent-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Agenda Banho & Tosa</h1>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="pl-10" />
        </div>
        <Button variant="outline" onClick={() => setFilterDate("")}>Todos</Button>
        <Button variant="outline" onClick={() => setFilterDate(format(new Date(), "yyyy-MM-dd"))}>Hoje</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-10">Carregando...</p>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-10">Nenhum agendamento para esta data.</p>
          )}
          {filtered.map((a: any) => (
            <div key={a.id} onClick={() => openDetails(a)} className="bg-card rounded-xl border p-4 flex items-center gap-4 cursor-pointer hover:shadow-sm transition-shadow">
              <div className="w-12 h-12 rounded-full gradient-pet flex items-center justify-center text-primary-foreground font-bold text-sm">
                {a.horario}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{servicos[a.servico_id || ""] || "Serviço"}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColor(a.status)}`}>{a.status.replace("_", " ")}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  🐾 {pets[a.pet_id] || "Pet"} • 👤 {profiles[a.user_id] || "Cliente"}
                  {a.forma_pagamento && <> • 💳 {a.forma_pagamento.replace("_", " ")}</>}
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                {format(new Date(a.data + "T12:00:00"), "dd/MM/yyyy")}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={v => !v && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agendamento</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Cliente:</span> {profiles[selected.user_id]}</div>
                <div><span className="text-muted-foreground">Pet:</span> {pets[selected.pet_id]}</div>
                <div><span className="text-muted-foreground">Serviço:</span> {servicos[selected.servico_id || ""] || "—"}</div>
                <div><span className="text-muted-foreground">Horário:</span> {selected.horario}</div>
                <div><span className="text-muted-foreground">Data:</span> {format(new Date(selected.data + "T12:00:00"), "dd/MM/yyyy")}</div>
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
                <Button onClick={handleUpdate} disabled={saving}>{saving ? "Salvando..." : "Atualizar"}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
