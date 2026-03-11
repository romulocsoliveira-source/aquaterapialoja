import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import AuthForm from "@/components/account/AuthForm";
import AccountDashboard from "@/components/account/AccountDashboard";

export default function AccountPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container py-20 flex justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return user ? <AccountDashboard /> : <AuthForm />;
}
