import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function PromoBar() {
  return (
    <section className="relative overflow-hidden">
      <div className="gradient-hero">
        <div className="container py-16 md:py-24 relative z-10">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-5">
              <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-brand-gold-light font-body font-semibold">
                <Sparkles size={13} /> Oferta Especial
              </span>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white leading-tight">
                Até <span className="text-brand-gold-light">20% off</span> em produtos selecionados
              </h2>
              <p className="text-white/55 font-body max-w-md text-sm leading-relaxed">
                Aproveite condições exclusivas enquanto durar o estoque. Produtos das melhores marcas com preços imperdíveis.
              </p>
              <Link
                to="/categoria/promocoes"
                className="inline-flex items-center gap-2 gradient-brand-gold text-black font-body font-semibold text-sm tracking-wider px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity shadow-gold"
              >
                Ver Ofertas <ArrowRight size={14} />
              </Link>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="hidden md:flex justify-end">
              <div className="relative">
                <div className="w-64 h-64 rounded-full border-2 border-brand-gold-light/20 flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border border-brand-gold-light/10 flex items-center justify-center">
                    <div className="text-center">
                      <span className="font-display text-6xl font-bold text-brand-gold-light block">20%</span>
                      <span className="text-white/50 font-body text-sm uppercase tracking-widest">desconto</span>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full gradient-brand-gold flex items-center justify-center shadow-gold">
                  <Sparkles size={24} className="text-black" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-light/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl" />
      </div>
    </section>
  );
}
