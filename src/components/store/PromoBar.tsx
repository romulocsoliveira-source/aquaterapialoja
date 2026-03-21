import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function PromoBar() {
  return (
    <section className="relative overflow-hidden">
      <div className="gradient-brand">
        <div className="container py-10 md:py-14 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-3">
            <span className="text-xs uppercase tracking-[0.3em] text-primary-foreground/70 font-body">Oferta Especial</span>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-primary-foreground">
              Produtos com até 20% OFF
            </h2>
            <p className="text-primary-foreground/80 font-body max-w-md mx-auto text-sm">
              Aproveite descontos exclusivos em produtos selecionados.
            </p>
            <Link to="/categoria/promocoes" className="inline-flex items-center gap-2 bg-card text-foreground font-body font-semibold text-sm tracking-wider px-7 py-2.5 rounded-xl hover:bg-foreground hover:text-background transition-colors mt-3">
              Ver Ofertas <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
