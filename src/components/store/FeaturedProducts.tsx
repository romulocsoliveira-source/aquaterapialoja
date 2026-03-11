import { useProducts } from "@/hooks/useStoreData";
import ProductCard from "./ProductCard";
import type { Product } from "@/data/products";

interface Props {
  title: string;
  subtitle?: string;
  filter?: (p: Product) => boolean;
  limit?: number;
}

export default function FeaturedProducts({ title, subtitle, filter, limit = 4 }: Props) {
  const { data: products = [], isLoading } = useProducts();
  const filtered = filter ? products.filter(filter) : products;
  const display = filtered.slice(0, limit);

  if (isLoading) {
    return (
      <section className="container py-16 md:py-24">
        <div className="text-center mb-12">
          {subtitle && <span className="text-xs font-body uppercase tracking-[0.3em] text-accent">{subtitle}</span>}
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">{title}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border aspect-[3/4] animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (display.length === 0) return null;

  return (
    <section className="container py-16 md:py-24">
      <div className="text-center mb-12">
        {subtitle && <span className="text-xs font-body uppercase tracking-[0.3em] text-accent">{subtitle}</span>}
        <h2 className="font-display text-3xl md:text-4xl font-bold mt-2">{title}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {display.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  );
}
