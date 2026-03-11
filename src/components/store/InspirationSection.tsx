import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";

const inspirations = [
  {
    title: "Sala Moderna em Azul Petróleo",
    color: "Azul Petróleo",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=600&fit=crop",
  },
  {
    title: "Quarto Aconchegante em Terracota",
    color: "Terracota",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=500&h=600&fit=crop",
  },
  {
    title: "Cozinha Vibrante em Amarelo",
    color: "Amarelo Sol",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=600&fit=crop",
  },
  {
    title: "Fachada Elegante em Cinza",
    color: "Cinza Urbano",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=600&fit=crop",
  },
];

export default function InspirationSection() {
  return (
    <section className="container py-16 md:py-24">
      <div className="text-center mb-12">
        <span className="text-xs font-body uppercase tracking-[0.3em] text-accent">Ideias</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Inspire-se</h2>
        <p className="text-muted-foreground mt-2">Ambientes reais para inspirar seu próximo projeto</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {inspirations.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to="/catalogo-cores" className="group relative block overflow-hidden rounded-xl aspect-[3/4]">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-body text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                <span className="text-xs text-accent font-medium">{item.color}</span>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-accent text-accent-foreground p-2 rounded-full">
                  <Eye size={14} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link to="/simulador-cores" className="inline-flex items-center gap-2 px-6 py-3 gradient-gold text-accent-foreground rounded-full font-semibold text-sm hover:scale-105 transition-transform glow-gold">
          Simular Cores no seu Ambiente
        </Link>
      </div>
    </section>
  );
}
