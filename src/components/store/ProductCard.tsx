import { Link } from "react-router-dom";
import { ShoppingBag, Star, Eye, Award, Zap } from "lucide-react";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const { addItem } = useCart();
  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const discount = product.promoPrice
    ? Math.round(((product.price - product.promoPrice) / product.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group relative bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-primary/20 transition-all duration-500 shadow-elegant hover:shadow-brand-lg"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.badge && (
          <span className="gradient-brand text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-sm">
            {product.badge}
          </span>
        )}
        {product.isBestSeller && (
          <span className="gradient-brand-gold text-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-gold">
            <Award size={10} /> Top
          </span>
        )}
        {product.isNew && (
          <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md flex items-center gap-1">
            <Zap size={10} /> Novo
          </span>
        )}
      </div>

      {discount > 0 && (
        <span className="absolute top-3 right-3 z-10 bg-destructive text-destructive-foreground text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm">
          -{discount}%
        </span>
      )}

      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-secondary/20">
        <Link to={`/produto/${product.slug}`} className="block w-full h-full">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
          />
        </Link>
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/[0.03] transition-colors pointer-events-none" />
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-3 group-hover:translate-y-0">
          <button
            onClick={(e) => { e.preventDefault(); addItem(product); }}
            className="gradient-brand text-primary-foreground p-2.5 rounded-xl hover:scale-105 transition-transform shadow-brand"
            aria-label="Adicionar ao carrinho"
          >
            <ShoppingBag size={15} />
          </button>
          <Link to={`/produto/${product.slug}`} className="bg-card text-foreground p-2.5 rounded-xl hover:scale-105 transition-transform border border-border shadow-elegant" aria-label="Ver detalhes">
            <Eye size={15} />
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <span className="text-[10px] font-body uppercase tracking-[0.15em] text-accent font-semibold">{product.category}</span>
        <Link to={`/produto/${product.slug}`}>
          <h3 className="font-body text-[13px] font-medium text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>
        {product.rating > 0 && (
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={11} className={i < Math.floor(product.rating) ? "text-accent fill-accent" : "text-border"} />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">({product.reviews})</span>
          </div>
        )}
        <div className="flex items-baseline gap-2 pt-1">
          {product.promoPrice ? (
            <>
              <span className="font-body font-bold text-primary text-[15px]">{formatPrice(product.promoPrice)}</span>
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="font-body font-bold text-foreground text-[15px]">{formatPrice(product.price)}</span>
          )}
        </div>
        {product.promoPrice && (
          <p className="text-[10px] text-muted-foreground">
            ou 12x de {formatPrice(product.promoPrice / 12)}
          </p>
        )}
      </div>
    </motion.div>
  );
}
