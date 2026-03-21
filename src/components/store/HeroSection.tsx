import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStoreConfig } from "@/hooks/useStoreConfig";
import { useCategories } from "@/hooks/useStoreData";

export default function HeroSection() {
  const { data: storeConfig } = useStoreConfig();
  const { data: categories = [] } = useCategories();
  const storeName = storeConfig?.trade_name || storeConfig?.company_name || "Aquaterapia";
  const firstCat = categories[0];

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-background to-accent/[0.04]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

      <div className="container relative z-10 py-16 md:py-28 lg:py-36">
        <div className="max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="space-y-6">
            <span className="inline-flex items-center gap-2 text-xs font-body uppercase tracking-[0.25em] text-primary border border-primary/25 px-4 py-1.5 rounded-full font-semibold bg-primary/[0.05]">
              <Sparkles size={13} /> Qualidade Premium
            </span>

            <h1 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] tracking-tight">
              Tudo para o seu
              <span className="block text-gradient-brand mt-1">pet em um só lugar.</span>
            </h1>

            <p className="text-muted-foreground font-body text-base md:text-lg max-w-lg leading-relaxed">
              {storeName} — produtos de qualidade, marcas confiáveis e atendimento especializado para cães, gatos, peixes e muito mais.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to={firstCat ? `/categoria/${firstCat.slug}` : "/categoria/promocoes"}>
                <Button className="gradient-brand text-primary-foreground font-body font-semibold tracking-wide h-12 px-8 text-sm shadow-brand hover:opacity-90 transition-opacity rounded-xl">
                  Ver Produtos <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
              <Link to="/categoria/promocoes">
                <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/[0.06] font-body font-semibold tracking-wide h-12 px-8 text-sm rounded-xl">
                  Ofertas do Dia
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
