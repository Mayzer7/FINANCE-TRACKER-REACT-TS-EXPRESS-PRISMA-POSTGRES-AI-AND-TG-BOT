import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import { FinanceProvider } from "@/contexts/FinanceContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { ExpensesPage } from "@/pages/ExpensesPage";
import { GoalsPage } from "@/pages/GoalsPage";
import { IncomePage } from "@/pages/IncomePage";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RegisterPage } from "@/pages/RegisterPage";
import { TransactionsPage } from "@/pages/TransactionsPage";

function AuthEntryRedirect() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (session) {
    return <Navigate to="/app/expenses" replace />;
  }

  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FinanceProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="expenses" replace />} />
                <Route path="expenses" element={<ExpensesPage />} />
                <Route path="income" element={<IncomePage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="goals" element={<GoalsPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
              <Route path="*" element={<AuthEntryRedirect />} />
            </Routes>
          </BrowserRouter>
        </FinanceProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
