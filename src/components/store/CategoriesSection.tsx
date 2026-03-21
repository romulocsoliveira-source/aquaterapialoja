import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useStoreData";
import { motion } from "framer-motion";
import { Package, ArrowRight } from "lucide-react";

export default function CategoriesSection() {
  const { data: categories = [], isLoading } = useCategories();
  const topCats = categories.filter(c => !c.parent).slice(0, 8);

  if (isLoading) {
    return (
      <section className="gradient-warm">
        <div className="container py-16 md:py-24">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl h-40 bg-card border border-border animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (topCats.length === 0) return null;

  return (
    <section className="gradient-warm">
      <div className="container py-16 md:py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-[11px] font-body uppercase tracking-[0.25em] text-accent font-semibold block">Navegue por</span>
            <h2 className="font-display text-2xl md:text-3xl font-bold mt-1.5">Categorias</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {topCats.map((cat, i) => (
            <motion.div key={cat.slug} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
              <Link
                to={`/categoria/${cat.slug}`}
                className="group relative block overflow-hidden rounded-2xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-brand transition-all duration-300"
              >
                {cat.image ? (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-display text-base font-bold text-primary-foreground">{cat.name}</h3>
                      {cat.count > 0 && <span className="text-xs text-primary-foreground/70">{cat.count} produtos</span>}
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center flex flex-col items-center justify-center min-h-[160px]">
                    <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center mb-3 group-hover:shadow-brand transition-shadow">
                      <Package size={24} className="text-primary-foreground" />
                    </div>
                    <h3 className="font-body text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
                    {cat.count > 0 && <span className="text-xs text-muted-foreground mt-1">{cat.count} produtos</span>}
                    <span className="inline-flex items-center gap-1 text-[11px] text-primary font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver mais <ArrowRight size={10} />
                    </span>
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
