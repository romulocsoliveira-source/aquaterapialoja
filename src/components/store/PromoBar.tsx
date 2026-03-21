import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function PromoBar() {
  return (
    <section className="relative overflow-hidden">
      <div className="gradient-hero">
        <div className="container py-14 md:py-20 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
            <span className="text-[11px] uppercase tracking-[0.3em] text-brand-gold-light font-body font-semibold">✦ Oferta Especial</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground leading-tight">
              Até 20% de desconto
            </h2>
            <p className="text-primary-foreground/60 font-body max-w-md mx-auto text-sm leading-relaxed">
              Produtos selecionados com preços especiais. Aproveite enquanto durar o estoque.
            </p>
            <Link
              to="/categoria/promocoes"
              className="inline-flex items-center gap-2 gradient-brand-gold text-foreground font-body font-semibold text-sm tracking-wider px-8 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-gold mt-2"
            >
              Ver Ofertas <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-light/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl" />
      </div>
    </section>
  );
}
