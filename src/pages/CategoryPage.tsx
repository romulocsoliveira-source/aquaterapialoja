import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useProducts, useCategories } from "@/hooks/useStoreData";
import ProductCard from "@/components/store/ProductCard";
import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

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

  // Sort
  if (sortBy === "price_asc") filtered = [...filtered].sort((a, b) => (a.promoPrice || a.price) - (b.promoPrice || b.price));
  if (sortBy === "price_desc") filtered = [...filtered].sort((a, b) => (b.promoPrice || b.price) - (a.promoPrice || a.price));
  if (sortBy === "name") filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  if (sortBy === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  const categoryName = category?.name || (slug === "promocoes" ? "Promoções" : "Produtos");

  if (isLoading) {
    return (
      <div className="container py-8 md:py-16">
        <div className="mb-8">
          <div className="h-10 w-48 bg-card rounded animate-pulse" />
          <div className="h-4 w-32 bg-card rounded animate-pulse mt-2" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card rounded-lg border border-border aspect-[3/4] animate-pulse" />
          ))}
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
      <div className="container py-8 md:py-16">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold">{categoryName}</h1>
          <p className="text-muted-foreground font-body text-sm mt-2">{filtered.length} produto{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground border border-border px-4 py-2 rounded-lg transition-colors">
            <SlidersHorizontal size={16} /> Filtros
          </button>
          
          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="appearance-none bg-secondary text-foreground text-sm font-body px-4 py-2 pr-8 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent/50 cursor-pointer"
            >
              <option value="default">Ordenar por</option>
              <option value="price_asc">Menor preço</option>
              <option value="price_desc">Maior preço</option>
              <option value="name">Nome A-Z</option>
              <option value="rating">Avaliação</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          {showFilters && (
            <div className="flex flex-wrap gap-2">
              {[
                { value: "all", label: "Todos" },
                { value: "under1000", label: "Até R$1.000" },
                { value: "1000to5000", label: "R$1.000 - R$5.000" },
                { value: "over5000", label: "Acima de R$5.000" },
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setPriceFilter(f.value)}
                  className={`text-xs font-body px-3 py-1.5 rounded-full border transition-colors ${priceFilter === f.value ? "bg-accent text-accent-foreground border-accent" : "border-border text-muted-foreground hover:text-foreground"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-body">Nenhum produto encontrado nesta categoria.</p>
          </div>
        )}
      </div>
    </>
  );
}
