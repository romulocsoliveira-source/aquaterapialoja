import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useStoreData";
import { motion } from "framer-motion";

export default function CategoriesSection() {
  const { data: categories = [], isLoading } = useCategories();
  const displayCats = categories.slice(0, 8);

  if (isLoading) {
    return (
      <section className="container py-16 md:py-24">
        <div className="text-center mb-12">
          <span className="text-xs font-body uppercase tracking-[0.3em] text-accent">Explore</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Categorias</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl aspect-[3/4] bg-card border border-border animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="container py-16 md:py-24">
      <div className="text-center mb-12">
        <span className="text-xs font-body uppercase tracking-[0.3em] text-accent">Explore</span>
        <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">Categorias</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {displayCats.map((cat, i) => (
          <motion.div key={cat.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
            <Link to={`/categoria/${cat.slug}`} className="group relative block overflow-hidden rounded-xl aspect-[3/4]">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="font-body text-sm font-semibold text-foreground">{cat.name}</h3>
                <span className="text-xs text-muted-foreground">{cat.count} produtos</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
