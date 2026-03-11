import { useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Calculator, ShoppingBag, FileText, Plus, Minus, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/context/CartContext";
import { useProducts } from "@/hooks/useStoreData";
import { toast } from "sonner";

const surfaceTypes = [
  { id: "nova", label: "Parede Nova", coatMultiplier: 1.2 },
  { id: "pintada", label: "Parede já pintada", coatMultiplier: 1 },
  { id: "reboco", label: "Reboco", coatMultiplier: 1.3 },
  { id: "gesso", label: "Gesso", coatMultiplier: 1.1 },
  { id: "madeira", label: "Madeira", coatMultiplier: 1.4 },
  { id: "metal", label: "Metal", coatMultiplier: 1.5 },
];

const paintTypes = [
  { id: "acrilica", label: "Tinta Acrílica", yield: 6, categorySlug: "tintas-residenciais" },
  { id: "esmalte", label: "Esmalte Sintético", yield: 10, categorySlug: "esmaltes" },
  { id: "externa", label: "Tinta Externa", yield: 5, categorySlug: "tintas-residenciais" },
  { id: "automotiva", label: "Tinta Automotiva", yield: 8, categorySlug: "tintas-automotivas" },
];

interface WallEntry {
  id: number;
  width: string;
  height: string;
}

export default function PaintBudgetPage() {
  const { addItem } = useCart();
  const { data: products = [] } = useProducts();
  const [clientName, setClientName] = useState("");
  const [walls, setWalls] = useState<WallEntry[]>([{ id: 1, width: "", height: "" }]);
  const [hasCeiling, setHasCeiling] = useState(false);
  const [ceilingWidth, setCeilingWidth] = useState("");
  const [ceilingLength, setCeilingLength] = useState("");
  const [surfaceType, setSurfaceType] = useState("pintada");
  const [paintType, setPaintType] = useState("acrilica");
  const [coats, setCoats] = useState("2");
  const [result, setResult] = useState<{
    totalArea: number;
    liters: number;
    cans18: number;
    cans36: number;
    recommended: typeof products;
    estimatedCost: number;
  } | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const addWall = () => setWalls(prev => [...prev, { id: Date.now(), width: "", height: "" }]);
  const removeWall = (id: number) => { if (walls.length > 1) setWalls(prev => prev.filter(w => w.id !== id)); };
  const updateWall = (id: number, field: "width" | "height", value: string) => {
    setWalls(prev => prev.map(w => w.id === id ? { ...w, [field]: value } : w));
  };

  const calculate = () => {
    const pt = paintTypes.find(p => p.id === paintType);
    const st = surfaceTypes.find(s => s.id === surfaceType);
    if (!pt || !st) return;

    let totalArea = 0;
    for (const wall of walls) {
      const w = parseFloat(wall.width);
      const h = parseFloat(wall.height);
      if (w > 0 && h > 0) totalArea += w * h;
    }

    if (hasCeiling) {
      const cw = parseFloat(ceilingWidth);
      const cl = parseFloat(ceilingLength);
      if (cw > 0 && cl > 0) totalArea += cw * cl;
    }

    if (totalArea === 0) { toast.error("Informe as medidas das paredes"); return; }

    const c = parseInt(coats);
    const liters = (totalArea / pt.yield) * c * st.coatMultiplier;
    const cans18 = Math.ceil(liters / 18);
    const cans36 = Math.ceil(liters / 3.6);

    // Find recommended products
    const recommended = products
      .filter(p => p.categorySlug === pt.categorySlug || p.category.toLowerCase().includes(paintType === "esmalte" ? "esmalte" : "tinta"))
      .slice(0, 4);

    const avgPrice = recommended.length > 0
      ? recommended.reduce((s, p) => s + (p.promoPrice || p.price), 0) / recommended.length
      : 189.9;

    setResult({
      totalArea: Math.round(totalArea * 100) / 100,
      liters: Math.ceil(liters * 10) / 10,
      cans18,
      cans36,
      recommended,
      estimatedCost: Math.round(cans18 * avgPrice * 100) / 100,
    });
  };

  const addAllToCart = () => {
    if (!result) return;
    result.recommended.forEach(p => addItem(p));
    toast.success("Produtos adicionados ao carrinho!");
  };

  const generatePDF = () => {
    if (!printRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) { toast.error("Popup bloqueado. Permita popups para gerar o PDF."); return; }

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Orçamento - Almoxarifado das Tintas</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
      .header { text-align: center; border-bottom: 3px solid #EA580C; padding-bottom: 20px; margin-bottom: 30px; }
      .header h1 { color: #EA580C; font-size: 24px; margin: 0; }
      .header p { color: #666; font-size: 12px; margin: 5px 0 0; }
      .info { display: flex; justify-content: space-between; margin-bottom: 30px; }
      .info div { font-size: 13px; }
      .info strong { color: #EA580C; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th { background: #EA580C; color: white; padding: 10px; text-align: left; font-size: 13px; }
      td { padding: 10px; border-bottom: 1px solid #eee; font-size: 13px; }
      .total { text-align: right; font-size: 20px; color: #EA580C; font-weight: bold; margin-top: 20px; }
      .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 11px; color: #999; }
      @media print { body { padding: 20px; } }
    </style></head><body>
      <div class="header">
        <h1>ALMOXARIFADO DAS TINTAS</h1>
        <p>Av. Armando Sales de Oliveira, 173 · Centro · Assis-SP · (18) 3323-1220</p>
        <p style="margin-top:15px; font-size:18px; font-weight:bold;">ORÇAMENTO DE PINTURA</p>
      </div>
      <div class="info">
        <div><strong>Cliente:</strong> ${clientName || "Não informado"}<br/><strong>Data:</strong> ${new Date().toLocaleDateString("pt-BR")}</div>
        <div><strong>Área total:</strong> ${result?.totalArea} m²<br/><strong>Demãos:</strong> ${coats}<br/><strong>Superfície:</strong> ${surfaceTypes.find(s => s.id === surfaceType)?.label}</div>
      </div>
      <h3>Resultado do Cálculo</h3>
      <table>
        <tr><th>Item</th><th>Valor</th></tr>
        <tr><td>Área total a pintar</td><td>${result?.totalArea} m²</td></tr>
        <tr><td>Litros necessários</td><td>${result?.liters} litros</td></tr>
        <tr><td>Galões de 18L</td><td>${result?.cans18} galão(ões)</td></tr>
        <tr><td>Latas de 3,6L</td><td>${result?.cans36} lata(s)</td></tr>
      </table>
      ${result?.recommended && result.recommended.length > 0 ? `
      <h3>Produtos Recomendados</h3>
      <table>
        <tr><th>Produto</th><th>Preço</th></tr>
        ${result.recommended.map(p => `<tr><td>${p.name}</td><td>R$ ${(p.promoPrice || p.price).toFixed(2)}</td></tr>`).join("")}
      </table>` : ""}
      <div class="total">Valor Estimado: R$ ${result?.estimatedCost.toFixed(2)}</div>
      <div class="footer">
        <p>Almoxarifado das Tintas · CNPJ: XX.XXX.XXX/XXXX-XX</p>
        <p>Orçamento válido por 7 dias · Valores sujeitos a alteração</p>
      </div>
    </body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <>
      <Helmet>
        <title>Orçamento de Pintura | Almoxarifado das Tintas</title>
        <meta name="description" content="Faça seu orçamento de pintura online. Calcule área, litros e custo estimado para sua obra." />
      </Helmet>

      <section className="container py-10 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-body uppercase tracking-[0.3em] text-accent border border-accent/30 px-4 py-1.5 rounded-full font-semibold">
              <Calculator size={14} /> Orçamento Profissional
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold">Orçamento de Pintura</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">Calcule a quantidade exata de tinta e receba um orçamento completo com produtos recomendados.</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6">
            {/* Client Name */}
            <div className="space-y-2">
              <Label className="text-sm font-body font-semibold">Nome do Cliente (opcional)</Label>
              <Input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nome do cliente para o orçamento" />
            </div>

            {/* Walls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-body font-semibold">Paredes</Label>
                <Button variant="outline" size="sm" onClick={addWall} className="gap-1 text-xs"><Plus size={14} /> Adicionar Parede</Button>
              </div>
              {walls.map((wall, i) => (
                <div key={wall.id} className="flex items-end gap-3">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground">Parede {i + 1} — Largura (m)</Label>
                    <Input type="number" step="0.01" value={wall.width} onChange={e => updateWall(wall.id, "width", e.target.value)} placeholder="3.5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground">Altura (m)</Label>
                    <Input type="number" step="0.01" value={wall.height} onChange={e => updateWall(wall.id, "height", e.target.value)} placeholder="2.8" />
                  </div>
                  {walls.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeWall(wall.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                      <Minus size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Ceiling */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input type="checkbox" id="ceiling" checked={hasCeiling} onChange={e => setHasCeiling(e.target.checked)} className="accent-accent w-4 h-4" />
                <Label htmlFor="ceiling" className="text-sm font-body font-semibold cursor-pointer">Possui teto para pintar</Label>
              </div>
              {hasCeiling && (
                <div className="flex gap-3 pl-7">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground">Largura do teto (m)</Label>
                    <Input type="number" step="0.01" value={ceilingWidth} onChange={e => setCeilingWidth(e.target.value)} placeholder="4.0" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground">Comprimento (m)</Label>
                    <Input type="number" step="0.01" value={ceilingLength} onChange={e => setCeilingLength(e.target.value)} placeholder="5.0" />
                  </div>
                </div>
              )}
            </div>

            {/* Surface & Paint Type & Coats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-body font-semibold">Tipo de Superfície</Label>
                <Select value={surfaceType} onValueChange={setSurfaceType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{surfaceTypes.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-body font-semibold">Tipo de Tinta</Label>
                <Select value={paintType} onValueChange={setPaintType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{paintTypes.map(p => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-body font-semibold">Demãos</Label>
                <Select value={coats} onValueChange={setCoats}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 demãos</SelectItem>
                    <SelectItem value="3">3 demãos</SelectItem>
                    <SelectItem value="4">4 demãos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={calculate} className="w-full gradient-gold text-primary-foreground font-body font-semibold h-12 text-sm glow-gold">
              <Calculator size={18} className="mr-2" /> Calcular Orçamento
            </Button>
          </div>

          {/* Results */}
          {result && (
            <motion.div ref={printRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-accent/5 border-2 border-accent/30 rounded-2xl p-6 md:p-8 space-y-6">
                <h2 className="font-display text-xl font-bold text-center">Para esta pintura você precisará aproximadamente de:</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Área Total", value: `${result.totalArea} m²` },
                    { label: "Litros de Tinta", value: `${result.liters} L` },
                    { label: "Galões (18L)", value: `${result.cans18}` },
                    { label: "Latas (3,6L)", value: `${result.cans36}` },
                  ].map(item => (
                    <div key={item.label} className="bg-card border border-border rounded-xl p-4 text-center">
                      <p className="text-2xl font-display font-bold text-accent">{item.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>

                {result.recommended.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-body font-semibold text-sm">Produtos Recomendados</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.recommended.map(p => (
                        <div key={p.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
                          <img src={p.image || "/placeholder.svg"} alt={p.name} className="w-14 h-14 rounded-lg object-cover bg-secondary" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.category}</p>
                          </div>
                          <p className="text-sm font-bold text-accent">{formatPrice(p.promoPrice || p.price)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-lg font-display font-bold">Valor Estimado: <span className="text-accent">{formatPrice(result.estimatedCost)}</span></p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={addAllToCart} className="flex-1 gradient-gold text-primary-foreground font-body font-semibold h-12 text-sm glow-gold">
                    <ShoppingBag size={18} className="mr-2" /> Adicionar tudo ao carrinho
                  </Button>
                  <Button onClick={generatePDF} variant="outline" className="flex-1 border-accent text-accent hover:bg-accent/10 font-body font-semibold h-12 text-sm">
                    <FileText size={18} className="mr-2" /> Gerar orçamento em PDF
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </section>
    </>
  );
}
