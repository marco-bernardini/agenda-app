import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import sdgLogo from "/sdg-logo-2.png";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const [showInsertDropdown, setShowInsertDropdown] = useState(false);

  // Check if user is 'alten' role
  const isAlten = user.role === 'alten';

  function logout() {
    onLogout();
    navigate("/login");
  }

  return (
    <nav
      className="bg-gradient-to-br from-[#2A66DD] to-[#1DC8DF]"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        zIndex: 1000,
        padding: "1rem 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ display: "flex", gap: "2rem", alignItems: "center", position: "relative" }}>
        <img
          src={sdgLogo}
          alt="SDG Logo"
          style={{ height: "40px", width: "auto", marginRight: "1.5rem" }}
        />
        
        {/* Only show Dashboard if NOT 'alten' */}
        {!isAlten && (
          <Link
            to="/dashboard"
            style={{
              color: "white",
              fontSize: "1.3rem",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Dashboard
          </Link>
        )}
        
        {/* Always show Appointments */}
        <Link
          to="/appointments"
          style={{
            color: "white",
            fontSize: "1.3rem",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Appuntamenti
        </Link>
        
        {/* Always show Companies */}
        <Link
          to="/companies"
          style={{
            color: "white",
            fontSize: "1.3rem",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Clienti
        </Link>
        
        {/* Only show Key People if NOT 'alten' */}
        {!isAlten && (
          <Link
            to="/key-people"
            style={{
              color: "white",
              fontSize: "1.3rem",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Key People
          </Link>
        )}
        
        {/* Only show Insert dropdown if NOT 'alten' */}
        {!isAlten && (
          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setShowInsertDropdown(true)}
            onMouseLeave={() => setShowInsertDropdown(false)}
          >
            <div
              style={{
                color: "white",
                fontSize: "1.3rem",
                textDecoration: "none",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              Inserisci ▼
            </div>
            {showInsertDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  backgroundColor: "white",
                  borderRadius: "6px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  width: "180px",
                  zIndex: 1001,
                }}
              >
                <Link
                  to="/insert"
                  style={{
                    display: "block",
                    padding: "0.8rem 1.2rem",
                    color: "#2A66DD",
                    textDecoration: "none",
                    fontWeight: "500",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  Appuntamento
                </Link>
                <Link
                  to="/insert-company"
                  style={{
                    display: "block",
                    padding: "0.8rem 1.2rem",
                    color: "#2A66DD",
                    textDecoration: "none",
                    fontWeight: "500",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  Cliente
                </Link>
                <Link
                  to="/insert-initiative"
                  style={{
                    display: "block",
                    padding: "0.8rem 1.2rem",
                    color: "#2A66DD",
                    textDecoration: "none",
                    fontWeight: "500",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  Iniziativa
                </Link>
                <Link
                  to="/insert-key-people"
                  style={{
                    display: "block",
                    padding: "0.8rem 1.2rem",
                    color: "#2A66DD",
                    textDecoration: "none",
                    fontWeight: "500",
                  }}
                >
                  Key People
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
      
      <button
        onClick={logout}
        style={{
          color: "white",
          background: "transparent",
          border: "2px solid white",
          borderRadius: "6px",
          fontSize: "1.2rem",
          fontWeight: "bold",
          padding: "0.5rem 1rem",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </nav>
  );
}