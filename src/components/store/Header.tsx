import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, User, Menu, X, Heart, Settings } from "lucide-react";
import logoImg from "@/assets/logo-aquaterapia.png";
import { useCart } from "@/context/CartContext";
import { useIsAdmin } from "@/hooks/useAdminRole";
import { useProducts } from "@/hooks/useStoreData";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Início", href: "/" },
  { label: "Banho & Tosa", href: "/agendamento" },
  { label: "Hotel Pet", href: "/hotel-pet" },
  { label: "Produtos Pet", href: "/categoria/produtos-pet" },
  { label: "Acessórios", href: "/categoria/acessorios-pet" },
  { label: "Promoções", href: "/categoria/promocoes" },
];

export default function Header() {
  const { totalItems, setIsCartOpen } = useCart();
  const { data: isAdmin } = useIsAdmin();
  const { data: products = [] } = useProducts();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchResults = searchTerm.length >= 2
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const handleProductClick = (slug: string) => {
    navigate(`/produto/${slug}`);
    setSearchOpen(false);
    setSearchTerm("");
  };

  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="bg-primary text-center py-1.5 text-xs font-body tracking-widest uppercase text-primary-foreground font-medium">
        🐾 Agende o banho do seu pet online · Frete grátis acima de R$ 199
      </div>

      <div className="container flex items-center justify-between h-16 md:h-20">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-foreground" aria-label="Menu">
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link to="/" className="flex items-center">
          <img src={logoImg} alt="Aquaterapia Pet Shop" className="h-14 md:h-20 w-auto object-contain" />
        </Link>

        <nav className="hidden md:flex items-center gap-5">
          {navLinks.map(link => (
            <Link key={link.href} to={link.href} className="text-sm font-body font-medium text-foreground/80 hover:text-primary transition-colors tracking-wide">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link to="/admin" className="hidden md:flex items-center gap-1.5 text-xs font-body font-semibold text-primary/80 hover:text-primary transition-colors uppercase tracking-wider" aria-label="Administrador">
              <Settings size={16} />
              Admin
            </Link>
          )}
          <button onClick={() => setSearchOpen(!searchOpen)} className="text-foreground/70 hover:text-primary transition-colors" aria-label="Buscar">
            <Search size={20} />
          </button>
          <Link to="/conta" className="hidden md:block text-foreground/70 hover:text-primary transition-colors" aria-label="Conta">
            <User size={20} />
          </Link>
          <Link to="/favoritos" className="hidden md:block text-foreground/70 hover:text-primary transition-colors" aria-label="Favoritos">
            <Heart size={20} />
          </Link>
          <button onClick={() => setIsCartOpen(true)} className="relative text-foreground/70 hover:text-primary transition-colors" aria-label="Carrinho">
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border">
            <div className="container py-4">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar produtos, rações, acessórios..."
                  className="w-full bg-secondary text-foreground pl-12 pr-4 py-3 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 bg-card border border-border rounded-xl overflow-hidden shadow-lg">
                  {searchResults.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleProductClick(p.slug)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-0 text-left"
                    >
                      <img src={p.image || "/placeholder.svg"} alt={p.name} className="w-10 h-10 rounded object-cover bg-secondary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-primary">{formatPrice(p.promoPrice || p.price)}</p>
                        {p.promoPrice && <p className="text-xs text-muted-foreground line-through">{formatPrice(p.price)}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {searchTerm.length >= 2 && searchResults.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum produto encontrado para "{searchTerm}"</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden border-t border-border bg-background">
            <nav className="container py-4 flex flex-col gap-3">
              {navLinks.map(link => (
                <Link key={link.href} to={link.href} onClick={() => setMobileMenuOpen(false)} className="text-sm font-body font-medium text-foreground/80 hover:text-primary py-2 border-b border-border/50 tracking-wide">
                  {link.label}
                </Link>
              ))}
              <Link to="/conta" onClick={() => setMobileMenuOpen(false)} className="text-sm font-body font-medium text-foreground/80 hover:text-primary py-2 tracking-wide flex items-center gap-2">
                <User size={16} /> Minha Conta
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-sm font-body font-medium text-primary hover:text-primary py-2 tracking-wide flex items-center gap-2">
                  <Settings size={16} /> Administrador
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
