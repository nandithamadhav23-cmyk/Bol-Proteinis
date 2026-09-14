import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Phone, MapPin, Home as HomeIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { COMMUNITIES } from "../data/communities";
import logo from "../assets/logo.jpg";

const ink = "#223A2E";
const cream = "#F6F2E7";
const moss = "#5C7A56";
const line = "#DAD2BC";
const paprika = "#B0472A";

function IconInput({ icon: Icon, ...props }) {
  return (
    <div className="relative">
      <Icon size={15} color={moss} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
      <input
        {...props}
        style={{
          border: `1px solid ${line}`,
          borderRadius: 6,
          padding: "0.65rem 0.75rem 0.65rem 2.1rem",
          fontSize: "0.875rem",
          width: "100%",
          backgroundColor: cream,
          color: ink,
        }}
      />
    </div>
  );
}

export default function CustomerAuth() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", community: "", flatNumber: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginCustomer, API_BASE } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "login" ? { email: form.email, password: form.password } : form;
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");
      loginCustomer(data.token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: cream }}>
      <div className="w-full max-w-sm p-7" style={{ backgroundColor: "#FFFFFF", border: `1px solid ${line}`, borderRadius: 14 }}>
        <img src={logo} alt="Bol Proteinis" style={{ width: "100%", maxWidth: 200, height: "auto", margin: "0 auto 20px" }} />

        <div className="flex mb-6" style={{ border: `1px solid ${line}`, borderRadius: 8, overflow: "hidden" }}>
          <button
            onClick={() => setMode("login")}
            className="flex-1 py-2 text-sm"
            style={{ backgroundColor: mode === "login" ? ink : "transparent", color: mode === "login" ? cream : moss }}
          >
            Log in
          </button>
          <button
            onClick={() => setMode("register")}
            className="flex-1 py-2 text-sm"
            style={{ backgroundColor: mode === "register" ? ink : "transparent", color: mode === "register" ? cream : moss }}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {mode === "register" && (
            <>
              <IconInput icon={User} placeholder="Full name" value={form.name} onChange={update("name")} required />
              <IconInput icon={Phone} placeholder="Phone number" value={form.phone} onChange={update("phone")} required />
              <div className="relative">
                <MapPin size={15} color={moss} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", zIndex: 1 }} />
                <select
                  value={form.community}
                  onChange={update("community")}
                  style={{ border: `1px solid ${line}`, borderRadius: 6, padding: "0.65rem 0.75rem 0.65rem 2.1rem", fontSize: "0.875rem", width: "100%", backgroundColor: cream, color: ink }}
                >
                  <option value="">Residential community (optional)</option>
                  {COMMUNITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <IconInput icon={HomeIcon} placeholder="Flat/Villa number (optional)" value={form.flatNumber} onChange={update("flatNumber")} />
            </>
          )}
          <IconInput icon={Mail} type="email" placeholder="Email" value={form.email} onChange={update("email")} required />
          <IconInput icon={Lock} type="password" placeholder="Password" value={form.password} onChange={update("password")} required />

          {error && <p className="text-xs" style={{ color: paprika }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="py-3 text-sm mt-2"
            style={{ backgroundColor: ink, color: cream, borderRadius: 6, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
