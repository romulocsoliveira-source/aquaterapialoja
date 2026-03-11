import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Paintbrush, Calculator, Palette, Lightbulb } from "lucide-react";

const tools = [
  {
    icon: Paintbrush,
    title: "Simulador de Cores",
    desc: "Pinte sua parede virtualmente",
    href: "/simulador-cores",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Calculator,
    title: "Calculadora de Tinta",
    desc: "Calcule a quantidade ideal",
    href: "/calculadora-tinta",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Palette,
    title: "Catálogo de Cores",
    desc: "Explore todas as cores",
    href: "/catalogo-cores",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Lightbulb,
    title: "Dicas de Pintura",
    desc: "Aprenda técnicas profissionais",
    href: "/dicas-pintura",
    gradient: "from-green-500 to-emerald-500",
  },
];

export default function ToolsSection() {
  return (
    <section className="container py-16 md:py-24">
      <div className="text-center mb-12">
        <span className="text-xs font-body uppercase tracking-[0.3em] text-accent">Ferramentas</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Ferramentas Exclusivas</h2>
        <p className="text-muted-foreground mt-2">Tudo que você precisa para planejar seu projeto de pintura</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              to={tool.href}
              className="group block bg-card rounded-2xl border border-border p-6 text-center hover:border-accent/30 hover:shadow-xl transition-all duration-300"
            >
              <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <tool.icon size={24} className="text-white" />
              </div>
              <h3 className="font-body text-sm font-bold mb-1">{tool.title}</h3>
              <p className="text-xs text-muted-foreground">{tool.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
