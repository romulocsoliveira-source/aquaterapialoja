import { motion } from "framer-motion";
import { ShieldCheck, Truck, CreditCard, Headphones, Star, Heart } from "lucide-react";

const items = [
  { icon: ShieldCheck, title: "Qualidade Garantida", desc: "Trabalhamos apenas com marcas reconhecidas e produtos aprovados." },
  { icon: Truck, title: "Entrega Ágil", desc: "Receba seus pedidos com rapidez em Assis e toda a região." },
  { icon: CreditCard, title: "Pagamento Seguro", desc: "Pague com PIX, cartão ou boleto com total segurança." },
  { icon: Headphones, title: "Atendimento Dedicado", desc: "Nossa equipe está pronta para ajudar você e seu pet." },
  { icon: Star, title: "Produtos Selecionados", desc: "Curadoria rigorosa para oferecer somente o melhor." },
  { icon: Heart, title: "Cuidado Real", desc: "Cada detalhe pensado para o bem-estar do seu animal." },
];

export default function TrustSection() {
  return (
    <section className="gradient-warm">
      <div className="container py-16 md:py-24">
        <div className="text-center mb-12">
          <span className="text-[11px] font-body uppercase tracking-[0.3em] text-accent font-semibold">Por que escolher a Aquaterapia</span>
          <h2 className="font-display text-2xl md:text-3xl font-bold mt-2">Compromisso com excelência</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="group p-6 rounded-2xl bg-card border border-border/60 hover:border-primary/20 hover:shadow-brand transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl gradient-brand flex items-center justify-center mb-4 group-hover:shadow-brand transition-shadow">
                <item.icon size={20} className="text-primary-foreground" />
              </div>
              <h3 className="font-body text-base font-semibold text-foreground mb-1.5">{item.title}</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
