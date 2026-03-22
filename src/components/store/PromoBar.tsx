import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function PromoBar() {
  return (
    <section className="relative overflow-hidden gradient-dark">
      <div className="container py-14 md:py-20 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-5 text-center md:text-left">
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-accent font-body font-semibold">
              <Sparkles size={13} /> Oferta Especial
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
              Até <span className="text-accent">20% off</span> em produtos selecionados
            </h2>
            <p className="text-white/45 font-body max-w-md text-sm leading-relaxed mx-auto md:mx-0">
              Aproveite condições exclusivas enquanto durar o estoque. Produtos das melhores marcas com preços imperdíveis.
            </p>
            <Link
              to="/categoria/promocoes"
              className="inline-flex items-center gap-2 gradient-brand-gold text-accent-foreground font-body font-semibold text-sm tracking-wider px-7 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-gold"
            >
              Ver Ofertas <ArrowRight size={14} />
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="hidden md:flex justify-end">
            <div className="relative">
              <div className="w-52 h-52 rounded-full border-2 border-accent/20 flex items-center justify-center">
                <div className="w-36 h-36 rounded-full border border-accent/10 flex items-center justify-center">
                  <div className="text-center">
                    <span className="font-display text-5xl font-bold text-accent block">20%</span>
                    <span className="text-white/40 font-body text-xs uppercase tracking-widest">desconto</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full gradient-brand-gold flex items-center justify-center shadow-gold">
                <Sparkles size={18} className="text-accent-foreground" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
