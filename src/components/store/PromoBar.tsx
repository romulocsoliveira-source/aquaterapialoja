import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function PromoBar() {
  return (
    <section className="relative overflow-hidden">
      <div className="gradient-gold">
        <div className="container py-12 md:py-16 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="space-y-4">
            <span className="text-xs uppercase tracking-[0.4em] text-primary-foreground/70 font-body">Oferta Exclusiva</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground">
              Até 30% OFF em Tintas
            </h2>
            <p className="text-primary-foreground/80 font-body max-w-md mx-auto">
              Aproveite descontos exclusivos em tintas residenciais, esmaltes e vernizes das melhores marcas.
            </p>
            <Link to="/categoria/promocoes" className="inline-flex items-center gap-2 bg-background text-foreground font-body font-semibold text-sm tracking-wider px-8 py-3 rounded-full hover:bg-foreground hover:text-background transition-colors mt-4">
              Ver Ofertas <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
