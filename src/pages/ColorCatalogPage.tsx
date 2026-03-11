import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Search, Paintbrush, ShoppingBag, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const colorFamilies = [
  { name: "Todas", filter: "" },
  { name: "Branco & Neutros", filter: "neutro" },
  { name: "Amarelos", filter: "amarelo" },
  { name: "Laranjas", filter: "laranja" },
  { name: "Vermelhos", filter: "vermelho" },
  { name: "Rosas", filter: "rosa" },
  { name: "Roxos", filter: "roxo" },
  { name: "Azuis", filter: "azul" },
  { name: "Verdes", filter: "verde" },
  { name: "Marrons", filter: "marrom" },
  { name: "Cinzas", filter: "cinza" },
];

const allColors = [
  { name: "Branco Neve", hex: "#F5F5F0", family: "neutro" },
  { name: "Branco Gelo", hex: "#F0F0E8", family: "neutro" },
  { name: "Marfim", hex: "#FFFFF0", family: "neutro" },
  { name: "Pérola", hex: "#EAE0C8", family: "neutro" },
  { name: "Linho", hex: "#FAF0E6", family: "neutro" },
  { name: "Amarelo Sol", hex: "#FFD700", family: "amarelo" },
  { name: "Amarelo Canário", hex: "#FFEF00", family: "amarelo" },
  { name: "Amarelo Mostarda", hex: "#E1AD01", family: "amarelo" },
  { name: "Amarelo Claro", hex: "#FFFACD", family: "amarelo" },
  { name: "Laranja Vibrante", hex: "#FF6B00", family: "laranja" },
  { name: "Laranja Suave", hex: "#FFB347", family: "laranja" },
  { name: "Terracota", hex: "#CC4E00", family: "laranja" },
  { name: "Pêssego", hex: "#FFDAB9", family: "laranja" },
  { name: "Vermelho Clássico", hex: "#C41E3A", family: "vermelho" },
  { name: "Vermelho Rubi", hex: "#9B111E", family: "vermelho" },
  { name: "Bordô", hex: "#800020", family: "vermelho" },
  { name: "Cereja", hex: "#DE3163", family: "vermelho" },
  { name: "Rosa Quartzo", hex: "#F7CAC9", family: "rosa" },
  { name: "Rosa Antigo", hex: "#C08081", family: "rosa" },
  { name: "Rosa Blush", hex: "#F2D2D5", family: "rosa" },
  { name: "Fúcsia", hex: "#FF00FF", family: "rosa" },
  { name: "Lilás Suave", hex: "#C8A2C8", family: "roxo" },
  { name: "Lavanda", hex: "#B57EDC", family: "roxo" },
  { name: "Uva", hex: "#6F2DA8", family: "roxo" },
  { name: "Ametista", hex: "#9966CC", family: "roxo" },
  { name: "Azul Serenidade", hex: "#6A9BD2", family: "azul" },
  { name: "Azul Marinho", hex: "#003366", family: "azul" },
  { name: "Azul Céu", hex: "#87CEEB", family: "azul" },
  { name: "Turquesa", hex: "#40E0D0", family: "azul" },
  { name: "Azul Petróleo", hex: "#004953", family: "azul" },
  { name: "Verde Menta", hex: "#98FF98", family: "verde" },
  { name: "Verde Floresta", hex: "#228B22", family: "verde" },
  { name: "Verde Oliva", hex: "#808000", family: "verde" },
  { name: "Verde Água", hex: "#66CDAA", family: "verde" },
  { name: "Verde Eucalipto", hex: "#5F8A64", family: "verde" },
  { name: "Cappuccino", hex: "#A67B5B", family: "marrom" },
  { name: "Chocolate", hex: "#7B3F00", family: "marrom" },
  { name: "Caramelo", hex: "#FFD59A", family: "marrom" },
  { name: "Bege Natural", hex: "#D4C5A9", family: "marrom" },
  { name: "Cinza Urbano", hex: "#808080", family: "cinza" },
  { name: "Grafite", hex: "#383838", family: "cinza" },
  { name: "Cinza Claro", hex: "#D3D3D3", family: "cinza" },
  { name: "Chumbo", hex: "#6E6E6E", family: "cinza" },
];

export default function ColorCatalogPage() {
  const [activeFamily, setActiveFamily] = useState("");
  const [search, setSearch] = useState("");
  const [selectedColor, setSelectedColor] = useState<typeof allColors[0] | null>(null);

  const filtered = allColors.filter(c => {
    if (activeFamily && c.family !== activeFamily) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <Helmet>
        <title>Catálogo de Cores | Almoxarifado das Tintas</title>
        <meta name="description" content="Explore nosso catálogo completo de cores para tintas. Encontre a cor perfeita para seu projeto." />
      </Helmet>

      <section className="container py-12 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="text-xs font-body uppercase tracking-[0.3em] text-accent">Explore</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-2">Catálogo de Cores</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Encontre a cor perfeita para transformar seus ambientes.</p>
        </motion.div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar cor pelo nome..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-card border border-border text-foreground pl-12 pr-4 py-3 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        </div>

        {/* Family filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {colorFamilies.map(f => (
            <button
              key={f.name}
              onClick={() => setActiveFamily(f.filter)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeFamily === f.filter ? "gradient-gold text-accent-foreground" : "bg-card border border-border text-foreground hover:border-accent/50"}`}
            >
              {f.name}
            </button>
          ))}
        </div>

        {/* Color grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
          {filtered.map((color, i) => (
            <motion.button
              key={color.hex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => setSelectedColor(color)}
              className={`group relative aspect-square rounded-xl border-2 transition-all hover:scale-110 hover:shadow-lg ${selectedColor?.hex === color.hex ? "border-accent ring-2 ring-accent/30 scale-110" : "border-border"}`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-medium text-muted-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                {color.name}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Selected color detail */}
        {selectedColor && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-16 max-w-lg mx-auto bg-card rounded-2xl border border-border p-6 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl border-2 border-border shadow-md" style={{ backgroundColor: selectedColor.hex }} />
              <div>
                <h3 className="font-display text-xl font-bold">{selectedColor.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedColor.hex}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link to="/simulador-cores" className="flex-1">
                <Button variant="outline" className="w-full"><Palette size={16} /> Simular Ambiente</Button>
              </Link>
              <Link to="/" className="flex-1">
                <Button className="w-full gradient-gold text-accent-foreground"><ShoppingBag size={16} /> Comprar</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </section>
    </>
  );
}
