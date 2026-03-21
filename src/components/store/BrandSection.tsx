import { motion } from "framer-motion";
import { ShieldCheck, Truck, Headphones } from "lucide-react";
import { useStoreConfig } from "@/hooks/useStoreConfig";

export default function BrandSection() {
  const { data: storeConfig } = useStoreConfig();
  const storeName = storeConfig?.trade_name || storeConfig?.company_name || "Aquaterapia";

  return (
    <section className="container py-14 md:py-20">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-5">
          <span className="text-xs font-body uppercase tracking-[0.25em] text-primary font-semibold">Sobre Nós</span>
          <h2 className="font-display text-2xl md:text-3xl font-bold leading-snug">
            Qualidade e confiança
            <span className="text-gradient-brand block">para quem ama pets.</span>
          </h2>
          <p className="text-muted-foreground font-body leading-relaxed text-[15px]">
            A {storeName} oferece uma seleção curada de produtos premium para cães, gatos, peixes e pequenos animais. Trabalhamos com as melhores marcas e garantimos a satisfação de cada cliente.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { icon: ShieldCheck, label: "Qualidade", desc: "garantida" },
              { icon: Truck, label: "Entrega", desc: "rápida" },
              { icon: Headphones, label: "Suporte", desc: "dedicado" },
            ].map(item => (
              <div key={item.label} className="text-center">
                <div className="w-10 h-10 rounded-lg bg-primary/[0.08] flex items-center justify-center mx-auto mb-2">
                  <item.icon size={20} className="text-primary" />
                </div>
                <span className="font-body text-sm font-semibold text-foreground block">{item.label}</span>
                <span className="text-xs text-muted-foreground font-body">{item.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
          <div className="absolute inset-0 gradient-brand rounded-2xl opacity-[0.07] blur-2xl" />
          <img
            src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=700&fit=crop"
            alt="Pet feliz"
            className="relative w-full rounded-2xl object-cover aspect-[4/5] border border-border shadow-lg"
            loading="lazy"
          />
        </motion.div>
      </div>
    </section>
  );
}
