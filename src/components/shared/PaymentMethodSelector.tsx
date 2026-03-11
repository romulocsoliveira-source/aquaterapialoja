import { CreditCard, QrCode, Banknote, Smartphone } from "lucide-react";

const PAYMENT_METHODS = [
  { id: "pix", label: "PIX", desc: "Pagamento instantâneo", icon: QrCode },
  { id: "credit_card", label: "Cartão de Crédito", desc: "Até 12x sem juros", icon: CreditCard },
  { id: "debit_card", label: "Cartão de Débito", desc: "Débito na hora", icon: Smartphone },
  { id: "dinheiro", label: "Dinheiro", desc: "Pagamento na loja", icon: Banknote },
];

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function PaymentMethodSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium mb-2 flex items-center gap-2">
        <CreditCard className="w-4 h-4" /> Forma de Pagamento
      </label>
      <div className="grid grid-cols-2 gap-2">
        {PAYMENT_METHODS.map((pm) => {
          const Icon = pm.icon;
          const isSelected = value === pm.id;
          return (
            <button
              key={pm.id}
              type="button"
              onClick={() => onChange(pm.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-sm font-medium">{pm.label}</p>
                  <p className="text-[10px] text-muted-foreground">{pm.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
