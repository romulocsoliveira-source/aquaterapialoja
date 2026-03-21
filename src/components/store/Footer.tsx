import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MapPin, ShieldCheck, Truck, Heart, Lock, CreditCard } from "lucide-react";
import { useIsAdmin } from "@/hooks/useAdminRole";
import { useStoreConfig } from "@/hooks/useStoreConfig";
import { useCategories } from "@/hooks/useStoreData";

export default function Footer() {
  const { data: isAdmin } = useIsAdmin();
  const { data: storeConfig } = useStoreConfig();
  const { data: categories = [] } = useCategories();

  const storeName = storeConfig?.trade_name || storeConfig?.company_name || "Aquaterapia";
  const phone = storeConfig?.phone || "(18) 99657-0512";
  const email = storeConfig?.email || "contato@aquaterapia.com.br";
  const address = storeConfig?.street
    ? `${storeConfig.street}, ${storeConfig.number || ""}${storeConfig.complement ? ` - ${storeConfig.complement}` : ""} – ${storeConfig.neighborhood || ""}, ${storeConfig.city || ""} – ${storeConfig.state || ""}, ${storeConfig.zip_code || ""}`
    : "Av. Getúlio Vargas, 339 – Vila Nova Santana, Assis – SP, 19807-130";

  const topCats = categories.filter(c => !c.parent).slice(0, 6);

  return (
    <footer className="bg-foreground text-primary-foreground/80 mt-20">
      {/* Trust bar */}
      <div className="border-b border-primary-foreground/10">
        <div className="container py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: ShieldCheck, title: "Qualidade Garantida", desc: "Marcas confiáveis" },
            { icon: Truck, title: "Entrega Rápida", desc: "Para Assis e região" },
            { icon: CreditCard, title: "Pagamento Seguro", desc: "Cartão, PIX e boleto" },
            { icon: Heart, title: "Atendimento", desc: "Suporte especializado" },
          ].map(item => (
            <div key={item.title} className="flex flex-col items-center gap-2">
              <item.icon size={24} className="text-primary-foreground/60" />
              <span className="text-sm font-semibold text-primary-foreground/90">{item.title}</span>
              <span className="text-xs text-primary-foreground/50">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="container py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-display text-xl font-bold text-primary-foreground mb-4">{storeName.toUpperCase()}</h3>
          <p className="text-sm text-primary-foreground/50 leading-relaxed">
            Produtos premium para cães, gatos, peixes e mais. Qualidade e carinho em cada detalhe.
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#" className="text-primary-foreground/40 hover:text-primary-foreground/80 transition-colors" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="#" className="text-primary-foreground/40 hover:text-primary-foreground/80 transition-colors" aria-label="Facebook"><Facebook size={18} /></a>
            <a href={`mailto:${email}`} className="text-primary-foreground/40 hover:text-primary-foreground/80 transition-colors" aria-label="Email"><Mail size={18} /></a>
          </div>
        </div>

        <div>
          <h4 className="font-body text-xs font-semibold uppercase tracking-wider text-primary-foreground/60 mb-4">Categorias</h4>
          <ul className="space-y-2">
            {topCats.map(cat => (
              <li key={cat.slug}><Link to={`/categoria/${cat.slug}`} className="text-sm text-primary-foreground/50 hover:text-primary-foreground/90 transition-colors">{cat.name}</Link></li>
            ))}
            <li><Link to="/categoria/promocoes" className="text-sm text-primary-foreground/50 hover:text-primary-foreground/90 transition-colors">Promoções</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-body text-xs font-semibold uppercase tracking-wider text-primary-foreground/60 mb-4">Institucional</h4>
          <ul className="space-y-2">
            {["Sobre Nós", "Política de Privacidade", "Trocas e Devoluções", "Termos de Uso", "FAQ"].map(l => (
              <li key={l}><Link to="/" className="text-sm text-primary-foreground/50 hover:text-primary-foreground/90 transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-body text-xs font-semibold uppercase tracking-wider text-primary-foreground/60 mb-4">Contato</h4>
          <div className="space-y-3">
            <a href={`tel:${phone.replace(/\D/g, "")}`} className="flex items-center gap-2 text-sm text-primary-foreground/50 hover:text-primary-foreground/90 transition-colors"><Phone size={14} /> {phone}</a>
            <a href={`mailto:${email}`} className="flex items-center gap-2 text-sm text-primary-foreground/50 hover:text-primary-foreground/90 transition-colors"><Mail size={14} /> {email}</a>
            <span className="flex items-start gap-2 text-sm text-primary-foreground/50"><MapPin size={14} className="mt-0.5 flex-shrink-0" /> {address}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <span className="text-xs text-primary-foreground/30">
            © {new Date().getFullYear()} {storeName}. Todos os direitos reservados.
          </span>
          <span className="text-xs text-primary-foreground/30">
            Desenvolvido por <span className="font-semibold text-primary-foreground/40">Romulo de Oliveira</span>
          </span>
          {isAdmin && (
            <div className="flex items-center gap-4">
              <Link to="/admin" className="flex items-center gap-1 text-xs text-primary-foreground/20 hover:text-primary-foreground/50 transition-colors">
                <Lock size={11} /> Admin
              </Link>
              <Link to="/pdv" className="flex items-center gap-1 text-xs text-primary-foreground/20 hover:text-primary-foreground/50 transition-colors">
                <CreditCard size={11} /> PDV
              </Link>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
