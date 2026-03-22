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
  dark?: boolean;
}

export default function FeaturedProducts({ title, subtitle, filter, limit = 4, linkTo, dark }: Props) {
  const { data: products = [], isLoading } = useProducts();
  const filtered = filter ? products.filter(filter) : products;
  const display = filtered.slice(0, limit);

  if (isLoading) {
    return (
      <section className={dark ? "bg-brand-dark" : "bg-background"}>
        <div className="container py-12 md:py-16">
          <div className="text-center mb-8">
            {subtitle && <span className={`text-[11px] font-body uppercase tracking-[0.2em] font-semibold ${dark ? "text-accent" : "text-accent"}`}>{subtitle}</span>}
            <h2 className={`font-display text-2xl md:text-3xl font-bold mt-1 ${dark ? "text-white" : "text-foreground"}`}>{title}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: limit > 4 ? 4 : limit }).map((_, i) => (
              <div key={i} className={`rounded-2xl border aspect-square animate-pulse ${dark ? "bg-white/5 border-white/10" : "bg-secondary border-border"}`} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (display.length === 0) return null;

  return (
    <section className={dark ? "bg-brand-dark" : "bg-background"}>
      <div className="container py-12 md:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            {subtitle && <span className={`text-[11px] font-body uppercase tracking-[0.2em] font-semibold block ${dark ? "text-accent" : "text-accent"}`}>{subtitle}</span>}
            <h2 className={`font-display text-2xl md:text-3xl font-bold mt-1 ${dark ? "text-white" : "text-foreground"}`}>{title}</h2>
          </div>
          {linkTo && (
            <Link to={linkTo} className={`hidden md:flex items-center gap-1.5 text-sm font-body font-medium transition-colors ${dark ? "text-accent hover:text-accent/80" : "text-primary hover:text-primary/80"}`}>
              Ver todos <ArrowRight size={14} />
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {display.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
        {linkTo && (
          <div className="md:hidden text-center mt-6">
            <Link to={linkTo} className={`inline-flex items-center gap-1.5 text-sm font-body font-medium transition-colors ${dark ? "text-accent hover:text-accent/80" : "text-primary hover:text-primary/80"}`}>
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
