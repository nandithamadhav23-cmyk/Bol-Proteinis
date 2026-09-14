import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, User, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const inkDeep = "#16261C";
const cream = "#F6F2E7";
const gold = "#C98A2C";
const paprika = "#E08064";

function IconInput({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <Icon size={15} color="#7FA080" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
      <input
        {...props}
        style={{
          border: "1px solid #2C4433",
          borderRadius: 6,
          padding: "0.65rem 0.75rem 0.65rem 2.1rem",
          fontSize: "0.875rem",
          width: "100%",
          backgroundColor: "#1D3126",
          color: cream,
        }}
      />
    </div>
  );
}

export default function AdminAuth() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginAdmin, API_BASE } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/admin-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      loginAdmin(data.token);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: inkDeep }}>
      <div className="w-full max-w-xs">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 mb-3" style={{ border: `1px solid ${gold}`, borderRadius: 999 }}>
            <ShieldCheck size={22} color={gold} />
          </div>
          <div className="text-lg" style={{ fontFamily: "Georgia, serif", color: cream }}>Staff access</div>
          <div className="text-xs mt-0.5" style={{ color: "#7FA080" }}>Bol Proteinis admin</div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <IconInput icon={User} placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          <IconInput icon={Lock} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-xs" style={{ color: paprika }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="py-3 text-sm mt-2"
            style={{ backgroundColor: gold, color: inkDeep, borderRadius: 6, fontWeight: 600, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Please wait…" : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}
