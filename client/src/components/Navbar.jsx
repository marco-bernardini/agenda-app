import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import sdgLogo from "/sdg-logo-2.png"; // adjust path if needed

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const [showInsertDropdown, setShowInsertDropdown] = useState(false);

  function logout() {
    localStorage.removeItem("token");
    onLogout();
    navigate("/");
  }

  return (
    <nav
      className="bg-gradient-to-br from-[#2A66DD] to-[#1DC8DF]"
      style={{
        position: "fixed",           // Make navbar fixed
        top: 0,                      // Stick to top
        left: 0,
        width: "100%",               // Full width
        zIndex: 1000,                // On top of other content
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
        {/* Inserisci Dropdown */}
        <div
          style={{ position: "relative" }}
          onMouseEnter={() => setShowInsertDropdown(true)}
          onMouseLeave={() => setShowInsertDropdown(false)}
        >
          <button
            style={{
              color: "white",
              fontSize: "1.3rem",
              textDecoration: "none",
              fontWeight: "bold",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Inserisci ▾
          </button>
          {showInsertDropdown && (
            <div
              style={{
                position: "absolute",
                top: "2.2rem",
                left: 0,
                background: "#2A66DD",
                border: "1px solid #ccc",
                borderRadius: "6px",
                minWidth: "200px",
                zIndex: 100,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <Link
                to="/insert"
                style={{
                  display: "block",
                  color: "white",
                  padding: "0.7rem 1.2rem",
                  textDecoration: "none",
                  fontSize: "1.1rem",
                  borderBottom: "1px solid #ffffff",
                }}
              >
                Appuntamento
              </Link>
              <Link
                to="/insert-company"
                style={{
                  display: "block",
                  color: "white",
                  padding: "0.7rem 1.2rem",
                  textDecoration: "none",
                  fontSize: "1.1rem",
                  borderBottom: "1px solid #ffffff",
                }}
              >
                Compagnia
              </Link>
              <Link
                to="/insert-key-people"
                style={{
                  display: "block",
                  color: "white",
                  padding: "0.7rem 1.2rem",
                  textDecoration: "none",
                  fontSize: "1.1rem",
                  borderBottom: "1px solid #ffffff",
                }}
              >
                Key People
              </Link>
              <Link
                to="/insert-initiative"
                style={{
                  display: "block",
                  color: "white",
                  padding: "0.7rem 1.2rem",
                  textDecoration: "none",
                  fontSize: "1.1rem",
                }}
              >
                Trattativa
              </Link>
            </div>
          )}
        </div>
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
          padding: "0.5em 1.2em",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </nav>
  );
}