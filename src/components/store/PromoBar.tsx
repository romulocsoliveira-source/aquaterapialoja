import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function PromoBar() {
  return (
    <section className="relative overflow-hidden bg-primary">
      <div className="container py-10 md:py-14 relative z-10">
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-4 text-center md:text-left">
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-primary-foreground/70 font-body font-semibold">
              <Sparkles size={13} /> Oferta Especial
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-primary-foreground leading-tight">
              Até <span className="text-accent">20% off</span> em produtos selecionados
            </h2>
            <p className="text-primary-foreground/60 font-body max-w-md text-sm leading-relaxed mx-auto md:mx-0">
              Aproveite condições exclusivas enquanto durar o estoque. Produtos das melhores marcas com preços imperdíveis.
            </p>
            <Link
              to="/categoria/promocoes"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-body font-semibold text-sm tracking-wide px-6 py-3 rounded-xl hover:bg-accent/90 transition-all duration-200 shadow-gold"
            >
              Ver Ofertas <ArrowRight size={14} />
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="hidden md:flex justify-end">
            <div className="relative">
              <div className="w-44 h-44 rounded-full border-2 border-primary-foreground/15 flex items-center justify-center">
                <div className="w-28 h-28 rounded-full border border-primary-foreground/10 flex items-center justify-center">
                  <div className="text-center">
                    <span className="font-display text-4xl font-bold text-accent block">20%</span>
                    <span className="text-primary-foreground/50 font-body text-xs uppercase tracking-widest">desconto</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-gold">
                <Sparkles size={16} className="text-accent-foreground" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
