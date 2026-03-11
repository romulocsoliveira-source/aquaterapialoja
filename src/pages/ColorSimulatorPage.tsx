import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Paintbrush, RotateCcw, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Room {
  id: string;
  label: string;
  image: string;
  wallMask: string; // SVG path(s) defining wall areas only
}

const rooms: Room[] = [
  {
    id: "sala",
    label: "Sala de Estar",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=500&fit=crop",
    // Mask covers back wall and side walls, leaving sofa, floor, furniture, windows untouched
    wallMask: "M0,0 L800,0 L800,320 L600,320 L600,200 L550,200 L550,320 L250,320 L250,200 L200,200 L200,320 L0,320 Z",
  },
  {
    id: "quarto",
    label: "Quarto",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=500&fit=crop",
    // Mask covers wall behind bed, leaving bed, nightstands, floor
    wallMask: "M0,0 L800,0 L800,280 L0,280 Z",
  },
  {
    id: "cozinha",
    label: "Cozinha",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=500&fit=crop",
    // Mask covers upper wall area, leaving cabinets, counters, appliances
    wallMask: "M0,0 L800,0 L800,200 L600,200 L600,180 L200,180 L200,200 L0,200 Z",
  },
  {
    id: "fachada",
    label: "Fachada",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop",
    // Mask covers facade walls, leaving windows, doors, roof, garden
    wallMask: "M50,60 L350,60 L350,380 L50,380 Z M400,60 L750,60 L750,380 L400,380 Z",
  },
];

const colorPalette = [
  { name: "Branco Neve", hex: "#F5F5F0" },
  { name: "Marfim", hex: "#FFFFF0" },
  { name: "Pérola", hex: "#EAE0C8" },
  { name: "Areia", hex: "#D2B48C" },
  { name: "Terracota", hex: "#CC4E00" },
  { name: "Vermelho Clássico", hex: "#C41E3A" },
  { name: "Azul Serenidade", hex: "#6A9BD2" },
  { name: "Azul Marinho", hex: "#003366" },
  { name: "Verde Menta", hex: "#98FF98" },
  { name: "Verde Floresta", hex: "#228B22" },
  { name: "Amarelo Sol", hex: "#FFD700" },
  { name: "Laranja Vibrante", hex: "#FF6B00" },
  { name: "Rosa Quartzo", hex: "#F7CAC9" },
  { name: "Lilás Suave", hex: "#C8A2C8" },
  { name: "Cinza Urbano", hex: "#808080" },
  { name: "Grafite", hex: "#383838" },
  { name: "Bege Natural", hex: "#D4C5A9" },
  { name: "Cappuccino", hex: "#A67B5B" },
  { name: "Lavanda", hex: "#B57EDC" },
  { name: "Turquesa", hex: "#40E0D0" },
];

export default function ColorSimulatorPage() {
  const [selectedRoom, setSelectedRoom] = useState(rooms[0]);
  const [selectedColor, setSelectedColor] = useState(colorPalette[0]);

  return (
    <>
      <Helmet>
        <title>Simulador de Cores | Almoxarifado das Tintas</title>
        <meta name="description" content="Simule cores nas paredes do seu ambiente. Escolha o cômodo e a cor ideal para sua casa." />
      </Helmet>

      <section className="container py-12 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <span className="text-xs font-body uppercase tracking-[0.3em] text-accent">Ferramenta Interativa</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-2">Simulador de Cores</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Escolha um ambiente e veja como ficaria com a cor que você deseja. A cor é aplicada apenas nas paredes!</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Preview */}
          <div className="lg:col-span-2">
            <motion.div
              key={selectedRoom.id + selectedColor.hex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative rounded-2xl overflow-hidden aspect-video shadow-2xl border border-border"
            >
              {/* Base image */}
              <img src={selectedRoom.image} alt={selectedRoom.label} className="w-full h-full object-cover" />
              
              {/* Color overlay applied ONLY to wall areas via SVG clip-path */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 500" preserveAspectRatio="none">
                <defs>
                  <clipPath id={`wall-mask-${selectedRoom.id}`}>
                    <path d={selectedRoom.wallMask} />
                  </clipPath>
                </defs>
                <rect
                  x="0" y="0" width="800" height="500"
                  fill={selectedColor.hex}
                  opacity="0.45"
                  clipPath={`url(#wall-mask-${selectedRoom.id})`}
                  style={{ mixBlendMode: "multiply", transition: "fill 0.5s ease" }}
                />
              </svg>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="bg-background/90 backdrop-blur-md rounded-lg px-4 py-2 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-border" style={{ backgroundColor: selectedColor.hex }} />
                  <div>
                    <p className="text-sm font-semibold">{selectedColor.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedRoom.label}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => setSelectedColor(colorPalette[0])} className="bg-background/90 backdrop-blur-md">
                  <RotateCcw size={14} /> Resetar
                </Button>
              </div>
            </motion.div>

            {/* Room selection */}
            <div className="mt-6 grid grid-cols-4 gap-3">
              {rooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`relative rounded-xl overflow-hidden aspect-video border-2 transition-all ${selectedRoom.id === room.id ? "border-accent glow-gold" : "border-border hover:border-accent/50"}`}
                >
                  <img src={room.image} alt={room.label} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <span className="absolute bottom-1.5 left-2 text-xs font-semibold">{room.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-2 mb-6">
              <Paintbrush className="text-accent" size={20} />
              <h2 className="font-display text-xl font-bold">Paleta de Cores</h2>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {colorPalette.map(color => (
                <button
                  key={color.hex}
                  onClick={() => setSelectedColor(color)}
                  className={`group relative aspect-square rounded-lg border-2 transition-all hover:scale-110 ${selectedColor.hex === color.hex ? "border-accent ring-2 ring-accent/30 scale-110" : "border-border"}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                >
                  {selectedColor.hex === color.hex && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-foreground/80 border border-background" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="bg-secondary rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold mb-1">Cor selecionada</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg border border-border" style={{ backgroundColor: selectedColor.hex }} />
                <div>
                  <p className="font-body font-bold text-foreground">{selectedColor.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedColor.hex}</p>
                </div>
              </div>
            </div>

            <Link to="/catalogo-cores">
              <Button className="w-full gradient-gold text-accent-foreground mb-3">
                <Paintbrush size={16} /> Ver Catálogo Completo
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full">
                <ShoppingBag size={16} /> Comprar Tinta nesta Cor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
