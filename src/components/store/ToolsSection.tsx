import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Scissors, Building2, ShoppingBag, Calendar } from "lucide-react";

const tools = [
  {
    icon: Scissors,
    title: "Banho & Tosa",
    desc: "Agende online agora",
    href: "/agendamento",
    gradient: "from-sky-500 to-cyan-500",
  },
  {
    icon: Building2,
    title: "Hotel Pet",
    desc: "Hospedagem com conforto",
    href: "/hotel-pet",
    gradient: "from-emerald-500 to-green-500",
  },
  {
    icon: ShoppingBag,
    title: "Loja Pet",
    desc: "Produtos de qualidade",
    href: "/categoria/produtos-pet",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Calendar,
    title: "Meus Agendamentos",
    desc: "Veja seus horários",
    href: "/conta",
    gradient: "from-amber-500 to-orange-500",
  },
];

export default function ToolsSection() {
  return (
    <section className="container py-16 md:py-24">
      <div className="text-center mb-12">
        <span className="text-xs font-body uppercase tracking-[0.3em] text-primary">Serviços</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Nossos Serviços</h2>
        <p className="text-muted-foreground mt-2">Tudo que seu pet precisa em um só lugar</p>
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
              className="group block bg-card rounded-2xl border border-border p-6 text-center hover:border-primary/30 hover:shadow-xl transition-all duration-300"
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
