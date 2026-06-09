import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product, Category } from "@/data/products";

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("store_products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    promoPrice: p.promo_price ? Number(p.promo_price) : undefined,
    category: p.category,
    categorySlug: p.category_slug,
    parentCategory: p.parent_category || undefined,
    image: p.image || "",
    images: p.images || [],
    description: p.description || "",
    benefits: p.benefits || [],
    specs: p.specs || [],
    instructions: p.instructions || undefined,
    rating: Number(p.rating) || 0,
    reviews: p.reviews || 0,
    badge: p.badge || undefined,
    variations: (p.variations || []).length > 0 ? p.variations : undefined,
    isNew: p.is_new || false,
    isBestSeller: p.is_best_seller || false,
    sku: p.sku,
    barcode: p.barcode,
    stock: p.stock || 0,
    costPrice: p.cost_price ? Number(p.cost_price) : 0,
    unitMeasure: (p.unit_measure || "UN").toString().toUpperCase(),
  } as Product));
}

async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("store_categories")
    .select("*")
    .order("name");

  if (error) throw error;

  return (data || []).map((c: any) => ({
    name: c.name,
    slug: c.slug,
    image: c.image || "",
    count: 0,
    parent: c.parent || undefined,
  }));
}

export function useProducts() {
  return useQuery({
    queryKey: ["store-products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 30,
  });
}

export function useCategories() {
  const productsQuery = useProducts();
  
  return useQuery({
    queryKey: ["store-categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 30,
    select: (categories) => {
      const products = productsQuery.data || [];
      return categories.map(cat => ({
        ...cat,
        count: products.filter(p => p.categorySlug === cat.slug).length,
      }));
    },
    enabled: productsQuery.isSuccess,
  });
}

export function useProduct(slug: string | undefined) {
  const { data: products } = useProducts();
  return products?.find(p => p.slug === slug);
}
