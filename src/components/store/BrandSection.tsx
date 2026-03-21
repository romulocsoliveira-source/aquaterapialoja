import { motion } from "framer-motion";
import { ShieldCheck, Truck, Headphones, Award } from "lucide-react";
import { useStoreConfig } from "@/hooks/useStoreConfig";

export default function BrandSection() {
  const { data: storeConfig } = useStoreConfig();
  const storeName = storeConfig?.trade_name || storeConfig?.company_name || "Aquaterapia";

  const features = [
    { icon: ShieldCheck, label: "Qualidade", desc: "Marcas premium e confiáveis" },
    { icon: Truck, label: "Entrega", desc: "Rápida para Assis e região" },
    { icon: Award, label: "Garantia", desc: "Satisfação assegurada" },
    { icon: Headphones, label: "Suporte", desc: "Atendimento especializado" },
  ];

  return (
    <section className="bg-foreground/[0.03]">
      <div className="container py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
            <span className="text-[11px] font-body uppercase tracking-[0.3em] text-accent font-semibold">Sobre Nós</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold leading-snug text-foreground">
              Excelência no cuidado
              <span className="block text-primary mt-1">que faz a diferença.</span>
            </h2>
            <p className="text-muted-foreground font-body leading-relaxed">
              A {storeName} nasceu do compromisso com a qualidade. Oferecemos uma seleção curada de produtos premium para cães, gatos, peixes e pequenos animais — sempre com as melhores marcas e atendimento humanizado.
            </p>
            <div className="grid grid-cols-2 gap-5 pt-4">
              {features.map(item => (
                <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/60 shadow-elegant">
                  <div className="w-10 h-10 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
                    <item.icon size={18} className="text-primary-foreground" />
                  </div>
                  <div>
                    <span className="font-body text-sm font-semibold text-foreground block">{item.label}</span>
                    <span className="text-xs text-muted-foreground font-body">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
            <div className="absolute -inset-4 gradient-brand rounded-3xl opacity-[0.06] blur-2xl" />
            <img
              src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=700&fit=crop"
              alt="Cuidado premium com seu pet"
              className="relative w-full rounded-2xl object-cover aspect-[4/5] border border-border/40 shadow-brand-lg"
              loading="lazy"
            />
            <div className="absolute -bottom-4 -left-4 bg-card rounded-xl p-4 border border-border/60 shadow-elegant">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-brand-gold flex items-center justify-center">
                  <Award size={18} className="text-foreground" />
                </div>
                <div>
                  <p className="font-body text-sm font-bold text-foreground">+500 Produtos</p>
                  <p className="text-[11px] text-muted-foreground">Qualidade garantida</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
