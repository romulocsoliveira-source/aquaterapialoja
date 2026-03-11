import { motion } from "framer-motion";
import { PawPrint, Shield, Heart } from "lucide-react";

export default function BrandSection() {
  return (
    <section className="container py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
          <span className="text-xs font-body uppercase tracking-[0.3em] text-primary font-semibold">Sobre Nós</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Cuidamos com
            <span className="text-gradient-gold"> amor e dedicação</span>
          </h2>
          <p className="text-muted-foreground font-body leading-relaxed">
            A Aquaterapia é referência em cuidado animal e aquarismo em Assis e região. Oferecemos serviços de banho e tosa, hotel pet, a maior variedade de aquários e peixes ornamentais, e uma linha completa de produtos premium.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { icon: PawPrint, label: "Profissionais", desc: "qualificados" },
              { icon: Shield, label: "Segurança", desc: "total" },
              { icon: Heart, label: "Amor", desc: "pelos pets" },
            ].map(item => (
              <div key={item.label} className="text-center">
                <item.icon size={24} className="text-primary mx-auto mb-2" />
                <span className="font-display text-lg font-bold text-foreground block">{item.label}</span>
                <span className="text-xs text-muted-foreground font-body">{item.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
          <div className="absolute inset-0 gradient-pet rounded-3xl opacity-10 blur-2xl" />
          <img
            src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=700&fit=crop"
            alt="Cachorro feliz no pet shop"
            className="relative w-full rounded-3xl object-cover aspect-[4/5] border border-border shadow-lg"
            loading="lazy"
          />
        </motion.div>
      </div>
    </section>
  );
}
