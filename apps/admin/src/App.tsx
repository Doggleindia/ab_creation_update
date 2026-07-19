import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Applications from "./pages/Applications";
import Catalog from "./pages/Catalog";
import Financials from "./pages/Financials";
import Production from "./pages/Production";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/sellers" element={<Applications type="seller" />} />
        <Route path="/bulk-orders" element={<Applications type="bulk" />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/financials" element={<Financials />} />
        <Route path="/production" element={<Production />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
