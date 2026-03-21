import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useStoreConfig } from "@/hooks/useStoreConfig";

export function getWhatsAppUrl(message: string, number?: string) {
  const n = number || "5518996570512";
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}

export function getProductWhatsAppUrl(productName: string, productPrice: string, productUrl: string) {
  const msg = `Olá! Gostaria de mais informações sobre:\n\n🛒 *${productName}*\n💰 ${productPrice}\n🔗 ${productUrl}\n\nPode me ajudar?`;
  return getWhatsAppUrl(msg);
}

export function getCartWhatsAppUrl(items: { name: string; qty: number; price: string }[], total: string) {
  let msg = `Olá! Gostaria de finalizar meu pedido:\n\n`;
  items.forEach((item, i) => {
    msg += `${i + 1}. ${item.name} (x${item.qty}) — ${item.price}\n`;
  });
  msg += `\n💰 *Total: ${total}*\n\nPode me ajudar a finalizar?`;
  return getWhatsAppUrl(msg);
}

export default function WhatsAppButton() {
  const { data: storeConfig } = useStoreConfig();
  const whatsapp = storeConfig?.whatsapp?.replace(/\D/g, "") || "5518996570512";
  const storeName = storeConfig?.trade_name || storeConfig?.company_name || "Aquaterapia";
  const defaultMsg = `Olá! Vim da loja ${storeName} e gostaria de mais informações.`;

  return (
    <motion.a
      href={getWhatsAppUrl(defaultMsg, whatsapp)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-primary-foreground p-3.5 rounded-full shadow-lg hover:scale-110 transition-transform"
      aria-label="WhatsApp"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring" }}
    >
      <MessageCircle size={26} />
    </motion.a>
  );
}
