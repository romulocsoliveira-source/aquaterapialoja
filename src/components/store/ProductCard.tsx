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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/20 transition-all duration-200 hover:shadow-card-hover"
    >
      {/* Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
        {product.badge && (
          <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
            {product.badge}
          </span>
        )}
        {product.isBestSeller && (
          <span className="bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1">
            <Award size={10} /> Top
          </span>
        )}
        {product.isNew && (
          <span className="bg-foreground text-background text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1">
            <Zap size={10} /> Novo
          </span>
        )}
      </div>

      {discount > 0 && (
        <span className="absolute top-2.5 right-2.5 z-10 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-1 rounded-md">
          -{discount}%
        </span>
      )}

      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-secondary">
        <Link to={`/produto/${product.slug}`} className="block w-full h-full">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
          />
        </Link>
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
          <button
            onClick={(e) => { e.preventDefault(); addItem(product); }}
            className="bg-accent text-accent-foreground p-2.5 rounded-xl hover:scale-105 transition-transform shadow-gold"
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
      <div className="p-3.5 space-y-1.5">
        <span className="text-[10px] font-body uppercase tracking-[0.12em] text-primary font-semibold">{product.category}</span>
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
        <div className="flex items-baseline gap-2 pt-0.5">
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
