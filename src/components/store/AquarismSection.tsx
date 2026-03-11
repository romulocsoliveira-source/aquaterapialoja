import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Fish, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const aquarismCategories = [
  { name: "Aquários", slug: "aquarios", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=500&fit=crop" },
  { name: "Peixes Ornamentais", slug: "peixes-ornamentais", image: "https://images.unsplash.com/photo-1520302519878-3286c63bdddb?w=400&h=500&fit=crop" },
  { name: "Filtros e Bombas", slug: "filtros-bombas", image: "https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=400&h=500&fit=crop" },
  { name: "Plantas Aquáticas", slug: "plantas-aquaticas", image: "https://images.unsplash.com/photo-1509130141534-ae0e0fc085d7?w=400&h=500&fit=crop" },
];

export default function AquarismSection() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-background to-cyan-950/30" />
      <div className="container relative z-10">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 text-xs font-body uppercase tracking-[0.3em] text-cyan-400 border border-cyan-400/30 px-4 py-1.5 rounded-full font-semibold mb-4">
            <Fish size={14} /> Aquarismo
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">
            A Maior Loja de <span className="text-gradient-gold">Aquarismo</span> de Assis
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Aquários, peixes ornamentais, plantas aquáticas, filtros e tudo para montar o aquário dos seus sonhos.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {aquarismCategories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/categoria/${cat.slug}`}
                className="group relative block overflow-hidden rounded-xl aspect-[3/4]"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-950/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-body text-sm font-semibold text-white">{cat.name}</h3>
                  <span className="text-xs text-cyan-300">Ver produtos →</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link to="/categoria/aquarios">
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-body font-semibold tracking-wide h-12 px-8 text-sm hover:opacity-90 transition-opacity">
              Ver Todo o Aquarismo <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
