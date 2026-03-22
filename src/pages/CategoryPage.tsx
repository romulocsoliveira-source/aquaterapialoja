import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useProducts, useCategories } from "@/hooks/useStoreData";
import ProductCard from "@/components/store/ProductCard";
import { useState } from "react";
import { SlidersHorizontal, ChevronDown, ChevronRight, Package } from "lucide-react";

export default function CategoryPage() {
  const { slug } = useParams();
  const { data: products = [], isLoading } = useProducts();
  const { data: categories = [] } = useCategories();
  
  const category = categories.find(c => c.slug === slug);
  const categoryProducts = slug === "promocoes"
    ? products.filter(p => p.promoPrice)
    : products.filter(p => p.categorySlug === slug);

  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("default");
  const [showFilters, setShowFilters] = useState(false);

  let filtered = categoryProducts.filter(p => {
    const price = p.promoPrice || p.price;
    if (priceFilter === "under1000") return price < 1000;
    if (priceFilter === "1000to5000") return price >= 1000 && price <= 5000;
    if (priceFilter === "over5000") return price > 5000;
    return true;
  });

  if (sortBy === "price_asc") filtered = [...filtered].sort((a, b) => (a.promoPrice || a.price) - (b.promoPrice || b.price));
  if (sortBy === "price_desc") filtered = [...filtered].sort((a, b) => (b.promoPrice || b.price) - (a.promoPrice || a.price));
  if (sortBy === "name") filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  const categoryName = category?.name || (slug === "promocoes" ? "Promoções" : "Produtos");

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="container py-8 md:py-12">
          <div className="mb-8">
            <div className="h-8 w-48 bg-secondary rounded-lg animate-pulse" />
            <div className="h-4 w-32 bg-secondary rounded-lg animate-pulse mt-3" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border aspect-[3/4] animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{categoryName} | Aquaterapia</title>
        <meta name="description" content={`Confira nossa coleção de ${categoryName.toLowerCase()}. Produtos de qualidade para seu pet. Frete grátis acima de R$ 199.`} />
      </Helmet>

      <div className="bg-background min-h-screen">
        {/* Breadcrumb */}
        <div className="container pt-6 pb-2">
          <nav className="flex items-center gap-1.5 text-xs font-body text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Início</Link>
            <ChevronRight size={12} />
            <span className="text-foreground/70">{categoryName}</span>
          </nav>
        </div>

        <div className="container py-6 md:py-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{categoryName}</h1>
            <p className="text-muted-foreground font-body text-sm mt-1.5">
              {filtered.length} produto{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3 mb-8 p-4 bg-card rounded-xl border border-border">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 text-sm font-body px-4 py-2 rounded-lg border transition-all duration-200 ${showFilters ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"}`}
            >
              <SlidersHorizontal size={15} /> Filtros
            </button>
            
            <div className="relative ml-auto">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="appearance-none bg-background text-foreground text-sm font-body px-4 py-2 pr-8 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer transition-all duration-200"
              >
                <option value="default">Ordenar por</option>
                <option value="price_asc">Menor preço</option>
                <option value="price_desc">Maior preço</option>
                <option value="name">Nome A-Z</option>
                <option value="rating">Avaliação</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Price filters */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
              {[
                { value: "all", label: "Todos" },
                { value: "under1000", label: "Até R$1.000" },
                { value: "1000to5000", label: "R$1.000 - R$5.000" },
                { value: "over5000", label: "Acima de R$5.000" },
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setPriceFilter(f.value)}
                  className={`text-xs font-body px-4 py-2 rounded-full border transition-all duration-200 ${priceFilter === f.value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 bg-card"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {/* Product grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <Package size={48} className="mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground font-body text-lg">Nenhum produto encontrado nesta categoria.</p>
              <Link to="/" className="inline-flex items-center gap-2 text-primary font-body font-medium mt-4 hover:underline">
                Voltar ao início
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
