import { X, Minus, Plus, ShoppingBag, MessageCircle } from "lucide-react";
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={() => setIsCartOpen(false)} />
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.3 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-card z-50 flex flex-col border-l border-border">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-accent" />
                <h2 className="font-display text-xl font-bold">Carrinho ({totalItems})</h2>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <ShoppingBag size={48} className="mb-4 opacity-30" />
                  <p className="font-body text-sm">Seu carrinho está vazio</p>
                </div>
              ) : (
                items.map(item => (
                  <div key={item.product.id} className="flex gap-4 bg-secondary rounded-lg p-3">
                    <img src={item.product.image} alt={item.product.name} className="w-20 h-24 object-cover rounded-md" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-body text-sm font-semibold text-foreground">{item.product.name}</h3>
                        {item.variation && <span className="text-xs text-muted-foreground">Tam: {item.variation}</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-muted rounded-md">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1.5 text-muted-foreground hover:text-foreground"><Minus size={14} /></button>
                          <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1.5 text-muted-foreground hover:text-foreground"><Plus size={14} /></button>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-accent">{formatPrice((item.product.promoPrice || item.product.price) * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.product.id)} className="self-start text-muted-foreground hover:text-destructive transition-colors"><X size={16} /></button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-body text-sm text-muted-foreground">Subtotal</span>
                  <span className="font-display text-xl font-bold text-gradient-gold">{formatPrice(totalPrice)}</span>
                </div>
                <Button onClick={() => { setIsCartOpen(false); navigate("/checkout"); }} className="w-full gradient-gold text-primary-foreground font-body font-semibold tracking-wide uppercase h-12 text-sm glow-gold hover:opacity-90 transition-opacity">
                  Finalizar Compra
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
                  className="w-full"
                >
                  <Button variant="outline" className="w-full border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white font-body font-semibold h-10 text-sm gap-2">
                    <MessageCircle size={16} /> Comprar pelo WhatsApp
                  </Button>
                </a>
                <button onClick={() => setIsCartOpen(false)} className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors font-body">
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
