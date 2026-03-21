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
    <section className="gradient-dark overflow-hidden">
      <div className="container py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
            <span className="text-[11px] font-body uppercase tracking-[0.3em] text-brand-gold-light font-semibold">Sobre a {storeName}</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold leading-snug text-white">
              Excelência no cuidado
              <span className="block text-brand-gold-light mt-1">que faz a diferença.</span>
            </h2>
            <p className="text-white/55 font-body leading-relaxed">
              A {storeName} nasceu do compromisso com a qualidade. Oferecemos uma seleção curada de produtos premium para cães, gatos, peixes e pequenos animais — sempre com as melhores marcas e atendimento humanizado.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              {features.map(item => (
                <div key={item.label} className="flex items-start gap-3 p-4 rounded-xl bg-primary-foreground/[0.04] border border-primary-foreground/[0.07]">
                  <div className="w-10 h-10 rounded-lg gradient-brand-gold flex items-center justify-center flex-shrink-0">
                    <item.icon size={18} className="text-black" />
                  </div>
                  <div>
                    <span className="font-body text-sm font-semibold text-white/90 block">{item.label}</span>
                    <span className="text-xs text-white/40 font-body">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative flex items-center justify-center">
            <div className="absolute -inset-8 bg-brand-gold/5 rounded-full blur-3xl" />
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="relative w-64 md:w-80 h-auto object-contain drop-shadow-2xl" />
            ) : (
              <div className="relative w-64 md:w-80 aspect-square rounded-3xl gradient-brand flex items-center justify-center">
                <span className="font-display text-5xl font-bold text-white/80">{storeName.charAt(0)}</span>
              </div>
            )}
            <div className="absolute -bottom-4 -left-4 bg-card rounded-xl p-4 border border-border/60 shadow-premium">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-brand-gold flex items-center justify-center">
                  <Award size={18} className="text-black" />
                </div>
                <div>
                  <p className="font-body text-sm font-bold text-black">+500 Produtos</p>
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
