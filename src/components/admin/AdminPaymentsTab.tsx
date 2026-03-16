import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminPaymentsTab() {
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["admin-deployment-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deployment_payments" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const handleConfirm = async (paymentId: string, userId: string) => {
    const { error } = await supabase
      .from("deployment_payments" as any)
      .update({ status: "pago", confirmed_at: new Date().toISOString() } as any)
      .eq("id", paymentId);
    if (error) {
      toast.error("Erro ao confirmar: " + error.message);
    } else {
      toast.success("Pagamento confirmado!");
      queryClient.invalidateQueries({ queryKey: ["admin-deployment-payments"] });
    }
  };

  const handleCancel = async (paymentId: string) => {
    const { error } = await supabase
      .from("deployment_payments" as any)
      .update({ status: "cancelado" } as any)
      .eq("id", paymentId);
    if (error) {
      toast.error("Erro: " + error.message);
    } else {
      toast.success("Pagamento cancelado.");
      queryClient.invalidateQueries({ queryKey: ["admin-deployment-payments"] });
    }
  };

  const statusIcon = (status: string) => {
    if (status === "pago") return <CheckCircle2 size={16} className="text-green-500" />;
    if (status === "cancelado") return <XCircle size={16} className="text-red-500" />;
    return <Clock size={16} className="text-yellow-500" />;
  };

  const statusLabel = (status: string) => {
    if (status === "pago") return "Pago";
    if (status === "cancelado") return "Cancelado";
    return "Pendente";
  };

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Pagamentos de Implantação</h2>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left p-3 font-semibold text-muted-foreground">Usuário</th>
              <th className="text-left p-3 font-semibold text-muted-foreground">Status</th>
              <th className="text-left p-3 font-semibold text-muted-foreground">Valor</th>
              <th className="text-left p-3 font-semibold text-muted-foreground">Solicitado em</th>
              <th className="text-left p-3 font-semibold text-muted-foreground">Confirmado em</th>
              <th className="text-right p-3 font-semibold text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Nenhum pagamento registrado.</td></tr>
            )}
            {payments.map((p: any) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="p-3 font-mono text-xs">{p.user_id?.substring(0, 8)}...</td>
                <td className="p-3">
                  <span className="flex items-center gap-1.5">
                    {statusIcon(p.status)}
                    {statusLabel(p.status)}
                  </span>
                </td>
                <td className="p-3 font-bold">R$ {Number(p.amount).toFixed(2)}</td>
                <td className="p-3 text-muted-foreground text-xs">
                  {p.requested_at ? new Date(p.requested_at).toLocaleString("pt-BR") : "—"}
                </td>
                <td className="p-3 text-muted-foreground text-xs">
                  {p.confirmed_at ? new Date(p.confirmed_at).toLocaleString("pt-BR") : "—"}
                </td>
                <td className="p-3 text-right">
                  {p.status === "pendente" && p.requested_at && (
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" onClick={() => handleConfirm(p.id, p.user_id)} className="text-xs">
                        Confirmar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleCancel(p.id)} className="text-xs">
                        Recusar
                      </Button>
                    </div>
                  )}
                  {p.status === "pago" && <span className="text-green-500 text-xs font-medium">✓ Confirmado</span>}
                  {p.status === "cancelado" && <span className="text-red-500 text-xs font-medium">Cancelado</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
