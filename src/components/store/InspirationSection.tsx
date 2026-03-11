import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";

const inspirations = [
  {
    title: "Banho Relaxante",
    desc: "Cuidado completo",
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=500&h=600&fit=crop",
  },
  {
    title: "Tosa Profissional",
    desc: "Estilo e saúde",
    image: "https://images.unsplash.com/photo-1591160690555-5debfba0c36a?w=500&h=600&fit=crop",
  },
  {
    title: "Hotel Confortável",
    desc: "Seu pet em boas mãos",
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&h=600&fit=crop",
  },
  {
    title: "Produtos Premium",
    desc: "Qualidade garantida",
    image: "https://images.unsplash.com/photo-1583337130417-13571f7aa56b?w=500&h=600&fit=crop",
  },
];

export default function InspirationSection() {
  return (
    <section className="container py-16 md:py-24">
      <div className="text-center mb-12">
        <span className="text-xs font-body uppercase tracking-[0.3em] text-primary">Conheça</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Nosso Espaço</h2>
        <p className="text-muted-foreground mt-2">Um ambiente preparado para o bem-estar do seu pet</p>
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
            <Link to="/agendamento" className="group relative block overflow-hidden rounded-xl aspect-[3/4]">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-body text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                <span className="text-xs text-primary font-medium">{item.desc}</span>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-primary text-primary-foreground p-2 rounded-full">
                  <Eye size={14} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link to="/agendamento" className="inline-flex items-center gap-2 px-6 py-3 gradient-pet text-primary-foreground rounded-full font-semibold text-sm hover:scale-105 transition-transform glow-gold">
          Agendar Banho & Tosa
        </Link>
      </div>
    </section>
  );
}
