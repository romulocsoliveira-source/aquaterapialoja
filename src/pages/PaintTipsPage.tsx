import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Paintbrush, Layers, Droplets, Clock, Sparkles, ShieldCheck } from "lucide-react";

const tips = [
  {
    icon: ShieldCheck,
    title: "Como Preparar a Parede",
    content: "Antes de pintar, limpe a parede removendo poeira e manchas. Corrija imperfeições com massa corrida e lixe suavemente. Aplique uma demão de selador ou fundo preparador para melhor aderência da tinta.",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=400&fit=crop",
  },
  {
    icon: Paintbrush,
    title: "Como Escolher a Tinta Certa",
    content: "Para áreas internas, prefira tintas acrílicas laváveis. Para áreas externas, escolha tintas com proteção UV. Em banheiros e cozinhas, opte por tintas com resistência à umidade. Considere o acabamento: fosco, acetinado ou brilhante.",
    image: "https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?w=600&h=400&fit=crop",
  },
  {
    icon: Droplets,
    title: "Como Pintar Sem Manchas",
    content: "Use rolo de lã para paredes lisas e trincha para cantos. Aplique em movimentos de W para distribuir uniformemente. Mantenha as bordas úmidas e evite parar no meio da parede. Trabalhe em seções pequenas.",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop",
  },
  {
    icon: Layers,
    title: "Quantas Demãos Aplicar",
    content: "Geralmente 2 a 3 demãos são suficientes. Aguarde o tempo de secagem entre demãos (2 a 4 horas). Em cores escuras sobre paredes claras, pode ser necessária mais uma demão. Use tinta de qualidade para melhor cobertura.",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=400&fit=crop",
  },
  {
    icon: Clock,
    title: "Tempo de Secagem",
    content: "Tinta acrílica: toque seco em 30 min, entre demãos 2-4h. Esmalte sintético: toque seco em 1h, entre demãos 12-16h. Verniz: toque seco em 2h, entre demãos 24h. Evite pintar em dias chuvosos ou muito úmidos.",
    image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=400&fit=crop",
  },
  {
    icon: Sparkles,
    title: "Tipos de Acabamento",
    content: "Fosco: disfarça imperfeições, ideal para tetos. Acetinado: levemente brilhante, fácil de limpar, ideal para quartos e salas. Brilhante: reflexo intenso, resistente, ideal para banheiros e cozinhas. Semi-brilho: equilíbrio entre fosco e brilhante.",
    image: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=600&h=400&fit=crop",
  },
];

export default function PaintTipsPage() {
  return (
    <>
      <Helmet>
        <title>Dicas de Pintura | Almoxarifado das Tintas</title>
        <meta name="description" content="Aprenda técnicas profissionais de pintura. Dicas de preparo, aplicação, escolha de tinta e acabamento." />
      </Helmet>

      <section className="container py-12 md:py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="text-xs font-body uppercase tracking-[0.3em] text-accent">Aprenda</span>
          <h1 className="font-display text-4xl md:text-5xl font-bold mt-2">Dicas de Pintura</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Técnicas e dicas profissionais para pintar como um expert.</p>
        </motion.div>

        <div className="space-y-12">
          {tips.map((tip, i) => (
            <motion.article
              key={tip.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`flex flex-col ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} gap-6 md:gap-10 items-center`}
            >
              <div className="md:w-1/2">
                <img src={tip.image} alt={tip.title} className="w-full rounded-2xl shadow-xl object-cover aspect-video" loading="lazy" />
              </div>
              <div className="md:w-1/2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center">
                    <tip.icon size={20} className="text-accent-foreground" />
                  </div>
                  <h2 className="font-display text-2xl font-bold">{tip.title}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">{tip.content}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
    </>
  );
}
