import { Routes, Route, Navigate } from "react-router-dom";
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
import UnauthorizedPage from "./pages/UnauthorizedPage"; // Import the component

export default function App() {
  // Store user info including role
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Check for token
  const isLoggedIn = !!user;

  // Login handler
  const handleLogin = (userData) => {
    setUser({
      username: userData.username,
      role: userData.role || 'user'
    });
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Helper function to check if a route is restricted
  const isRestricted = (path) => {
    // If no user or user is not 'alten', allow all routes
    if (!user || user.role !== 'alten') return false;
    
    // For 'alten' users, only allow companies and appointments
    const allowedPaths = ['/companies', '/appointments'];
    return !allowedPaths.includes(path);
  };

  return (
    <>
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <Routes>
        {/* CHANGE 2: Add a proper "/login" route */}
        <Route 
          path="/login" 
          element={
            user 
              ? <Navigate to="/" replace /> 
              : <LoginPage onLogin={handleLogin} />
          } 
        />

        {/* CHANGE 3: Fix the root redirect to use "/login" instead of "/LoginPage" */}
        <Route
          path="/"
          element={
            user
              ? (user.role === 'alten'
                  ? <Navigate to="/appointments" replace />
                  : <Navigate to="/dashboard" replace />)
              : <Navigate to="/login" replace />
          }
        />
        
        {/* Routes conditionally restricted based on role */}
        
        <Route 
          path="/dashboard" 
          element={isRestricted('/dashboard') ? <Navigate to="/unauthorized" replace /> : <Dashboard />} 
        />
        
        <Route 
          path="/appointments" 
          element={<ViewAppointments user={user} />} 
        />
        
        <Route 
          path="/insert" 
          element={isRestricted('/insert') ? <Navigate to="/unauthorized" replace /> : <InsertAppointment />} 
        />
        
        <Route 
          path="/companies" 
          element={<Companies user={user} />} 
        />
        
        <Route 
          path="/insert-company" 
          element={isRestricted('/insert-company') ? <Navigate to="/unauthorized" replace /> : <InsertCompany />} 
        />
        
        <Route 
          path="/key-people" 
          element={isRestricted('/key-people') ? <Navigate to="/unauthorized" replace /> : <KeyPeople />} 
        />
        
        <Route 
          path="/insert-key-people" 
          element={isRestricted('/insert-key-people') ? <Navigate to="/unauthorized" replace /> : <InsertKeyPeople />} 
        />
        
        <Route 
          path="/insert-initiative" 
          element={isRestricted('/insert-initiative') ? <Navigate to="/unauthorized" replace /> : <InsertInitiative />} 
        />
        
        {/* Unauthorized page */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* CHANGE 4: Add a catch-all route for unmatched paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}