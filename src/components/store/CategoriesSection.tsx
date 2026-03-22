import { Link } from "react-router-dom";
import { useCategories } from "@/hooks/useStoreData";
import { motion } from "framer-motion";
import { Package, ArrowRight } from "lucide-react";

export default function CategoriesSection() {
  const { data: categories = [], isLoading } = useCategories();
  const topCats = categories.filter(c => !c.parent).slice(0, 8);

  if (isLoading) {
    return (
      <section className="bg-background">
        <div className="container py-12 md:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl h-36 bg-secondary animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (topCats.length === 0) return null;

  return (
    <section className="bg-background">
      <div className="container py-12 md:py-16">
        <div className="text-center mb-8">
          <span className="text-[11px] font-body uppercase tracking-[0.2em] text-accent font-semibold">Navegue por</span>
          <h2 className="font-display text-2xl md:text-3xl font-bold mt-1 text-foreground">Categorias</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
          {topCats.map((cat, i) => (
            <motion.div key={cat.slug} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <Link
                to={`/categoria/${cat.slug}`}
                className="group relative block overflow-hidden rounded-2xl bg-card border border-border hover:border-primary/25 hover:shadow-card-hover transition-all duration-200"
              >
                {cat.image ? (
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3.5">
                      <h3 className="font-display text-sm font-bold text-white">{cat.name}</h3>
                      {cat.count > 0 && <span className="text-[11px] text-white/70">{cat.count} produtos</span>}
                    </div>
                  </div>
                ) : (
                  <div className="p-5 text-center flex flex-col items-center justify-center min-h-[140px]">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2.5 group-hover:bg-primary/15 transition-colors">
                      <Package size={22} className="text-primary" />
                    </div>
                    <h3 className="font-body text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
                    {cat.count > 0 && <span className="text-[11px] text-muted-foreground mt-0.5">{cat.count} produtos</span>}
                    <span className="inline-flex items-center gap-1 text-[11px] text-primary font-medium mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
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
