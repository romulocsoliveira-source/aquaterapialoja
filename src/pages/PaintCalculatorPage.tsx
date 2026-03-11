import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Calculator, ShoppingBag, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";

const paintTypes = [
  { id: "acrilica", label: "Tinta Acrílica", yield: 6 },
  { id: "latex", label: "Tinta Látex", yield: 8 },
  { id: "esmalte", label: "Esmalte Sintético", yield: 10 },
  { id: "verniz", label: "Verniz", yield: 12 },
  { id: "textura", label: "Textura", yield: 3 },
];

export default function PaintCalculatorPage() {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [walls, setWalls] = useState("4");
  const [paintType, setPaintType] = useState("acrilica");
  const [coats, setCoats] = useState("2");
  const [result, setResult] = useState<{ liters: number; cans18: number; cans36: number } | null>(null);

  const calculate = () => {
    const w = parseFloat(width);
    const h = parseFloat(height);
    const n = parseInt(walls);
    const c = parseInt(coats);
    const pt = paintTypes.find(p => p.id === paintType);
    if (!w || !h || !n || !pt) return;

    const area = w * h * n;
    const liters = (area / pt.yield) * c;
    setResult({
      liters: Math.ceil(liters * 10) / 10,
      cans18: Math.ceil(liters / 18),
      cans36: Math.ceil(liters / 3.6),
    });
  };

  return (
    <>
      <Helmet>
        <title>Calculadora de Tinta | Almoxarifado das Tintas</title>
        <meta name="description" content="Calcule a quantidade exata de tinta para seu projeto. Informe as medidas e descubra quantos litros você precisa." />
      </Helmet>

      <section className="container py-12 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="text-xs font-body uppercase tracking-[0.3em] text-accent">Ferramenta Útil</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-2">Calculadora de Tinta</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Informe as medidas do seu ambiente e descubra a quantidade ideal de tinta.</p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-lg">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <Label className="text-sm font-semibold">Largura da parede (m)</Label>
                <Input type="number" step="0.1" placeholder="Ex: 4.5" value={width} onChange={e => setWidth(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-semibold">Altura da parede (m)</Label>
                <Input type="number" step="0.1" placeholder="Ex: 2.8" value={height} onChange={e => setHeight(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-semibold">Quantidade de paredes</Label>
                <Select value={walls} onValueChange={setWalls}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <SelectItem key={n} value={String(n)}>{n} parede{n > 1 ? "s" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold">Demãos</Label>
                <Select value={coats} onValueChange={setCoats}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3].map(n => (
                      <SelectItem key={n} value={String(n)}>{n} demão{n > 1 ? "s" : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm font-semibold">Tipo de tinta</Label>
                <Select value={paintType} onValueChange={setPaintType}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {paintTypes.map(pt => (
                      <SelectItem key={pt.id} value={pt.id}>{pt.label} (rende ~{pt.yield}m²/L)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={calculate} className="w-full mt-6 gradient-gold text-accent-foreground h-12 text-base">
              <Calculator size={18} /> Calcular Quantidade
            </Button>

            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 bg-accent/10 rounded-xl p-6 border border-accent/20">
                <div className="flex items-start gap-3 mb-4">
                  <Info className="text-accent mt-0.5" size={20} />
                  <p className="text-foreground font-semibold">
                    Você precisa de aproximadamente <span className="text-accent text-xl">{result.liters} litros</span> de tinta.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-card rounded-lg p-4 text-center border border-border">
                    <p className="text-2xl font-bold text-accent">{result.cans18}</p>
                    <p className="text-xs text-muted-foreground mt-1">Galão(ões) de 18L</p>
                  </div>
                  <div className="bg-card rounded-lg p-4 text-center border border-border">
                    <p className="text-2xl font-bold text-accent">{result.cans36}</p>
                    <p className="text-xs text-muted-foreground mt-1">Lata(s) de 3,6L</p>
                  </div>
                </div>
                <Link to="/">
                  <Button className="w-full gradient-gold text-accent-foreground">
                    <ShoppingBag size={16} /> Comprar Agora
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
