import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, Calendar, PawPrint, Loader2, CheckCircle2, Star, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";
import PaymentMethodSelector from "@/components/shared/PaymentMethodSelector";

const EXTRAS = [
  { id: "banho", label: "Banho diário", preco: 35 },
  { id: "passeio", label: "Passeio 2x ao dia", preco: 25 },
  { id: "racao_premium", label: "Ração premium", preco: 20 },
  { id: "medicacao", label: "Administração de medicação", preco: 15 },
  { id: "webcam", label: "Acesso webcam 24h", preco: 10 },
];

const accomIcons: Record<string, typeof Star> = {
  Standard: PawPrint,
  VIP: Star,
  "Suíte Premium": Wind,
};

export default function HotelPetPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [acomodacoes, setAcomodacoes] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [selectedAcom, setSelectedAcom] = useState<string>("");
  const [selectedPet, setSelectedPet] = useState<string>("");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [extras, setExtras] = useState<string[]>([]);
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data: acoms } = await supabase.from("acomodacoes_hotel").select("*").eq("ativo", true).order("preco_diaria");
      setAcomodacoes((acoms as any[]) || []);
      if (user) {
        const { data: userPets } = await supabase.from("pets").select("*").eq("user_id", user.id);
        setPets((userPets as any[]) || []);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const days = useMemo(() => {
    if (!checkin || !checkout) return 0;
    const d = differenceInDays(new Date(checkout + "T12:00:00"), new Date(checkin + "T12:00:00"));
    return d > 0 ? d : 0;
  }, [checkin, checkout]);

  const selectedAcomData = acomodacoes.find((a: any) => a.id === selectedAcom);
  const extrasTotal = extras.reduce((sum, id) => sum + (EXTRAS.find(e => e.id === id)?.preco || 0), 0);
  const totalDiaria = (selectedAcomData ? Number(selectedAcomData.preco_diaria) : 0) + extrasTotal;
  const totalFinal = totalDiaria * days;

  const toggleExtra = (id: string) => {
    setExtras(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
  };

  const handleReservar = async () => {
    if (!user) { toast.error("Faça login para reservar"); navigate("/conta"); return; }
    if (!selectedPet) { toast.error("Selecione um pet"); return; }
    if (!selectedAcom) { toast.error("Selecione uma acomodação"); return; }
    if (!checkin || !checkout || days < 1) { toast.error("Selecione datas válidas (mínimo 1 dia)"); return; }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("reservas_hotel").insert({
        user_id: user.id,
        pet_id: selectedPet,
        acomodacao_id: selectedAcom,
        checkin,
        checkout,
        servicos_extras: extras,
        observacoes,
        valor_total: totalFinal,
        status: "pendente",
      } as any);

      if (error) throw error;
      setSuccess(true);
      toast.success("Reserva criada com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar reserva");
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = format(new Date(), "yyyy-MM-dd");

  if (success) {
    return (
      <div className="container py-16 max-w-lg text-center">
        <div className="bg-card rounded-2xl border p-8">
          <div className="w-20 h-20 rounded-full gradient-pet flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Reserva Criada!</h1>
          <p className="text-muted-foreground text-sm mb-6">Sua reserva no Hotel Pet foi registrada. Entraremos em contato para confirmação.</p>
          <Button className="gradient-pet text-primary-foreground" onClick={() => navigate("/conta")}>Ver Minhas Reservas</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="gradient-pet py-16 md:py-20">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Building2 className="w-12 h-12 text-primary-foreground mx-auto mb-4" />
            <h1 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4">Hotel Pet</h1>
            <p className="text-primary-foreground/80 max-w-lg mx-auto text-lg">Seu pet merece férias também! Hospedagem com conforto, segurança e muito carinho.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container max-w-4xl">
          <h2 className="font-display text-2xl font-bold mb-6 text-center">Escolha a Acomodação</h2>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : acomodacoes.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">Nenhuma acomodação disponível no momento. Entre em contato conosco.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              {acomodacoes.map((a: any) => {
                const Icon = accomIcons[a.nome] || PawPrint;
                const isSelected = selectedAcom === a.id;
                return (
                  <motion.button
                    key={a.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAcom(a.id)}
                    className={`p-6 rounded-2xl border-2 text-left transition-all ${isSelected ? "border-primary bg-primary/5 shadow-ocean" : "border-border bg-card hover:border-primary/40"}`}
                  >
                    <Icon className={`w-8 h-8 mb-3 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <h3 className="font-display text-lg font-bold mb-1">{a.nome}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{a.descricao}</p>
                    <p className="text-2xl font-bold text-primary">
                      R$ {Number(a.preco_diaria).toFixed(2).replace(".", ",")}
                      <span className="text-sm font-normal text-muted-foreground">/diária</span>
                    </p>
                  </motion.button>
                );
              })}
            </div>
          )}

          <div className="bg-card rounded-2xl border p-6 md:p-8 space-y-6">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" /> Dados da Reserva
            </h2>

            {!user && (
              <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 text-sm">
                <button onClick={() => navigate("/conta")} className="text-primary font-medium hover:underline">Faça login</button> para reservar.
              </div>
            )}

            <div>
              <Label>Pet *</Label>
              {pets.length === 0 && user ? (
                <p className="text-sm text-muted-foreground mt-1">
                  Nenhum pet cadastrado. <button onClick={() => navigate("/conta")} className="text-primary hover:underline">Cadastrar pet</button>
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {pets.map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPet(p.id)}
                      className={`p-3 rounded-xl border text-left text-sm transition-all ${selectedPet === p.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                    >
                      <span className="font-medium">🐾 {p.nome}</span>
                      <span className="block text-xs text-muted-foreground">{p.especie} {p.raca ? `• ${p.raca}` : ""}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Check-in *</Label>
                <Input type="date" min={todayStr} value={checkin} onChange={e => { setCheckin(e.target.value); if (checkout && e.target.value >= checkout) setCheckout(""); }} className="mt-1" />
              </div>
              <div>
                <Label>Check-out *</Label>
                <Input type="date" min={checkin || todayStr} value={checkout} onChange={e => setCheckout(e.target.value)} className="mt-1" />
              </div>
            </div>
            {days > 0 && <p className="text-sm text-primary font-medium">📅 {days} diária{days > 1 ? "s" : ""}</p>}

            <div>
              <Label className="mb-3 block">Serviços Extras</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EXTRAS.map(e => (
                  <label key={e.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${extras.includes(e.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}>
                    <Checkbox checked={extras.includes(e.id)} onCheckedChange={() => toggleExtra(e.id)} />
                    <div className="flex-1">
                      <span className="text-sm font-medium">{e.label}</span>
                      <span className="text-xs text-muted-foreground ml-1">+R$ {e.preco.toFixed(2).replace(".", ",")}/dia</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>Observações Especiais</Label>
              <textarea
                className="w-full mt-1 px-4 py-2.5 rounded-lg border border-input bg-background text-sm min-h-[80px]"
                placeholder="Medicamentos, dieta especial, comportamento..."
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
              />
            </div>

            {selectedAcom && days > 0 && (
              <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-sm">
                <h3 className="font-display font-bold text-base mb-3">Resumo da Reserva</h3>
                <div className="flex justify-between"><span className="text-muted-foreground">Acomodação ({selectedAcomData?.nome})</span><span>R$ {Number(selectedAcomData?.preco_diaria).toFixed(2).replace(".", ",")} /dia</span></div>
                {extras.length > 0 && extras.map(id => {
                  const e = EXTRAS.find(x => x.id === id);
                  return e ? <div key={id} className="flex justify-between"><span className="text-muted-foreground">{e.label}</span><span>+R$ {e.preco.toFixed(2).replace(".", ",")} /dia</span></div> : null;
                })}
                <div className="flex justify-between border-t pt-2"><span className="text-muted-foreground">Total por dia</span><span className="font-medium">R$ {totalDiaria.toFixed(2).replace(".", ",")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{days} diária{days > 1 ? "s" : ""}</span></div>
                <div className="flex justify-between border-t pt-2 text-lg font-bold"><span>Total</span><span className="text-primary">R$ {totalFinal.toFixed(2).replace(".", ",")}</span></div>
              </div>
            )}

            <div className="text-xs text-muted-foreground text-center mb-3">
              O pagamento será confirmado na loja ou pelo WhatsApp (18) 99657-0512.
            </div>

            <Button className="w-full gradient-pet text-primary-foreground h-12 font-semibold" onClick={handleReservar} disabled={submitting || !user}>
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : `Confirmar Reserva${totalFinal > 0 ? ` — R$ ${totalFinal.toFixed(2).replace(".", ",")}` : ""}`}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
