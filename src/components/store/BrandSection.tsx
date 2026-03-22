import { motion } from "framer-motion";
import { ShieldCheck, Truck, Headphones, Award } from "lucide-react";
import { useStoreConfig } from "@/hooks/useStoreConfig";

export default function BrandSection() {
  const { data: storeConfig } = useStoreConfig();
  const storeName = storeConfig?.trade_name || storeConfig?.company_name || "Aquaterapia";
  const logoUrl = storeConfig?.logo_url;

  const features = [
    { icon: ShieldCheck, label: "Qualidade", desc: "Marcas premium e confiáveis" },
    { icon: Truck, label: "Entrega", desc: "Rápida para Assis e região" },
    { icon: Award, label: "Garantia", desc: "Satisfação assegurada" },
    { icon: Headphones, label: "Suporte", desc: "Atendimento especializado" },
  ];

  return (
    <section className="bg-secondary/50">
      <div className="container py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-5">
            <span className="text-[11px] font-body uppercase tracking-[0.25em] text-primary font-semibold">Sobre a {storeName}</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold leading-snug text-foreground">
              Excelência no cuidado
              <span className="block text-primary mt-1">que faz a diferença.</span>
            </h2>
            <p className="text-muted-foreground font-body leading-relaxed text-sm">
              A {storeName} nasceu do compromisso com a qualidade. Oferecemos uma seleção curada de produtos premium para cães, gatos, peixes e pequenos animais — sempre com as melhores marcas e atendimento humanizado.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {features.map(item => (
                <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:shadow-elegant transition-shadow">
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

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative flex items-center justify-center">
            {logoUrl ? (
              <div className="bg-brand-dark rounded-3xl p-10 shadow-premium">
                <img src={logoUrl} alt={storeName} className="w-56 md:w-72 h-auto object-contain" />
              </div>
            ) : (
              <div className="w-56 md:w-72 aspect-square rounded-3xl gradient-brand flex items-center justify-center">
                <span className="font-display text-5xl font-bold text-primary-foreground/80">{storeName.charAt(0)}</span>
              </div>
            )}
            <div className="absolute -bottom-4 -right-4 bg-card rounded-xl p-4 border border-border shadow-premium">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-brand-gold flex items-center justify-center">
                  <Award size={18} className="text-accent-foreground" />
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
