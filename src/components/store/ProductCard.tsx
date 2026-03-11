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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-accent/40 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.badge && (
          <span className="gradient-gold text-accent-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            {product.badge}
          </span>
        )}
        {product.isBestSeller && (
          <span className="bg-foreground text-background text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
            <Award size={10} /> Mais Vendido
          </span>
        )}
        {product.isNew && (
          <span className="bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
            <Zap size={10} /> Novo
          </span>
        )}
      </div>

      {/* Discount badge */}
      {discount > 0 && (
        <span className="absolute top-3 right-3 z-10 bg-destructive text-destructive-foreground text-xs font-bold px-2.5 py-1 rounded-full">
          -{discount}%
        </span>
      )}

      {/* Image */}
      <div className="relative overflow-hidden aspect-[3/4]">
        <Link to={`/produto/${product.slug}`} className="block w-full h-full">
           <img
             src={product.image || "/placeholder.svg"}
             alt={product.name}
             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
             loading="lazy"
             onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
           />
        </Link>
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
           <button
             onClick={(e) => { e.preventDefault(); addItem(product); }}
             className="bg-accent text-accent-foreground p-3 rounded-full hover:scale-110 transition-transform glow-gold"
            aria-label="Adicionar ao carrinho"
          >
            <ShoppingBag size={16} />
          </button>
          <Link to={`/produto/${product.slug}`} className="bg-card text-foreground p-3 rounded-full hover:scale-110 transition-transform border border-border" aria-label="Ver detalhes">
            <Eye size={16} />
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <span className="text-[10px] font-body uppercase tracking-widest text-accent">{product.category}</span>
        <Link to={`/produto/${product.slug}`}>
          <h3 className="font-body text-sm font-semibold text-foreground line-clamp-2 hover:text-accent transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={12} className={i < Math.floor(product.rating) ? "text-amber-400 fill-amber-400" : "text-muted-foreground"} />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">({product.reviews})</span>
        </div>
        <div className="flex items-center gap-2">
          {product.promoPrice ? (
            <>
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>
              <span className="font-body font-bold text-accent text-lg">{formatPrice(product.promoPrice)}</span>
            </>
          ) : (
            <span className="font-body font-bold text-foreground text-lg">{formatPrice(product.price)}</span>
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
