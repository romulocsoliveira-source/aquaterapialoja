import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";
import WhatsAppButton from "@/components/store/WhatsAppButton";
import AIChatWidget from "@/components/store/AIChatWidget";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import AccountPage from "./pages/AccountPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminPage from "./pages/AdminPage";
import PDVPage from "./pages/PDVPage";
import CheckoutPage from "./pages/CheckoutPage";
import AgendamentoPage from "./pages/AgendamentoPage";
import HotelPetPage from "./pages/HotelPetPage";
import ForcePasswordChangePage from "./pages/ForcePasswordChangePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Admin & PDV routes without store header/footer */}
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/trocar-senha" element={<ForcePasswordChangePage />} />
                <Route path="/pdv" element={<PDVPage />} />

                {/* Store routes with header/footer */}
                <Route path="*" element={
                  <>
                    <Header />
                    <CartDrawer />
                    <WhatsAppButton />
                    <AIChatWidget />
                    <main className="min-h-screen">
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/categoria/:slug" element={<CategoryPage />} />
                        <Route path="/produto/:slug" element={<ProductPage />} />
                        <Route path="/conta" element={<AccountPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/favoritos" element={<AccountPage />} />
                        <Route path="/reset-password" element={<ResetPasswordPage />} />
                        {/* Agendamento and Hotel routes removed */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </main>
                    <Footer />
                  </>
                } />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
