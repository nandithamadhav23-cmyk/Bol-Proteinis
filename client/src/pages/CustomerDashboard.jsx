import { useEffect, useState } from "react";
import { LogOut, Package, Clock, CheckCircle2, MapPin, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import WeeklyMenu from "../components/WeeklyMenu";
import OrderForm from "../components/OrderForm";

const ink = "#223A2E";
const cream = "#F6F2E7";
const moss = "#5C7A56";
const gold = "#C98A2C";
const line = "#DAD2BC";
const paprika = "#B0472A";
const leaf = "#6E9B5E";

const PLANS = [
  { planType: "Protein Bowls", duration: "Weekly", price: 2100, tag: "Popular" },
  { planType: "Protein Salads", duration: "Weekly", price: 1800 },
  { planType: "Protein Bowls", duration: "Monthly", price: 7500, tag: "Best value" },
  { planType: "Protein Salads", duration: "Monthly", price: 6500 },
];

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2.5 text-sm relative"
      style={{ color: active ? ink : moss, fontWeight: active ? 600 : 400 }}
    >
      {children}
      {active && <span className="absolute left-4 right-4 -bottom-px" style={{ height: 2, backgroundColor: gold }} />}
    </button>
  );
}

function StatusIcon({ status }) {
  if (status === "pending") return <Clock size={15} color={paprika} />;
  if (status === "cancelled") return <Clock size={15} color="#9A8F72" />;
  return <CheckCircle2 size={15} color={leaf} />;
}

