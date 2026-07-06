import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import Shell from "./components/Shell";
import AskClaude from "./pages/AskClaude";
import Dashboard from "./pages/Dashboard";
import Distributions from "./pages/Distributions";
import Donations from "./pages/Donations";
import Inventory from "./pages/Inventory";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Orders from "./pages/Orders";
import Register from "./pages/Register";
import Reports from "./pages/Reports";

function PublicOnly() {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

function Protected() {
  const { token, onboarded } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/login" replace />;
  if (!onboarded && location.pathname !== "/onboarding") return <Navigate to="/onboarding" replace />;
  if (onboarded && location.pathname === "/onboarding") return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnly />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<Protected />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<Shell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/distributions" element={<Distributions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/ask" element={<AskClaude />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
