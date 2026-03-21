import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useStoreData";
import ProductCard from "./ProductCard";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/data/products";

interface Props {
  title: string;
  subtitle?: string;
  filter?: (p: Product) => boolean;
  limit?: number;
  linkTo?: string;
}

export default function FeaturedProducts({ title, subtitle, filter, limit = 4, linkTo }: Props) {
  const { data: products = [], isLoading } = useProducts();
  const filtered = filter ? products.filter(filter) : products;
  const display = filtered.slice(0, limit);

  if (isLoading) {
    return (
      <section className="container py-14 md:py-20">
        <div className="text-center mb-10">
          {subtitle && <span className="text-xs font-body uppercase tracking-[0.25em] text-primary font-semibold">{subtitle}</span>}
          <h2 className="font-display text-2xl md:text-3xl font-bold mt-1.5">{title}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: limit > 4 ? 4 : limit }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl border border-border aspect-square animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (display.length === 0) return null;

  return (
    <section className="container py-14 md:py-20">
      <div className="flex items-end justify-between mb-10">
        <div>
          {subtitle && <span className="text-xs font-body uppercase tracking-[0.25em] text-primary font-semibold block">{subtitle}</span>}
          <h2 className="font-display text-2xl md:text-3xl font-bold mt-1.5">{title}</h2>
        </div>
        {linkTo && (
          <Link to={linkTo} className="hidden md:flex items-center gap-1.5 text-sm font-body font-medium text-primary hover:text-primary/80 transition-colors">
            Ver todos <ArrowRight size={14} />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {display.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} />
        ))}
      </div>
    </section>
  );
}
