import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const WHATSAPP_NUMBER = "5518996570512";
const STORE_NAME = "AQUATERAPIA PET SHOP";

export function getWhatsAppUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function getProductWhatsAppUrl(productName: string, productPrice: string, productUrl: string) {
  const msg = `Olá! Vim do ${STORE_NAME} e gostaria de mais informações sobre:\n\n🐾 *${productName}*\n💰 ${productPrice}\n🔗 ${productUrl}\n\nPode me ajudar?`;
  return getWhatsAppUrl(msg);
}

export function getCartWhatsAppUrl(items: { name: string; qty: number; price: string }[], total: string) {
  let msg = `Olá! Vim do ${STORE_NAME} e gostaria de finalizar meu pedido:\n\n`;
  items.forEach((item, i) => {
    msg += `${i + 1}. ${item.name} (x${item.qty}) — ${item.price}\n`;
  });
  msg += `\n💰 *Total: ${total}*\n\nPode me ajudar a finalizar?`;
  return getWhatsAppUrl(msg);
}

export default function WhatsAppButton() {
  const defaultMsg = `Olá! Vim do ${STORE_NAME} e gostaria de mais informações.`;

  return (
    <motion.a
      href={getWhatsAppUrl(defaultMsg)}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
      aria-label="WhatsApp"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring" }}
    >
      <MessageCircle size={28} />
    </motion.a>
  );
}
