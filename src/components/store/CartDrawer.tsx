import { X, Minus, Plus, ShoppingBag, MessageCircle, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getCartWhatsAppUrl } from "@/components/store/WhatsAppButton";

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" onClick={() => setIsCartOpen(false)} />
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.3 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-card z-50 flex flex-col shadow-premium">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg gradient-brand flex items-center justify-center">
                  <ShoppingBag size={16} className="text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-foreground">Carrinho</h2>
                  <p className="text-[11px] text-muted-foreground font-body">{totalItems} {totalItems === 1 ? "item" : "itens"}</p>
                </div>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-secondary" aria-label="Fechar carrinho">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
                    <ShoppingBag size={28} className="text-muted-foreground/40" />
                  </div>
                  <p className="font-body text-sm text-muted-foreground">Seu carrinho está vazio</p>
                  <button onClick={() => setIsCartOpen(false)} className="text-sm font-body font-medium text-primary hover:underline">
                    Continuar comprando
                  </button>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.product.id} className="flex gap-3 bg-background rounded-xl p-3 border border-border">
                    <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h3 className="font-body text-sm font-medium text-foreground line-clamp-2">{item.product.name}</h3>
                        {item.variation && <span className="text-[11px] text-muted-foreground">Tam: {item.variation}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 bg-card rounded-lg border border-border">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" aria-label="Diminuir quantidade"><Minus size={13} /></button>
                          <span className="text-xs font-medium w-6 text-center font-body">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" aria-label="Aumentar quantidade"><Plus size={13} /></button>
                        </div>
                        <span className="text-sm font-bold text-primary font-body">{formatPrice((item.product.promoPrice || item.product.price) * item.quantity)}</span>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.product.id)} className="self-start text-muted-foreground hover:text-destructive transition-colors p-0.5" aria-label="Remover item"><X size={15} /></button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-border space-y-4 bg-background/50">
                <div className="flex justify-between items-center">
                  <span className="font-body text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-display text-xl font-bold text-foreground">{formatPrice(totalPrice)}</span>
                </div>
                <Button onClick={() => { setIsCartOpen(false); navigate("/checkout"); }} className="w-full gradient-brand-gold text-accent-foreground font-body font-semibold tracking-wide uppercase h-12 text-sm shadow-gold hover:opacity-90 transition-opacity rounded-xl">
                  Finalizar Compra <ArrowRight size={15} className="ml-2" />
                </Button>
                <a
                  href={getCartWhatsAppUrl(
                    items.map(i => ({
                      name: i.product.name,
                      qty: i.quantity,
                      price: formatPrice((i.product.promoPrice || i.product.price) * i.quantity),
                    })),
                    formatPrice(totalPrice)
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white font-body font-medium h-10 text-sm gap-2 rounded-xl transition-all duration-200">
                    <MessageCircle size={15} /> Comprar pelo WhatsApp
                  </Button>
                </a>
                <button onClick={() => setIsCartOpen(false)} className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors font-body py-1">
                  Continuar Comprando
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
