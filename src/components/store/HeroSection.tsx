import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBanner from "@/assets/hero-banner.jpg";
import heroSide from "@/assets/hero-side.jpg";

export default function HeroSection() {
  return (
    <section className="relative min-h-[70vh] md:min-h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBanner} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
      </div>

      <div className="container relative z-10 grid md:grid-cols-2 gap-8 items-center">
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="space-y-6">
          <span className="inline-flex items-center gap-2 text-xs font-body uppercase tracking-[0.3em] text-primary border border-primary/30 px-4 py-1.5 rounded-full font-semibold">
            <PawPrint size={14} /> Cuidado Premium
          </span>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1]">
            Seu Pet,
            <span className="block text-gradient-gold">Nosso Amor.</span>
          </h1>
          <p className="text-muted-foreground font-body text-base md:text-lg max-w-md leading-relaxed">
            Banho e tosa, hotel pet e produtos de qualidade. Cuidamos do seu melhor amigo com carinho e profissionalismo.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/agendamento">
              <Button className="gradient-pet text-primary-foreground font-body font-semibold tracking-wide h-12 px-8 text-sm glow-gold hover:opacity-90 transition-opacity">
                Agendar Banho & Tosa <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <Link to="/hotel-pet">
              <Button variant="outline" className="border-primary/40 text-primary hover:bg-primary/10 font-body font-semibold tracking-wide h-12 px-8 text-sm">
                Hotel Pet
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <span className="text-xs text-muted-foreground font-body">Nossos serviços:</span>
            <div className="flex gap-2">
              {["🛁 Banho", "✂️ Tosa", "🏨 Hotel", "🛍️ Loja"].map((s) => (
                <span key={s} className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">{s}</span>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="hidden md:block relative">
          <div className="relative w-full aspect-[3/4] max-w-md mx-auto">
            <div className="absolute inset-0 gradient-pet rounded-3xl opacity-10 blur-3xl" />
            <img
              src={heroSide}
              alt="Pets felizes"
              className="relative w-full h-full object-cover rounded-3xl border border-border shadow-xl"
            />
            <div className="absolute -bottom-4 -right-4 bg-card border border-border rounded-2xl p-4 shadow-xl">
              <span className="text-xs text-muted-foreground font-body">Banho completo</span>
              <span className="block font-display text-2xl font-bold text-gradient-gold">R$ 65,00</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
