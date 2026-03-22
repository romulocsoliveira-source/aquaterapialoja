import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Truck, Heart } from "lucide-react";
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
    <section className="relative overflow-hidden bg-brand-dark">
      <div className="container relative z-10 py-12 md:py-20 lg:py-24">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6 text-center md:text-left order-2 md:order-1"
          >
            <span className="inline-flex items-center gap-2 text-[11px] font-body uppercase tracking-[0.25em] font-semibold text-accent">
              <Heart size={12} className="fill-accent" /> Cuidado Premium para Pets
            </span>

            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] text-white">
              Tudo para o bem-estar
              <span className="block text-accent mt-1">do seu melhor amigo.</span>
            </h1>

            <p className="text-white/50 font-body text-sm md:text-base max-w-lg leading-relaxed mx-auto md:mx-0">
              Produtos das melhores marcas para cães, gatos, peixes, aves, roedores e muito mais. Qualidade, carinho e entrega rápida em Assis e região.
            </p>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-1">
              <Link to={firstCat ? `/categoria/${firstCat.slug}` : "/categoria/promocoes"}>
                <Button className="gradient-brand-gold text-accent-foreground font-body font-semibold tracking-wide h-12 px-7 text-sm shadow-gold hover:opacity-90 transition-opacity rounded-xl">
                  Explorar Produtos <ArrowRight size={15} className="ml-2" />
                </Button>
              </Link>
              <Link to="/categoria/promocoes">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 font-body font-medium h-12 px-7 text-sm rounded-xl">
                  Ver Ofertas
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-1 md:order-2"
          >
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-premium">
              <img
                src={heroImage}
                alt={`${storeName} - Produtos para cães, gatos, peixes, aves, roedores`}
                className="w-full h-[280px] md:h-[420px] lg:h-[480px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="relative z-10 border-t border-white/[0.08]">
        <div className="container py-4 grid grid-cols-3 gap-4">
          {[
            { icon: ShieldCheck, text: "Marcas Confiáveis" },
            { icon: Truck, text: "Entrega Rápida" },
            { icon: Heart, text: "Cuidado Real" },
          ].map(item => (
            <div key={item.text} className="flex items-center justify-center gap-2 text-white/40 text-[11px] md:text-xs font-body">
              <item.icon size={14} className="text-accent" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
