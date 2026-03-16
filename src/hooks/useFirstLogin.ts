import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export function useFirstLogin() {
  const { user, loading: authLoading } = useAuth();
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setNeedsPasswordChange(false);
      setLoading(false);
      return;
    }

    const check = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("first_login")
        .eq("user_id", user.id)
        .single();

      setNeedsPasswordChange(data?.first_login === true);
      setLoading(false);
    };

    check();
  }, [user, authLoading]);

  return { needsPasswordChange, loading };
}
