import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MapPin, Lock, CreditCard } from "lucide-react";
import { useIsAdmin } from "@/hooks/useAdminRole";
import { useStoreConfig } from "@/hooks/useStoreConfig";
import { useCategories } from "@/hooks/useStoreData";

export default function Footer() {
  const { data: isAdmin } = useIsAdmin();
  const { data: storeConfig } = useStoreConfig();
  const { data: categories = [] } = useCategories();

  const storeName = storeConfig?.trade_name || storeConfig?.company_name || "Aquaterapia";
  const logoUrl = storeConfig?.logo_url;
  const phone = storeConfig?.phone || "(18) 99657-0512";
  const email = storeConfig?.email || "contato@aquaterapia.com.br";
  const address = storeConfig?.street
    ? `${storeConfig.street}, ${storeConfig.number || ""}${storeConfig.complement ? ` - ${storeConfig.complement}` : ""} – ${storeConfig.neighborhood || ""}, ${storeConfig.city || ""} – ${storeConfig.state || ""}, ${storeConfig.zip_code || ""}`
    : "Av. Getúlio Vargas, 339 – Vila Nova Santana, Assis – SP";

  const topCats = categories.filter(c => !c.parent).slice(0, 6);

  return (
    <footer className="bg-black text-white/80 mt-0 border-t border-white/[0.06]">
      <div className="container py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="space-y-5">
          {logoUrl ? (
            <img src={logoUrl} alt={storeName} className="h-20 w-auto object-contain" />
          ) : (
            <h3 className="font-display text-2xl font-bold text-white">{storeName}</h3>
          )}
          <p className="text-sm text-white/40 leading-relaxed">
            Sua loja premium de produtos para pets. Qualidade, carinho e confiança em cada entrega.
          </p>
          <div className="flex gap-3">
            <a href="#" className="text-white/30 hover:text-brand-gold transition-colors" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="#" className="text-white/30 hover:text-brand-gold transition-colors" aria-label="Facebook"><Facebook size={18} /></a>
            <a href={`mailto:${email}`} className="text-white/30 hover:text-brand-gold transition-colors" aria-label="Email"><Mail size={18} /></a>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-gold-light mb-5">Categorias</h4>
          <ul className="space-y-2.5">
            {topCats.map(cat => (
              <li key={cat.slug}><Link to={`/categoria/${cat.slug}`} className="text-sm text-white/40 hover:text-white/80 transition-colors">{cat.name}</Link></li>
            ))}
            <li><Link to="/categoria/promocoes" className="text-sm text-brand-gold-light hover:text-brand-gold transition-colors font-medium">Promoções</Link></li>
          </ul>
        </div>

        {/* Institutional */}
        <div>
          <h4 className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-gold-light mb-5">Institucional</h4>
          <ul className="space-y-2.5">
            {["Sobre Nós", "Política de Privacidade", "Trocas e Devoluções", "Termos de Uso", "FAQ"].map(l => (
              <li key={l}><Link to="/" className="text-sm text-white/40 hover:text-white/80 transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-body text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-gold-light mb-5">Contato</h4>
          <div className="space-y-3">
            <a href={`tel:${phone.replace(/\D/g, "")}`} className="flex items-center gap-2.5 text-sm text-white/40 hover:text-white/80 transition-colors"><Phone size={14} /> {phone}</a>
            <a href={`mailto:${email}`} className="flex items-center gap-2.5 text-sm text-white/40 hover:text-white/80 transition-colors"><Mail size={14} /> {email}</a>
            <span className="flex items-start gap-2.5 text-sm text-white/40"><MapPin size={14} className="mt-0.5 flex-shrink-0" /> {address}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06]">
        <div className="container py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="text-[11px] text-white/25">
            © {new Date().getFullYear()} {storeName}. Todos os direitos reservados.
          </span>
          <span className="text-[11px] text-white/25">
            Desenvolvido por <span className="font-semibold text-white/35">Romulo de Oliveira</span>
          </span>
          {isAdmin && (
            <div className="flex items-center gap-4">
              <Link to="/admin" className="flex items-center gap-1 text-[11px] text-white/15 hover:text-white/40 transition-colors">
                <Lock size={11} /> Admin
              </Link>
              <Link to="/pdv" className="flex items-center gap-1 text-[11px] text-primary-foreground/15 hover:text-primary-foreground/40 transition-colors">
                <CreditCard size={11} /> PDV
              </Link>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
