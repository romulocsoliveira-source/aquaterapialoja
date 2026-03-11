import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";
import heroSide from "@/assets/hero-side.jpg";

export default function HeroSection() {
  return (
    <section className="relative min-h-[70vh] md:min-h-[85vh] flex items-center overflow-hidden">
      {/* Watercolor paint banner background */}
      <div className="absolute inset-0">
        <img src={heroBanner} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
      </div>

      <div className="container relative z-10 grid md:grid-cols-2 gap-8 items-center">
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="space-y-6">
          <span className="inline-flex items-center gap-2 text-xs font-body uppercase tracking-[0.3em] text-accent border border-accent/30 px-4 py-1.5 rounded-full font-semibold">
            <Paintbrush size={14} /> Qualidade Premium
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1]">
            Sua Casa,
            <span className="block text-gradient-gold">Suas Cores.</span>
          </h1>
          <p className="text-muted-foreground font-body text-base md:text-lg max-w-md leading-relaxed">
            Tintas residenciais, industriais e automotivas das melhores marcas. Compre online com entrega rápida e segura.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/categoria/tintas-residenciais">
              <Button className="gradient-gold text-primary-foreground font-body font-semibold tracking-wide h-12 px-8 text-sm glow-gold hover:opacity-90 transition-opacity">
                Compre Online <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <Link to="/categoria/promocoes">
              <Button variant="outline" className="border-accent/40 text-accent hover:bg-accent/10 font-body font-semibold tracking-wide h-12 px-8 text-sm">
                Ver Promoções
              </Button>
            </Link>
          </div>

          {/* Color palette decoration */}
          <div className="flex items-center gap-2 pt-4">
            <span className="text-xs text-muted-foreground font-body">Cores populares:</span>
            <div className="flex gap-1.5">
              {["hsl(0,0%,95%)", "hsl(40,30%,85%)", "hsl(24,95%,53%)", "hsl(200,80%,50%)", "hsl(120,40%,35%)", "hsl(340,60%,45%)", "hsl(45,90%,55%)", "hsl(0,0%,25%)"].map((c, i) => (
                <div key={i} className="w-6 h-6 rounded-full border border-border shadow-sm" style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="hidden md:block relative">
          <div className="relative w-full aspect-[3/4] max-w-md mx-auto">
            <div className="absolute inset-0 gradient-gold rounded-3xl opacity-10 blur-3xl" />
            <img
              src={heroSide}
              alt="Parede colorida com pintura moderna"
              className="relative w-full h-full object-cover rounded-3xl border border-border shadow-xl"
            />
            <div className="absolute -bottom-4 -right-4 bg-card border border-border rounded-2xl p-4 shadow-xl">
              <span className="text-xs text-muted-foreground font-body">A partir de</span>
              <span className="block font-display text-2xl font-bold text-gradient-gold">R$ 89,90</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
