import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Droplets, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStoreConfig } from "@/hooks/useStoreConfig";
import { useCategories } from "@/hooks/useStoreData";
import heroImage from "@/assets/hero-aquaterapia.jpg";

export default function HeroSection() {
  const { data: storeConfig } = useStoreConfig();
  const { data: categories = [] } = useCategories();
  const storeName = storeConfig?.trade_name || storeConfig?.company_name || "Aquaterapia";
  const firstCat = categories[0];

  return (
    <section className="relative overflow-hidden min-h-[520px] md:min-h-[600px] lg:min-h-[680px]">
      {/* Full background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt={`${storeName} - Produtos Premium`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[hsl(180,30%,6%)]/95 via-[hsl(180,30%,8%)]/75 to-[hsl(180,30%,8%)]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(180,30%,6%)]/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-24 md:py-32 lg:py-40">
        <div className="max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-7">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 text-[11px] font-body uppercase tracking-[0.3em] font-semibold text-brand-gold-light"
            >
              <Droplets size={14} /> Qualidade Premium
            </motion.span>

            <h1 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.05] tracking-tight text-primary-foreground">
              Tudo para o bem-estar
              <span className="block text-brand-gold-light mt-2">do seu melhor amigo.</span>
            </h1>

            <p className="text-primary-foreground/65 font-body text-base md:text-lg max-w-lg leading-relaxed">
              Produtos das melhores marcas, atendimento especializado e entrega rápida em Assis e região. Sua loja de confiança para cães, gatos, peixes e muito mais.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to={firstCat ? `/categoria/${firstCat.slug}` : "/categoria/promocoes"}>
                <Button className="gradient-brand-gold text-foreground font-body font-semibold tracking-wide h-12 px-8 text-sm shadow-gold hover:opacity-90 transition-opacity rounded-xl">
                  Explorar Produtos <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Link to="/categoria/promocoes">
                <Button variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 font-body font-semibold tracking-wide h-12 px-8 text-sm rounded-xl backdrop-blur-sm">
                  Ver Ofertas
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="relative z-10 border-t border-primary-foreground/[0.08]">
        <div className="container py-4 grid grid-cols-3 gap-4">
          {[
            { icon: ShieldCheck, text: "Marcas Confiáveis" },
            { icon: Truck, text: "Entrega Rápida" },
            { icon: Droplets, text: "Cuidado Premium" },
          ].map(item => (
            <div key={item.text} className="flex items-center justify-center gap-2 text-primary-foreground/45 text-xs md:text-sm font-body">
              <item.icon size={15} className="text-brand-gold-light" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom curve */}
      <div className="absolute bottom-0 left-0 right-0 z-0">
        <svg viewBox="0 0 1440 50" fill="none" className="w-full h-auto">
          <path d="M0 50L1440 50L1440 18C1200 0 960 35 720 25C480 15 240 40 0 18L0 50Z" fill="hsl(var(--background))" />
        </svg>
      </div>
    </section>
  );
}
