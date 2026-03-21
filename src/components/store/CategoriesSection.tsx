import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useStoreData";
import { motion } from "framer-motion";
import { Package } from "lucide-react";

export default function CategoriesSection() {
  const { data: categories = [], isLoading } = useCategories();
  const topCats = categories.filter(c => !c.parent).slice(0, 8);

  if (isLoading) {
    return (
      <section className="container py-14 md:py-20">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold">Categorias</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl h-28 bg-card border border-border animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (topCats.length === 0) return null;

  return (
    <section className="container py-14 md:py-20">
      <div className="text-center mb-10">
        <span className="text-xs font-body uppercase tracking-[0.25em] text-primary font-semibold">Explore</span>
        <h2 className="font-display text-2xl md:text-3xl font-bold mt-1.5">Compre por Categoria</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {topCats.map((cat, i) => (
          <motion.div key={cat.slug} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
            <Link
              to={`/categoria/${cat.slug}`}
              className="group relative block overflow-hidden rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-brand transition-all duration-300"
            >
              {cat.image ? (
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-body text-sm font-semibold text-primary-foreground">{cat.name}</h3>
                    {cat.count > 0 && <span className="text-xs text-primary-foreground/70">{cat.count} produtos</span>}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center flex flex-col items-center justify-center min-h-[120px]">
                  <div className="w-12 h-12 rounded-xl bg-primary/[0.08] flex items-center justify-center mb-3 group-hover:bg-primary/[0.14] transition-colors">
                    <Package size={22} className="text-primary" />
                  </div>
                  <h3 className="font-body text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
                  {cat.count > 0 && <span className="text-xs text-muted-foreground mt-0.5">{cat.count} produtos</span>}
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
