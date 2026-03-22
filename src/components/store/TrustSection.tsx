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
    <section className="bg-secondary/40">
      <div className="container py-12 md:py-16">
        <div className="text-center mb-8">
          <span className="text-[11px] font-body uppercase tracking-[0.2em] text-accent font-semibold">Por que escolher a Aquaterapia</span>
          <h2 className="font-display text-2xl md:text-3xl font-bold mt-1 text-foreground">Compromisso com excelência</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group p-5 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-elegant transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
                <item.icon size={18} className="text-primary" />
              </div>
              <h3 className="font-body text-sm font-semibold text-foreground mb-1">{item.title}</h3>
              <p className="text-[13px] text-muted-foreground font-body leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
