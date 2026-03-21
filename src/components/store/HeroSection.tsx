import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
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
    <section className="relative overflow-hidden min-h-[520px] md:min-h-[620px] flex items-center">
      {/* Full background image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt={`${storeName} - Produtos Premium`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-16 md:py-24">
        <div className="max-w-xl">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-6">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 text-[11px] font-body uppercase tracking-[0.3em] text-brand-gold font-semibold"
            >
              ✦ Qualidade Premium
            </motion.span>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight text-primary-foreground">
              Cuidado e qualidade
              <span className="block text-brand-gold-light mt-1">para quem você ama.</span>
            </h1>

            <p className="text-primary-foreground/70 font-body text-base md:text-lg max-w-md leading-relaxed">
              {storeName} — marcas confiáveis, atendimento especializado e tudo para o bem-estar do seu pet.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to={firstCat ? `/categoria/${firstCat.slug}` : "/categoria/promocoes"}>
                <Button className="gradient-brand-gold text-foreground font-body font-semibold tracking-wide h-12 px-8 text-sm shadow-gold hover:opacity-90 transition-opacity rounded-xl">
                  Explorar Produtos <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Link to="/categoria/promocoes">
                <Button variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 font-body font-semibold tracking-wide h-12 px-8 text-sm rounded-xl backdrop-blur-sm">
                  Ver Ofertas
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative bottom curve */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto">
          <path d="M0 60L1440 60L1440 20C1200 0 960 40 720 30C480 20 240 50 0 20L0 60Z" fill="hsl(40, 20%, 97%)" />
        </svg>
      </div>
    </section>
  );
}
