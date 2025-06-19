import { useState } from 'react';
import sdgLogo from '/sdg-logo-3.png';
import brainBg from '/Brain.jpg';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showWaitMsg, setShowWaitMsg] = useState(false); // NEW

  async function handleSubmit(e) {
    e.preventDefault();
    setShowWaitMsg(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const contentType = res.headers.get("content-type");
      if (!res.ok) {
        const text = await res.text();
        alert("Login failed: " + text);
        setShowWaitMsg(false);
        return;
      }

      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON, got something else.");
      }

      const data = await res.json();
      if (data.token) {
        // Store token in localStorage
        localStorage.setItem("token", data.token);
        
        // Store user data including role
        localStorage.setItem("user", JSON.stringify({
          username: data.username,
          role: data.role || 'user'
        }));
        
        // Call onLogin with user data
        onLogin(data);
      } else {
        alert(data.error || "Something went wrong.");
        setShowWaitMsg(false);
      }
    } catch (err) {
      alert("Server error. Check the console.");
      console.error(err);
      setShowWaitMsg(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center"
      style={{
        backgroundImage: `url(${brainBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
      }}
    >
      {/* Centered fixed logo */}
      <img
        src={sdgLogo}
        alt="SDG Logo"
        className="w-48 h-auto object-contain drop-shadow-lg"
        style={{
          position: "fixed",
          top: "53%",
          left: "50%",
          transform: "translate(-50%, -60%)",
          zIndex: 10,
          pointerEvents: "none",
          userSelect: "none"
        }}
      />
      {/* Login box under the logo */}
      <div
        className="w-full max-w-sm flex flex-col items-center"
        style={{
          marginTop: "calc(55vh)",
          background: "transparent",
        }}
      >
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 rounded-xl p-8">
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            className="input-bg-50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none text-gray-900 border border-gray-300"
            autoFocus
          />
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            className="input-bg-50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none text-gray-900 border border-gray-300"
          />
          {showWaitMsg ? (
            <span className="relative w-full px-6 py-2.5 bg-transparent rounded-md text-white font-bold text-center">
              Attendere qualche secondo dopo il login, il server può impiegare più del previsto a rispondere.
            </span>
          ) : (
            <button
              type="submit"
              className="cursor-pointer relative inline-flex items-center justify-center p-0.5 overflow-hidden text-base font-bold rounded-lg group bg-gradient-to-br from-[#1DC8DF] via-[#2A66DD] to-[#753BBD] hover:from-[#1DC8DF] hover:to-[#2A66DD] focus:ring-4 focus:outline-none focus:ring-blue-100 transition"
            >
              <span className="relative w-full px-6 py-2.5 bg-transparent rounded-md text-white font-bold">
                Login
              </span>
            </button>
          )}
        </form>
      </div>
    </div>
  );
}