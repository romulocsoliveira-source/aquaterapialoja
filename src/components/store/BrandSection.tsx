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
    <section className="bg-background">
      <div className="container py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-4">
            <span className="text-[11px] font-body uppercase tracking-[0.2em] text-accent font-semibold">Sobre a {storeName}</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold leading-snug text-foreground">
              Excelência no cuidado
              <span className="block text-primary mt-1">que faz a diferença.</span>
            </h2>
            <p className="text-muted-foreground font-body leading-relaxed text-sm">
              A {storeName} nasceu do compromisso com a qualidade. Oferecemos uma seleção curada de produtos premium para cães, gatos, peixes e pequenos animais — sempre com as melhores marcas e atendimento humanizado.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {features.map(item => (
                <div key={item.label} className="flex items-start gap-2.5 p-3.5 rounded-xl bg-card border border-border hover:shadow-elegant transition-all duration-200">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon size={16} className="text-primary" />
                  </div>
                  <div>
                    <span className="font-body text-sm font-semibold text-foreground block">{item.label}</span>
                    <span className="text-[11px] text-muted-foreground font-body">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative flex items-center justify-center">
            {logoUrl ? (
              <div className="bg-brand-dark rounded-2xl p-8 shadow-premium">
                <img src={logoUrl} alt={storeName} className="w-48 md:w-64 h-auto object-contain" />
              </div>
            ) : (
              <div className="w-48 md:w-64 aspect-square rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="font-display text-5xl font-bold text-primary/60">{storeName.charAt(0)}</span>
              </div>
            )}
            <div className="absolute -bottom-3 -right-3 bg-card rounded-xl p-3.5 border border-border shadow-elegant">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                  <Award size={16} className="text-accent-foreground" />
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
