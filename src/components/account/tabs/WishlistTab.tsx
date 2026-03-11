import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Trash2 } from "lucide-react";
import { useProducts } from "@/hooks/useStoreData";
import ProductCard from "@/components/store/ProductCard";
import { toast } from "sonner";

export default function WishlistTab() {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    if (!user) return;
    const { data } = await supabase.from("wishlist").select("product_id").eq("user_id", user.id);
    setWishlistIds(data?.map(w => w.product_id) || []);
    setLoading(false);
  };

  useEffect(() => { fetchWishlist(); }, [user]);

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;
    await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", productId);
    setWishlistIds(prev => prev.filter(id => id !== productId));
    toast.success("Removido dos favoritos");
  };

  const { data: products = [] } = useProducts();
  const wishlistProducts = products.filter(p => wishlistIds.includes(p.id));

  if (loading) return <div className="text-center py-12 text-muted-foreground font-body">Carregando...</div>;

  if (wishlistProducts.length === 0) {
    return (
      <div className="text-center py-16">
        <Heart size={48} className="text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground font-body">Sua lista de desejos está vazia.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {wishlistProducts.map(product => (
        <div key={product.id} className="relative">
          <ProductCard product={product} />
          <button
            onClick={() => removeFromWishlist(product.id)}
            className="absolute top-2 right-2 z-10 bg-destructive/80 text-white p-1.5 rounded-full hover:bg-destructive transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
