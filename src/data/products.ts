export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  promoPrice?: number;
  category: string;
  categorySlug: string;
  parentCategory?: string;
  image: string;
  images: string[];
  description: string;
  benefits?: string[];
  specs?: string[];
  instructions?: string;
  rating: number;
  reviews: number;
  badge?: string;
  variations?: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  sku: string;
  barcode: string;
  stock: number;
  costPrice?: number;
  unitMeasure?: string;
}

export interface Category {
  name: string;
  slug: string;
  image: string;
  count: number;
  parent?: string;
}

export const categories: Category[] = [
  { name: "Banho e Tosa", slug: "banho-tosa", image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&h=500&fit=crop", count: 0, parent: "Serviços" },
  { name: "Produtos Pet", slug: "produtos-pet", image: "https://images.unsplash.com/photo-1583337130417-13571f7aa56b?w=400&h=500&fit=crop", count: 0, parent: "Loja" },
  { name: "Rações", slug: "racoes", image: "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=400&h=500&fit=crop", count: 0, parent: "Loja" },
  { name: "Brinquedos", slug: "brinquedos", image: "https://images.unsplash.com/photo-1535294435445-d7249524ef2e?w=400&h=500&fit=crop", count: 0, parent: "Loja" },
  { name: "Higiene Pet", slug: "higiene-pet", image: "https://images.unsplash.com/photo-1583337130417-13571f7aa56b?w=400&h=500&fit=crop", count: 0, parent: "Loja" },
  { name: "Acessórios Pet", slug: "acessorios-pet", image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=500&fit=crop", count: 0 },
  { name: "Promoções", slug: "promocoes", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=500&fit=crop", count: 0 },
  { name: "Lançamentos", slug: "lancamentos", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=500&fit=crop", count: 0 },
];

// Products are loaded from the database via useStoreData hook
export const products: Product[] = [];
