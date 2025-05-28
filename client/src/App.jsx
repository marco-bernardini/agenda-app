import { Routes, Route, useNavigate } from "react-router-dom";
import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ViewAppointments from "./pages/ViewAppointments";
import Navbar from "./components/Navbar";
import InsertAppointment from "./pages/InsertAppointment";
import InsertCompany from "./pages/InsertCompany";
import Companies from "./pages/Companies";
import InsertKeyPeople from "./pages/InsertKeyPeople";
import KeyPeople from "./pages/KeyPeople";
import InsertInitiative from "./pages/InsertInitiative";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  if (!isLoggedIn) return <LoginPage onLogin={() => setIsLoggedIn(true)} />;

  return (
    <>
      <Navbar onLogout={() => setIsLoggedIn(false)} />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/appointments" element={<ViewAppointments />} />
        <Route path="/insert" element={<InsertAppointment />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/insert-company" element={<InsertCompany />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/insert-key-people" element={<InsertKeyPeople />} />
        <Route path="/key-people" element={<KeyPeople />} />
        <Route path="/insert-initiative" element={<InsertInitiative />} />
      </Routes>
    </>
  );
}