import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useProducts, useProduct } from "@/hooks/useStoreData";
import { useCart } from "@/context/CartContext";
import { Star, ShoppingBag, Heart, Truck, Shield, ArrowLeft, MessageCircle, ChevronRight } from "lucide-react";
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
        <div className="max-w-md mx-auto space-y-4">
          <ShoppingBag size={48} className="mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground font-body text-lg">Produto não encontrado.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-body font-medium hover:underline">
            <ArrowLeft size={16} /> Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const related = products.filter(p => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4);
  const discount = product.promoPrice ? Math.round((1 - product.promoPrice / product.price) * 100) : 0;

  return (
    <>
      <Helmet>
        <title>{product.name} | Aquaterapia</title>
        <meta name="description" content={product.description?.slice(0, 155) || `${product.name} - ${product.category}. Compre na Aquaterapia com frete grátis acima de R$ 199.`} />
      </Helmet>

      <div className="bg-background min-h-screen">
        {/* Breadcrumb */}
        <div className="container pt-5 pb-2">
          <nav className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
            <ChevronRight size={12} />
            <Link to={`/categoria/${product.categorySlug}`} className="hover:text-foreground transition-colors">{product.category}</Link>
            <ChevronRight size={12} />
            <span className="text-foreground/70 truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>

        <div className="container py-5 md:py-8">
          <div className="grid md:grid-cols-2 gap-6 md:gap-10">
            {/* Image */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden bg-card border border-border shadow-elegant">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              </div>
              {product.badge && (
                <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg">
                  {product.badge}
                </span>
              )}
              {discount > 0 && (
                <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1.5 rounded-lg">
                  -{discount}%
                </span>
              )}
            </motion.div>

            {/* Details */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
              <div>
                <span className="text-xs font-body uppercase tracking-[0.12em] text-accent font-semibold">{product.category}</span>
                <h1 className="font-display text-2xl md:text-3xl font-bold mt-1 text-foreground leading-tight">{product.name}</h1>
              </div>

              {product.rating > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < Math.floor(product.rating) ? "text-accent fill-accent" : "text-border"} />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground font-body">{product.rating} ({product.reviews} avaliações)</span>
                </div>
              )}

              {/* Price block */}
              <div className="bg-card rounded-xl border border-border p-4 space-y-1.5">
                <div className="flex items-baseline gap-3">
                  {product.promoPrice ? (
                    <>
                      <span className="font-display text-2xl md:text-3xl font-bold text-primary">{formatPrice(product.promoPrice)}</span>
                      <span className="text-sm text-muted-foreground line-through font-body">{formatPrice(product.price)}</span>
                    </>
                  ) : (
                    <span className="font-display text-2xl md:text-3xl font-bold text-foreground">{formatPrice(product.price)}</span>
                  )}
                </div>
                {product.promoPrice && (
                  <p className="text-xs text-muted-foreground font-body">
                    ou 12x de {formatPrice(product.promoPrice / 12)} sem juros
                  </p>
                )}
              </div>

              {product.description && (
                <p className="text-muted-foreground font-body leading-relaxed text-sm">{product.description}</p>
              )}

              {/* Variations */}
              {product.variations && (
                <div>
                  <span className="text-sm font-body font-semibold text-foreground mb-2 block">Variação:</span>
                  <div className="flex flex-wrap gap-2">
                    {product.variations.map(v => (
                      <button
                        key={v}
                        onClick={() => setSelectedVariation(v)}
                        className={`text-sm font-body px-3.5 py-2 rounded-lg border transition-all duration-200 ${selectedVariation === v ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground hover:border-primary/40 bg-card"}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="flex gap-2.5 pt-1">
                <Button
                  onClick={() => addItem(product, selectedVariation)}
                  className="flex-1 bg-accent text-accent-foreground font-body font-semibold tracking-wide uppercase h-12 text-sm hover:bg-accent/90 transition-all duration-200 rounded-xl shadow-gold"
                >
                  <ShoppingBag size={18} className="mr-2" /> Comprar Agora
                </Button>
                <a
                  href={getProductWhatsAppUrl(product.name, formatPrice(product.promoPrice || product.price), window.location.href)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white h-12 px-4 rounded-xl transition-all duration-200" aria-label="Comprar pelo WhatsApp">
                    <MessageCircle size={18} />
                  </Button>
                </a>
                <Button variant="outline" className="border-border text-muted-foreground hover:text-accent hover:border-accent/40 h-12 px-4 rounded-xl transition-all duration-200" aria-label="Adicionar aos favoritos">
                  <Heart size={18} />
                </Button>
              </div>

              {/* Trust signals */}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border">
                  <Truck size={16} className="text-primary flex-shrink-0" />
                  <span className="text-xs text-muted-foreground font-body">Entrega rápida e segura</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border">
                  <Shield size={16} className="text-primary flex-shrink-0" />
                  <span className="text-xs text-muted-foreground font-body">Garantia de qualidade</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-14 md:mt-16">
              <div className="mb-6">
                <span className="text-[11px] font-body uppercase tracking-[0.2em] text-accent font-semibold">Você também pode gostar</span>
                <h2 className="font-display text-2xl font-bold mt-1 text-foreground">Produtos Relacionados</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {related.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
