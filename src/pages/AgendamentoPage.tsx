import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, Dog, Scissors, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Servico { id: string; nome: string; preco: number; duracao: string; }
interface Pet { id: string; nome: string; especie: string; }

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const today = new Date();
const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(today); d.setDate(d.getDate() + i); return d; });

export default function AgendamentoPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [service, setService] = useState<string | null>(null);
  const [pet, setPet] = useState<string | null>(null);
  const [day, setDay] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [obs, setObs] = useState("");

  useEffect(() => {
    supabase.from("servicos").select("id, nome, preco, duracao").eq("ativo", true).then(({ data }) => setServicos((data as Servico[]) || []));
  }, []);

  useEffect(() => {
    if (user) supabase.from("pets").select("id, nome, especie").eq("user_id", user.id).then(({ data }) => setPets((data as Pet[]) || []));
  }, [user]);

  useEffect(() => {
    if (!day) return;
    const dateStr = day.toISOString().split("T")[0];
    supabase.from("agendamentos").select("horario").eq("data", dateStr).not("status", "eq", "cancelado")
      .then(({ data }) => { setBookedSlots((data || []).map((a: any) => a.horario)); });
    setTime(null);
  }, [day]);

  const handleBook = async () => {
    if (!user) { toast.error("Faça login para agendar"); navigate("/conta"); return; }
    if (!service || !pet || !day || !time) { toast.error("Preencha todos os campos"); return; }

    const dateStr = day.toISOString().split("T")[0];
    const { data: existing } = await supabase.from("agendamentos").select("id").eq("data", dateStr).eq("horario", time).not("status", "eq", "cancelado");
    if (existing && existing.length > 0) {
      toast.error("Este horário já está ocupado. Escolha outro.");
      setBookedSlots(prev => [...prev, time]);
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("agendamentos").insert({
      user_id: user.id,
      pet_id: pet,
      servico_id: service,
      data: dateStr,
      horario: time,
      status: "pendente",
      observacoes: obs || null,
    } as any);
    if (error) toast.error("Erro ao agendar: " + error.message);
    else {
      toast.success("Agendamento realizado com sucesso!");
      const selectedService = servicos.find(s => s.id === service);
      const msg = `Olá! Gostaria de confirmar meu agendamento de ${selectedService?.nome || "serviço"} para o dia ${day.toLocaleDateString("pt-BR")} às ${time}.`;
      window.open(`https://wa.me/5518996570512?text=${encodeURIComponent(msg)}`, "_blank");
      navigate("/conta");
    }
    setLoading(false);
  };

  const selectedService = servicos.find(s => s.id === service);

  return (
    <div className="container py-8 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-10">
          <Scissors className="w-10 h-10 text-primary mx-auto mb-3" />
          <h1 className="font-display text-3xl font-bold">Agendar Banho & Tosa</h1>
          <p className="text-muted-foreground mt-2">Escolha o serviço, pet, data e horário</p>
        </div>

        {!user && (
          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6 text-sm text-center">
            <button onClick={() => navigate("/conta")} className="text-primary font-medium hover:underline">Faça login</button> para agendar.
          </div>
        )}

        {user && (
          <div className="mb-8">
            <label className="text-sm font-medium mb-3 flex items-center gap-2"><Dog className="w-4 h-4" /> Selecione o Pet</label>
            {pets.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum pet cadastrado. <button onClick={() => navigate("/conta")} className="text-primary hover:underline">Cadastre aqui</button></p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {pets.map((p) => (
                  <button key={p.id} onClick={() => setPet(p.id)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${pet === p.id ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50"}`}>
                    {p.especie === "Cão" ? "🐕" : "🐱"} {p.nome}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mb-8">
          <label className="text-sm font-medium mb-3 block">Serviço</label>
          {servicos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum serviço disponível no momento.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {servicos.map((s) => (
                <button key={s.id} onClick={() => setService(s.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${service === s.id ? "border-primary bg-primary/5 shadow-ocean" : "hover:border-primary/50"}`}>
                  <div className="flex justify-between items-start">
                    <div><h3 className="font-medium text-sm">{s.nome}</h3><p className="text-xs text-muted-foreground mt-1">{s.duracao}</p></div>
                    {service === s.id && <Check className="w-4 h-4 text-primary" />}
                  </div>
                  <p className="font-bold mt-2">R$ {Number(s.preco).toFixed(2).replace(".", ",")}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mb-8">
          <label className="text-sm font-medium mb-3 flex items-center gap-2"><Calendar className="w-4 h-4" /> Data</label>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((d) => {
              const isSelected = day?.toDateString() === d.toDateString();
              const weekday = d.toLocaleDateString("pt-BR", { weekday: "short" });
              const isSunday = d.getDay() === 0;
              return (
                <button key={d.toISOString()} onClick={() => !isSunday && setDay(d)} disabled={isSunday}
                  className={`flex-shrink-0 w-16 py-3 rounded-xl border text-center transition-all ${
                    isSunday ? "opacity-40 cursor-not-allowed" :
                    isSelected ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50"
                  }`}>
                  <div className="text-[10px] uppercase">{weekday}</div>
                  <div className="text-lg font-bold">{d.getDate()}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-8">
          <label className="text-sm font-medium mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Horário</label>
          <div className="flex flex-wrap gap-2">
            {timeSlots.map((t) => {
              const isBooked = bookedSlots.includes(t);
              return (
                <button key={t} onClick={() => !isBooked && setTime(t)} disabled={isBooked}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    isBooked ? "opacity-40 cursor-not-allowed line-through bg-muted" :
                    time === t ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50"
                  }`}>
                  {t}
                </button>
              );
            })}
          </div>
          {bookedSlots.length > 0 && day && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Horários riscados já estão ocupados
            </p>
          )}
        </div>

        {user && (
          <div className="mb-8">
            <label className="text-sm font-medium mb-2 block">Observações (opcional)</label>
            <textarea
              className="w-full px-4 py-2.5 rounded-lg border bg-background text-sm min-h-[80px]"
              placeholder="Ex: Meu pet tem medo de secador, alergia a algum produto..."
              value={obs}
              onChange={(e) => setObs(e.target.value)}
            />
          </div>
        )}

        {selectedService && day && time && (
          <div className="bg-card rounded-xl border p-4 mb-6">
            <h3 className="font-medium text-sm mb-2">Resumo do Agendamento</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <span>Serviço: <strong className="text-foreground">{selectedService.nome}</strong></span>
              <span>Valor: <strong className="text-primary">R$ {Number(selectedService.preco).toFixed(2).replace(".", ",")}</strong></span>
              <span>Data: <strong className="text-foreground">{day.toLocaleDateString("pt-BR")}</strong></span>
              <span>Horário: <strong className="text-foreground">{time}</strong></span>
            </div>
          </div>
        )}

        <Button className="w-full gradient-pet text-primary-foreground h-12 font-semibold" onClick={handleBook} disabled={loading}>
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar Agendamento"}
        </Button>
      </motion.div>
    </div>
  );
}
