import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, User, Menu, X, Heart, Settings, ChevronDown } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useIsAdmin } from "@/hooks/useAdminRole";
import { useProducts, useCategories } from "@/hooks/useStoreData";
import { useStoreConfig } from "@/hooks/useStoreConfig";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { totalItems, setIsCartOpen } = useCart();
  const { data: isAdmin } = useIsAdmin();
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const { data: storeConfig } = useStoreConfig();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [catDropdown, setCatDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

  const logoUrl = storeConfig?.logo_url;
  const storeName = storeConfig?.trade_name || storeConfig?.company_name || "Aquaterapia";

  const searchResults = searchTerm.length >= 2
    ? products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 6)
    : [];

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) setCatDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleProductClick = (slug: string) => {
    navigate(`/produto/${slug}`);
    setSearchOpen(false);
    setSearchTerm("");
  };

  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // Top-level categories only
  const topCategories = categories.filter(c => !c.parent);

  return (
    <header className="sticky top-0 z-50 bg-card/98 backdrop-blur-xl border-b border-border/60">
      {/* Top bar */}
      <div className="gradient-brand text-center py-2 text-xs font-body tracking-widest uppercase text-primary-foreground/90 font-medium">
        Frete grátis acima de R$ 199 · Parcele em até 12x
      </div>

      <div className="container flex items-center justify-between h-16 md:h-[72px]">
        {/* Mobile menu btn */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-foreground p-1" aria-label="Menu">
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} className="h-10 md:h-14 w-auto object-contain" />
          ) : (
            <span className="font-display text-xl md:text-2xl font-bold text-primary tracking-tight">{storeName}</span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-[13px] font-body font-medium text-foreground/75 hover:text-primary transition-colors">
            Início
          </Link>

          {/* Categories dropdown */}
          <div ref={catRef} className="relative">
            <button
              onClick={() => setCatDropdown(!catDropdown)}
              className="flex items-center gap-1 text-[13px] font-body font-medium text-foreground/75 hover:text-primary transition-colors"
            >
              Categorias <ChevronDown size={14} className={`transition-transform ${catDropdown ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {catDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute top-full left-0 mt-2 bg-card border border-border rounded-xl shadow-xl min-w-[220px] py-2 z-50"
                >
                  {topCategories.length > 0 ? topCategories.map(cat => (
                    <Link
                      key={cat.slug}
                      to={`/categoria/${cat.slug}`}
                      onClick={() => setCatDropdown(false)}
                      className="block px-4 py-2.5 text-sm font-body text-foreground/80 hover:bg-secondary hover:text-primary transition-colors"
                    >
                      {cat.name}
                      {cat.count > 0 && <span className="text-muted-foreground text-xs ml-2">({cat.count})</span>}
                    </Link>
                  )) : (
                    <span className="block px-4 py-2.5 text-sm text-muted-foreground">Nenhuma categoria</span>
                  )}
                  <div className="border-t border-border mt-1 pt-1">
                    <Link to="/categoria/promocoes" onClick={() => setCatDropdown(false)} className="block px-4 py-2.5 text-sm font-body font-semibold text-destructive hover:bg-secondary transition-colors">
                      🔥 Promoções
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link to="/categoria/promocoes" className="text-[13px] font-body font-semibold text-destructive hover:text-destructive/80 transition-colors">
            Promoções
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          {isAdmin && (
            <Link to="/admin" className="hidden md:flex items-center gap-1 text-[11px] font-body font-semibold text-primary/70 hover:text-primary transition-colors uppercase tracking-wider" aria-label="Administrador">
              <Settings size={14} />
              Admin
            </Link>
          )}
          <button onClick={() => setSearchOpen(!searchOpen)} className="text-foreground/60 hover:text-primary transition-colors p-1.5" aria-label="Buscar">
            <Search size={18} />
          </button>
          <Link to="/conta" className="hidden md:block text-foreground/60 hover:text-primary transition-colors p-1.5" aria-label="Conta">
            <User size={18} />
          </Link>
          <Link to="/favoritos" className="hidden md:block text-foreground/60 hover:text-primary transition-colors p-1.5" aria-label="Favoritos">
            <Heart size={18} />
          </Link>
          <button onClick={() => setIsCartOpen(true)} className="relative text-foreground/60 hover:text-primary transition-colors p-1.5" aria-label="Carrinho">
            <ShoppingBag size={18} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 gradient-brand text-primary-foreground text-[9px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-border/50">
            <div className="container py-4">
              <div className="relative max-w-xl mx-auto">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="O que você está procurando?"
                  className="w-full bg-secondary text-foreground pl-11 pr-4 py-3 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 max-w-xl mx-auto bg-card border border-border rounded-xl overflow-hidden shadow-lg">
                  {searchResults.map(p => (
                    <button key={p.id} onClick={() => handleProductClick(p.slug)} className="w-full flex items-center gap-3 p-3 hover:bg-secondary/60 transition-colors border-b border-border/40 last:border-0 text-left">
                      <img src={p.image || "/placeholder.svg"} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-secondary" />
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
                <p className="text-sm text-muted-foreground text-center py-4 max-w-xl mx-auto">Nenhum produto encontrado para "{searchTerm}"</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden border-t border-border/50 bg-card">
            <nav className="container py-4 flex flex-col gap-1">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-sm font-body font-medium text-foreground/80 hover:text-primary py-2.5 border-b border-border/30">
                Início
              </Link>
              {topCategories.map(cat => (
                <Link key={cat.slug} to={`/categoria/${cat.slug}`} onClick={() => setMobileMenuOpen(false)} className="text-sm font-body font-medium text-foreground/80 hover:text-primary py-2.5 border-b border-border/30">
                  {cat.name}
                </Link>
              ))}
              <Link to="/categoria/promocoes" onClick={() => setMobileMenuOpen(false)} className="text-sm font-body font-semibold text-destructive py-2.5 border-b border-border/30">
                🔥 Promoções
              </Link>
              <Link to="/conta" onClick={() => setMobileMenuOpen(false)} className="text-sm font-body font-medium text-foreground/80 hover:text-primary py-2.5 flex items-center gap-2">
                <User size={16} /> Minha Conta
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-sm font-body font-medium text-primary py-2.5 flex items-center gap-2">
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
