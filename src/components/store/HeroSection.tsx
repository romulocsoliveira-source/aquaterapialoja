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
    <section className="relative overflow-hidden bg-card">
      <div className="container py-8 md:py-14 lg:py-16">
        <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-5 text-center md:text-left order-2 md:order-1"
          >
            <span className="inline-flex items-center gap-2 text-[11px] font-body uppercase tracking-[0.2em] font-semibold text-accent">
              <Heart size={12} className="fill-accent" /> Pet Shop Premium
            </span>

            <h1 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-bold leading-[1.15] text-foreground">
              Tudo para o bem-estar
              <span className="block text-primary mt-1">do seu melhor amigo.</span>
            </h1>

            <p className="text-muted-foreground font-body text-sm md:text-[15px] max-w-md leading-relaxed mx-auto md:mx-0">
              Produtos das melhores marcas para cães, gatos, peixes, aves, roedores e muito mais. Qualidade e carinho com entrega rápida em Assis e região.
            </p>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-1">
              <Link to={firstCat ? `/categoria/${firstCat.slug}` : "/categoria/promocoes"}>
                <Button className="bg-accent text-accent-foreground font-body font-semibold tracking-wide h-12 px-7 text-sm hover:bg-accent/90 transition-all duration-200 rounded-xl shadow-gold">
                  Explorar Produtos <ArrowRight size={15} className="ml-2" />
                </Button>
              </Link>
              <Link to="/categoria/promocoes">
                <Button variant="outline" className="border-border text-foreground hover:bg-secondary font-body font-medium h-12 px-7 text-sm rounded-xl transition-all duration-200">
                  Ver Ofertas
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="order-1 md:order-2"
          >
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-premium">
              <img
                src={heroImage}
                alt={`${storeName} - Produtos para cães, gatos, peixes, aves, roedores`}
                className="w-full h-[240px] md:h-[380px] lg:h-[420px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="border-t border-border bg-secondary/50">
        <div className="container py-3.5 grid grid-cols-3 gap-4">
          {[
            { icon: ShieldCheck, text: "Marcas Confiáveis" },
            { icon: Truck, text: "Entrega Rápida" },
            { icon: Heart, text: "Cuidado Real" },
          ].map(item => (
            <div key={item.text} className="flex items-center justify-center gap-2 text-muted-foreground text-[11px] md:text-xs font-body">
              <item.icon size={14} className="text-primary" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
