import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, CheckCircle2, Clock, CreditCard, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDeploymentPayment } from "@/hooks/useDeploymentPayment";
import { motion } from "framer-motion";
import logoImg from "@/assets/logo-aquaterapia.png";

function generatePixPayload(pixKey: string, amount: number, description: string): string {
  // EMV PIX payload simplified (static QR)
  const pad = (id: string, val: string) => id + String(val.length).padStart(2, "0") + val;
  
  const gui = pad("00", "br.gov.bcb.pix");
  const key = pad("01", pixKey);
  const mai = pad("26", gui + key);
  
  const pfi = pad("00", "01"); // payload format
  const mic = pad("52", "0000"); // merchant category
  const tcc = pad("53", "986"); // BRL
  const amt = pad("54", amount.toFixed(2));
  const cc = pad("58", "BR"); // country
  const mn = pad("59", "LOJA PERFEITA");
  const mc = pad("60", "ASSIS");
  const desc = pad("05", description.substring(0, 25));
  const addData = pad("62", desc);
  
  const payload = pfi + mai + mic + tcc + amt + cc + mn + mc + addData + "6304";
  
  // CRC16-CCITT
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
      else crc <<= 1;
      crc &= 0xFFFF;
    }
  }
  
  return payload + crc.toString(16).toUpperCase().padStart(4, "0");
}

export default function PixActivationScreen({ onActivated }: { onActivated?: () => void }) {
  const { payment, isPaid, hasRequested, isLoading, createPayment, markAsRequested } = useDeploymentPayment();
  const [copied, setCopied] = useState(false);

  const pixKey = "18997348718";
  const amount = 300;
  const description = "Implantacao Loja Perfeita";
  const pixPayload = generatePixPayload(pixKey, amount, description);

  useEffect(() => {
    if (!isLoading && !payment) {
      createPayment.mutate();
    }
  }, [isLoading, payment]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isPaid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center shadow-xl"
        >
          <CheckCircle2 size={64} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Pagamento confirmado com sucesso!</h2>
          <p className="text-muted-foreground mb-6">Agora você pode iniciar a configuração da sua loja.</p>
          <Button onClick={onActivated} size="lg" className="w-full">
            Iniciar configuração da loja
          </Button>
        </motion.div>
      </div>
    );
  }

  if (hasRequested) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center shadow-xl"
        >
          <Clock size={64} className="mx-auto text-yellow-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Pagamento em análise</h2>
          <p className="text-muted-foreground mb-4">
            Recebemos sua confirmação de pagamento. Estamos verificando e em breve seu sistema será liberado.
          </p>
          <p className="text-sm text-muted-foreground">
            Você será notificado assim que o pagamento for confirmado.
          </p>
        </motion.div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    toast.success("Código PIX copiado!");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleConfirmPayment = () => {
    markAsRequested.mutate();
    toast.success("Confirmação enviada! Aguarde a verificação.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-card border border-border rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-xl"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <img src={logoImg} alt="Logo" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">ATIVAÇÃO DO SISTEMA</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Para iniciar a configuração da sua loja no sistema <strong>Loja Perfeita</strong>, é necessário realizar o pagamento da taxa de implantação.
          </p>
        </div>

        {/* Amount */}
        <div className="bg-primary/10 rounded-xl p-4 text-center mb-6">
          <CreditCard size={24} className="mx-auto text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Valor da implantação</p>
          <p className="text-3xl font-bold text-primary">R$ 300,00</p>
          <p className="text-sm text-muted-foreground">Pagamento via PIX</p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-xl">
            <QRCodeSVG value={pixPayload} size={220} level="M" />
          </div>
        </div>

        {/* Copy code */}
        <div className="mb-6">
          <p className="text-sm font-medium mb-2 text-center">Código PIX Copia e Cola</p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={pixPayload}
              className="flex-1 bg-secondary text-foreground px-3 py-2.5 rounded-lg text-xs font-mono truncate"
            />
            <Button onClick={handleCopy} variant="outline" className="gap-2 shrink-0">
              {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
              {copied ? "Copiado!" : "Copiar"}
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-secondary rounded-xl p-4 mb-6">
          <p className="text-sm font-medium mb-3 flex items-center gap-2">
            <Smartphone size={16} /> Como pagar
          </p>
          <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
            <li>Abra o aplicativo do seu banco</li>
            <li>Escolha pagar com PIX</li>
            <li>Escaneie o QR Code ou cole o código PIX</li>
            <li>Após o pagamento, clique em "Já paguei"</li>
          </ol>
        </div>

        {/* Confirm button */}
        <Button
          onClick={handleConfirmPayment}
          size="lg"
          className="w-full text-base"
          disabled={markAsRequested.isPending}
        >
          {markAsRequested.isPending ? "Enviando..." : "Já realizei o pagamento"}
        </Button>
      </motion.div>
    </div>
  );
}
