import { useState } from "react";
import { User, Package, Heart, MapPin, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import ProfileTab from "./tabs/ProfileTab";
import OrdersTab from "./tabs/OrdersTab";
import WishlistTab from "./tabs/WishlistTab";
import AddressesTab from "./tabs/AddressesTab";

const tabs = [
  { id: "profile", label: "Perfil", icon: User },
  { id: "orders", label: "Pedidos", icon: Package },
  { id: "wishlist", label: "Favoritos", icon: Heart },
  { id: "addresses", label: "Endereços", icon: MapPin },
] as const;

type TabId = typeof tabs[number]["id"];

export default function AccountDashboard() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  return (
    <div className="container py-8 md:py-12 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold">Minha Conta</h1>
        <Button variant="outline" size="sm" onClick={signOut} className="gap-2 text-muted-foreground hover:text-destructive">
          <LogOut size={16} /> Sair
        </Button>
      </div>

      {/* Tab nav */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1.5 py-3 rounded-xl font-body text-xs font-semibold transition-colors border ${
              activeTab === tab.id
                ? "bg-accent/10 border-accent text-accent"
                : "bg-secondary border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "profile" && <ProfileTab />}
      {activeTab === "orders" && <OrdersTab />}
      {activeTab === "wishlist" && <WishlistTab />}
      {activeTab === "addresses" && <AddressesTab />}
    </div>
  );
}
