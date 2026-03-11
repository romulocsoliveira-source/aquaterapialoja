import { motion } from "framer-motion";
import { Paintbrush, Shield, Truck } from "lucide-react";

export default function BrandSection() {
  return (
    <section className="container py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
          <span className="text-xs font-body uppercase tracking-[0.3em] text-accent font-semibold">Sobre Nós</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Qualidade que
            <span className="text-gradient-gold"> transforma ambientes</span>
          </h2>
          <p className="text-muted-foreground font-body leading-relaxed">
            O Almoxarifado das Tintas é referência em tintas e materiais de pintura em Assis e região. Trabalhamos com as melhores marcas do mercado, oferecendo consultoria especializada para que você encontre a tinta ideal para cada projeto.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { icon: Paintbrush, label: "Consultoria", desc: "especializada" },
              { icon: Shield, label: "Garantia", desc: "de fábrica" },
              { icon: Truck, label: "Entrega", desc: "rápida" },
            ].map(item => (
              <div key={item.label} className="text-center">
                <item.icon size={24} className="text-accent mx-auto mb-2" />
                <span className="font-display text-lg font-bold text-foreground block">{item.label}</span>
                <span className="text-xs text-muted-foreground font-body">{item.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
          <div className="absolute inset-0 gradient-gold rounded-3xl opacity-10 blur-2xl" />
          <img
            src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=700&fit=crop"
            alt="Lata de tinta com cores vibrantes"
            className="relative w-full rounded-3xl object-cover aspect-[4/5] border border-border shadow-lg"
            loading="lazy"
          />
        </motion.div>
      </div>
    </section>
  );
}
