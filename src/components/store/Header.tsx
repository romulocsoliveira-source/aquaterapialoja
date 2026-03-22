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
  const [scrolled, setScrolled] = useState(false);
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleProductClick = (slug: string) => {
    navigate(`/produto/${slug}`);
    setSearchOpen(false);
    setSearchTerm("");
  };

  const formatPrice = (p: number) => p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const topCategories = categories.filter(c => !c.parent);

  return (
    <header className="sticky top-0 z-50">
      {/* Announcement bar — coral accent */}
      <div className="bg-accent text-accent-foreground text-center py-2 text-[11px] font-body tracking-wide font-medium">
        🐾 Frete grátis acima de R$ 199 · Parcele em até 12x sem juros
      </div>

      {/* Main header — clean white with subtle border */}
      <div className={`bg-card transition-all duration-300 ${scrolled ? "shadow-elegant border-b border-border" : "border-b border-border/50"}`}>
        <div className="container flex items-center justify-between h-16 md:h-[72px]">
          {/* Mobile menu */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-foreground/60 hover:text-foreground p-2 transition-colors" aria-label="Menu">
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo — displayed inside a dark pill for contrast */}
          <Link to="/" className="flex items-center gap-2.5">
            {logoUrl ? (
              <div className="bg-brand-dark rounded-xl px-3 py-1.5">
                <img src={logoUrl} alt={storeName} className="h-9 md:h-10 w-auto object-contain" />
              </div>
            ) : (
              <span className="font-display text-xl md:text-2xl font-bold text-foreground tracking-tight">{storeName}</span>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            <Link to="/" className="text-[13px] font-body font-medium text-foreground/60 hover:text-foreground transition-colors">
              Início
            </Link>
            <div ref={catRef} className="relative">
              <button
                onClick={() => setCatDropdown(!catDropdown)}
                className="flex items-center gap-1 text-[13px] font-body font-medium text-foreground/60 hover:text-foreground transition-colors"
              >
                Categorias <ChevronDown size={13} className={`transition-transform ${catDropdown ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {catDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full left-0 mt-3 bg-card border border-border rounded-xl shadow-premium min-w-[220px] py-2 z-50"
                  >
                    {topCategories.length > 0 ? topCategories.map(cat => (
                      <Link
                        key={cat.slug}
                        to={`/categoria/${cat.slug}`}
                        onClick={() => setCatDropdown(false)}
                        className="block px-4 py-2.5 text-sm font-body text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors"
                      >
                        {cat.name}
                        {cat.count > 0 && <span className="text-muted-foreground text-xs ml-2">({cat.count})</span>}
                      </Link>
                    )) : (
                      <span className="block px-4 py-2.5 text-sm text-muted-foreground">Nenhuma categoria</span>
                    )}
                    <div className="border-t border-border mt-1 pt-1">
                      <Link to="/categoria/promocoes" onClick={() => setCatDropdown(false)} className="block px-4 py-2.5 text-sm font-body font-semibold text-accent hover:bg-secondary transition-colors">
                        🔥 Promoções
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link to="/categoria/promocoes" className="text-[13px] font-body font-semibold text-accent hover:text-accent/80 transition-colors">
              Ofertas
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 md:gap-2">
            {isAdmin && (
              <Link to="/admin" className="hidden md:flex items-center gap-1.5 text-[11px] font-body font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider" aria-label="Administrador">
                <Settings size={13} />
                Admin
              </Link>
            )}
            <button onClick={() => setSearchOpen(!searchOpen)} className="text-foreground/50 hover:text-foreground transition-colors p-2 rounded-lg hover:bg-secondary" aria-label="Buscar">
              <Search size={18} />
            </button>
            <Link to="/conta" className="hidden md:flex text-foreground/50 hover:text-foreground transition-colors p-2 rounded-lg hover:bg-secondary" aria-label="Conta">
              <User size={18} />
            </Link>
            <Link to="/favoritos" className="hidden md:flex text-foreground/50 hover:text-foreground transition-colors p-2 rounded-lg hover:bg-secondary" aria-label="Favoritos">
              <Heart size={18} />
            </Link>
            <button onClick={() => setIsCartOpen(true)} className="relative text-foreground/50 hover:text-foreground transition-colors p-2 rounded-lg hover:bg-secondary" aria-label="Carrinho">
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[9px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-b border-border bg-card shadow-elegant">
            <div className="container py-4">
              <div className="relative max-w-xl mx-auto">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="O que você está procurando?"
                  className="w-full bg-secondary text-foreground pl-11 pr-4 py-3 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground transition-all duration-200"
                  autoFocus
                />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-3 max-w-xl mx-auto bg-card border border-border rounded-xl overflow-hidden shadow-premium">
                  {searchResults.map(p => (
                    <button key={p.id} onClick={() => handleProductClick(p.slug)} className="w-full flex items-center gap-3 p-3 hover:bg-secondary/60 transition-colors border-b border-border last:border-0 text-left">
                      <img src={p.image || "/placeholder.svg"} alt={p.name} className="w-11 h-11 rounded-lg object-cover bg-secondary" />
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
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden border-b border-border bg-card">
            <nav className="container py-4 flex flex-col gap-1">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-sm font-body font-medium text-foreground/70 hover:text-foreground py-3 border-b border-border/50">
                Início
              </Link>
              {topCategories.map(cat => (
                <Link key={cat.slug} to={`/categoria/${cat.slug}`} onClick={() => setMobileMenuOpen(false)} className="text-sm font-body font-medium text-foreground/70 hover:text-foreground py-3 border-b border-border/50">
                  {cat.name}
                </Link>
              ))}
              <Link to="/categoria/promocoes" onClick={() => setMobileMenuOpen(false)} className="text-sm font-body font-semibold text-accent py-3 border-b border-border/50">
                🔥 Promoções
              </Link>
              <Link to="/conta" onClick={() => setMobileMenuOpen(false)} className="text-sm font-body font-medium text-foreground/70 hover:text-foreground py-3 flex items-center gap-2">
                <User size={16} /> Minha Conta
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="text-sm font-body font-medium text-primary py-3 flex items-center gap-2">
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
