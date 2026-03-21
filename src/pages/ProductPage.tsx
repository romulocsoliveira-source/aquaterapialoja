import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useProducts, useProduct } from "@/hooks/useStoreData";
import { useCart } from "@/context/CartContext";
import { Star, ShoppingBag, Heart, Truck, Shield, ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ProductCard from "@/components/store/ProductCard";
import { motion } from "framer-motion";
import { getProductWhatsAppUrl } from "@/components/store/WhatsAppButton";

export default function ProductPage() {
  const { slug } = useParams();
  const product = useProduct(slug);
  const { data: products = [] } = useProducts();
  const { addItem } = useCart();
  const [selectedVariation, setSelectedVariation] = useState<string | undefined>();

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <p className="text-muted-foreground font-body">Produto não encontrado.</p>
        <Link to="/" className="text-accent underline mt-4 inline-block">Voltar ao início</Link>
      </div>
    );
  }

  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const related = products.filter(p => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4);

  return (
    <>
      <Helmet>
        <title>{product.name} | Aquaterapia</title>
        <meta name="description" content={product.description?.slice(0, 155) || `${product.name} - ${product.category}. Compre na Aquaterapia com frete grátis acima de R$ 199.`} />
      </Helmet>
    <div className="container py-8 md:py-16">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 font-body">
        <ArrowLeft size={16} /> Voltar
      </Link>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Image */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-border">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          {product.badge && (
             <span className="absolute top-4 left-4 gradient-gold text-primary-foreground text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full">
               {product.badge}
             </span>
          )}
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
          <div>
            <span className="text-xs font-body uppercase tracking-widest text-accent">{product.category}</span>
            <h1 className="font-display text-2xl md:text-4xl font-bold mt-1">{product.name}</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} className={i < Math.floor(product.rating) ? "text-gold fill-gold" : "text-muted-foreground"} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground font-body">{product.rating} ({product.reviews} avaliações)</span>
          </div>

          <div className="flex items-baseline gap-3">
            {product.promoPrice ? (
              <>
                <span className="text-lg text-muted-foreground line-through font-body">{formatPrice(product.price)}</span>
                <span className="font-display text-3xl font-bold text-accent">{formatPrice(product.promoPrice)}</span>
                <span className="text-xs gradient-purple-pink text-primary-foreground px-2 py-1 rounded-full font-bold">
                  -{Math.round((1 - product.promoPrice / product.price) * 100)}%
                </span>
              </>
            ) : (
              <span className="font-display text-3xl font-bold text-foreground">{formatPrice(product.price)}</span>
            )}
          </div>

          <p className="text-muted-foreground font-body leading-relaxed">{product.description}</p>

          {/* Variations */}
          {product.variations && (
            <div>
              <span className="text-sm font-body font-semibold text-foreground mb-2 block">Variação:</span>
              <div className="flex flex-wrap gap-2">
                {product.variations.map(v => (
                  <button
                    key={v}
                    onClick={() => setSelectedVariation(v)}
                    className={`text-sm font-body px-4 py-2 rounded-lg border transition-colors ${selectedVariation === v ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground hover:border-accent/50"}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
             <Button
               onClick={() => addItem(product, selectedVariation)}
               className="flex-1 gradient-gold text-primary-foreground font-body font-semibold tracking-wide uppercase h-12 text-sm glow-gold hover:opacity-90 transition-opacity"
             >
               <ShoppingBag size={18} className="mr-2" /> Comprar Agora
             </Button>
            <a
              href={getProductWhatsAppUrl(product.name, formatPrice(product.promoPrice || product.price), window.location.href)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white h-12 px-4">
                <MessageCircle size={18} />
              </Button>
            </a>
            <Button variant="outline" className="border-border text-muted-foreground hover:text-accent hover:border-accent/50 h-12 px-4">
              <Heart size={18} />
            </Button>
          </div>

          {/* Trust */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
              <Truck size={18} className="text-accent" /> Entrega segura e premium
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
              <Shield size={18} className="text-accent" /> Garantia vitalícia
            </div>
          </div>
        </motion.div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-20">
          <h2 className="font-display text-2xl font-bold mb-8">Produtos Relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
