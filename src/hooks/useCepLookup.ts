import { useState } from "react";
import { toast } from "sonner";

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export function useCepLookup() {
  const [loading, setLoading] = useState(false);

  const lookupCep = async (cep: string): Promise<ViaCepResponse | null> => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return null;

    setLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data: ViaCepResponse = await res.json();
      if (data.erro) {
        toast.error("CEP não encontrado");
        return null;
      }
      return data;
    } catch {
      toast.error("Erro ao buscar CEP");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return digits;
  };

  return { lookupCep, loading, formatCep };
}
