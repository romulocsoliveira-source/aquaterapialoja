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
    <section className="relative overflow-hidden min-h-[520px] md:min-h-[600px] lg:min-h-[700px]">
      {/* Full background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt={`${storeName} - Produtos Premium para Pets`}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
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

            <h1 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.05] tracking-tight text-white">
              Tudo para o bem-estar
              <span className="block text-brand-gold-light mt-2">do seu melhor amigo.</span>
            </h1>

            <p className="text-white/60 font-body text-base md:text-lg max-w-lg leading-relaxed">
              Produtos das melhores marcas para cães, gatos, peixes, aves, roedores e muito mais. Atendimento especializado e entrega rápida em Assis e região.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to={firstCat ? `/categoria/${firstCat.slug}` : "/categoria/promocoes"}>
                <Button className="gradient-brand-gold text-black font-body font-semibold tracking-wide h-12 px-8 text-sm shadow-gold hover:opacity-90 transition-opacity rounded-xl">
                  Explorar Produtos <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Link to="/categoria/promocoes">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-body font-semibold tracking-wide h-12 px-8 text-sm rounded-xl backdrop-blur-sm">
                  Ver Ofertas
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="relative z-10 border-t border-white/[0.08] bg-black/40 backdrop-blur-sm">
        <div className="container py-4 grid grid-cols-3 gap-4">
          {[
            { icon: ShieldCheck, text: "Marcas Confiáveis" },
            { icon: Truck, text: "Entrega Rápida" },
            { icon: Droplets, text: "Cuidado Premium" },
          ].map(item => (
            <div key={item.text} className="flex items-center justify-center gap-2 text-white/45 text-xs md:text-sm font-body">
              <item.icon size={15} className="text-brand-gold-light" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