function MyOrdersTab() {
  const { authFetch } = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    authFetch("/api/orders/my")
      .then((res) => res.json())
      .then((data) => { setOrders(data); setStatus("ready"); })
      .catch(() => setStatus("error"));
  }, []);

  if (status === "loading") return <p className="text-sm" style={{ color: moss }}>Loading your orders…</p>;
  if (status === "error") return <p className="text-sm" style={{ color: paprika }}>Couldn't load your orders.</p>;
  if (orders.length === 0) {
    return (
      <div className="text-center py-10">
        <Package size={28} color={moss} className="mx-auto mb-2" />
        <p className="text-sm" style={{ color: moss }}>No orders yet — your first one will show up here.</p>
      </div>
    );
  }

  return (
    <div>
      {orders.map((o) => (
        <div key={o._id} className="p-4 mb-3" style={{ border: `1px solid ${line}`, borderRadius: 10, backgroundColor: "#FFFFFF" }}>
          <div className="flex justify-between items-start">
            <div className="text-xs" style={{ color: moss }}>{new Date(o.createdAt).toLocaleString()}</div>
            <div className="flex items-center gap-1.5">
              <StatusIcon status={o.status} />
              <span className="text-xs font-medium capitalize" style={{ color: ink }}>{o.status}</span>
            </div>
          </div>
          <div className="mt-3 pt-3" style={{ borderTop: `1px dashed ${line}` }}>
            {o.items.map((it, i) => (
              <div key={i} className="text-xs py-0.5" style={{ color: moss }}>{it.name} × {it.quantity || 1}</div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-2 pt-2" style={{ borderTop: `1px dashed ${line}` }}>
            <span className="text-xs" style={{ color: moss }}>
              {o.paymentMethod} · {o.paymentStatus === "paid" ? "Paid" : "Payment pending"}
            </span>
            <span className="text-base font-semibold" style={{ color: gold, fontFamily: "Georgia, serif" }}>₹{o.totalAmount}</span>
          </div>
          {o.cookTimeMinutes && (
            <div className="text-xs mt-1.5 flex items-center gap-1" style={{ color: moss }}>
              <Clock size={12} /> Estimated cook time: {o.cookTimeMinutes} min
            </div>
          )}
          <a href={`/track/${o._id}`} className="text-xs underline mt-2 inline-block" style={{ color: ink }}>
            Track this order
          </a>
        </div>
      ))}
    </div>
  );
}

function SubscriptionTab() {
  const { authFetch } = useAuth();
  const [subs, setSubs] = useState([]);
  const [message, setMessage] = useState("");

  function load() {
    authFetch("/api/subscriptions/my").then((res) => res.json()).then(setSubs).catch(() => {});
  }
  useEffect(load, []);

  async function subscribe(plan) {
    setMessage("");
    try {
      const res = await authFetch("/api/subscriptions", { method: "POST", body: JSON.stringify(plan) });
      if (!res.ok) throw new Error();
      setMessage(`Subscribed to ${plan.planType} (${plan.duration})`);
      load();
    } catch { setMessage("Something went wrong — please try again."); }
  }

  async function cancel(id) {
    await authFetch(`/api/subscriptions/${id}/cancel`, { method: "PUT" });
    load();
  }

  const active = subs.filter((s) => s.status === "active");

  return (
    <div>
      {active.length > 0 && (
        <div className="mb-8">
          <div className="text-sm font-semibold mb-2" style={{ color: ink }}>Your active plans</div>
          {active.map((s) => (
            <div
              key={s._id}
              className="flex justify-between items-center p-4 mb-2"
              style={{ border: `1px solid ${leaf}`, backgroundColor: "#F0F5ED", borderRadius: 10 }}
            >
              <div>
                <div className="text-sm font-medium" style={{ color: ink }}>{s.planType}</div>
                <div className="text-xs" style={{ color: moss }}>{s.duration}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold" style={{ color: gold, fontFamily: "Georgia, serif" }}>₹{s.price}</span>
                <button onClick={() => cancel(s._id)} className="text-xs" style={{ color: paprika }}>Cancel</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-sm font-semibold mb-3" style={{ color: ink }}>Available plans</div>
      <div className="grid sm:grid-cols-2 gap-3">
        {PLANS.map((p, i) => (
          <div key={i} className="relative p-4" style={{ border: `1px solid ${line}`, borderRadius: 10, backgroundColor: "#FFFFFF" }}>
            {p.tag && (
              <span
                className="absolute -top-2.5 left-4 text-xs px-2 py-0.5 flex items-center gap-1"
                style={{ backgroundColor: gold, color: cream, borderRadius: 20 }}
              >
                <Sparkles size={10} /> {p.tag}
              </span>
            )}
            <div className="text-sm font-medium mt-1" style={{ color: ink }}>{p.planType}</div>
            <div className="text-xs mb-3" style={{ color: moss }}>{p.duration}</div>
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold" style={{ color: gold, fontFamily: "Georgia, serif" }}>₹{p.price}</span>
              <button onClick={() => subscribe(p)} className="text-xs px-3 py-1.5" style={{ backgroundColor: ink, color: cream, borderRadius: 6 }}>
                Subscribe
              </button>
            </div>
          </div>
        ))}
      </div>
      {message && <p className="text-xs mt-4" style={{ color: moss }}>{message}</p>}
    </div>
  );
}

export default function CustomerDashboard() {
  const [tab, setTab] = useState("menu");
  const [cart, setCart] = useState([]);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const { user, logout } = useAuth();

  function handleAdd(item, portions, price) {
    setCart((prev) => {
      const idx = prev.findIndex((c) => c.menuItem === item._id && c.portions === portions);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
        return updated;
      }
      return [...prev, { menuItem: item._id, name: item.name, day: item.day, portions, price, quantity: 1 }];
    });
  }

  function handleUpdateQuantity(index, delta) {
    setCart((prev) => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) return updated.filter((_, i) => i !== index);
      updated[index] = { ...updated[index], quantity: newQty };
      return updated;
    });
  }

  function handleRemove(index) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div style={{ backgroundColor: cream, minHeight: "100vh" }}>
      {/* Profile band */}
      <div className="px-6 py-6" style={{ backgroundColor: ink }}>
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div>
            <div className="text-xl" style={{ fontFamily: "Georgia, serif", color: cream }}>Hi, {user?.name || "there"}</div>
            {user?.community && (
              <div className="text-xs mt-1 flex items-center gap-1" style={{ color: "#B7C7B2" }}>
                <MapPin size={12} /> {user.community}{user.flatNumber ? `, ${user.flatNumber}` : ""}
              </div>
            )}
          </div>
          <button onClick={logout} className="text-xs flex items-center gap-1" style={{ color: "#B7C7B2" }}>
            <LogOut size={14} /> Log out
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6">
        <div className="flex gap-2" style={{ borderBottom: `1px solid ${line}` }}>
          <TabButton active={tab === "menu"} onClick={() => setTab("menu")}>Menu & Order</TabButton>
          <TabButton active={tab === "orders"} onClick={() => setTab("orders")}>My Orders</TabButton>
          <TabButton active={tab === "subscription"} onClick={() => setTab("subscription")}>Subscription</TabButton>
        </div>

        <div className="py-6">
          {tab === "menu" && !confirmedOrder && (
            <>
              <WeeklyMenu onAdd={handleAdd} />
              <OrderForm
                cart={cart}
                onRemove={handleRemove}
                onUpdateQuantity={handleUpdateQuantity}
                onSubmitted={setConfirmedOrder}
                defaultUser={user}
              />
            </>
          )}
          {tab === "menu" && confirmedOrder && (
            <div className="text-center py-10">
              <CheckCircle2 size={28} color={leaf} className="mx-auto mb-2" />
              <p className="text-sm" style={{ color: moss }}>
                Order placed! We'll confirm it shortly — check "My Orders" for status updates.
              </p>
              <button
                onClick={() => { setConfirmedOrder(null); setCart([]); }}
                className="text-xs underline mt-3"
                style={{ color: ink }}
              >
                Place another order
              </button>
            </div>
          )}
          {tab === "orders" && <MyOrdersTab />}
          {tab === "subscription" && <SubscriptionTab />}
        </div>
      </div>
    </div>
  );
}
