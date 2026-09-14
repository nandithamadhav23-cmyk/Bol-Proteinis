import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  ClipboardList, Salad, Users, RefreshCcw, QrCode, LogOut,
  Clock, CheckCircle2, IndianRupee, Trash2, ChefHat,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const ink = "#223A2E";
const inkDeep = "#16261C";
const cream = "#F6F2E7";
const moss = "#5C7A56";
const gold = "#C98A2C";
const line = "#DAD2BC";
const paprika = "#B0472A";
const leaf = "#6E9B5E";

const STATUS_OPTIONS = ["confirmed", "preparing", "delivered", "cancelled"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const NAV_ITEMS = [
  { key: "orders", label: "Orders", icon: ClipboardList },
  { key: "menu", label: "Menu", icon: Salad },
  { key: "customers", label: "Customers", icon: Users },
  { key: "subscribers", label: "Subscribers", icon: RefreshCcw },
  { key: "qrcode", label: "QR code", icon: QrCode },
];

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div
      className="relative flex-1 min-w-[140px] p-4"
      style={{
        backgroundColor: "#FFFFFF",
        border: `1px solid ${line}`,
        borderRadius: 10,
        borderTop: `3px solid ${accent}`,
      }}
    >
      <Icon size={16} color={accent} strokeWidth={2.2} />
      <div className="text-2xl mt-2" style={{ fontFamily: "Georgia, serif", color: ink }}>{value}</div>
      <div className="text-xs mt-0.5" style={{ color: moss }}>{label}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    pending: { bg: "#FBEADB", fg: paprika },
    confirmed: { bg: "#E6EFE3", fg: leaf },
    preparing: { bg: "#E6EFE3", fg: leaf },
    delivered: { bg: "#E9E5D8", fg: moss },
    cancelled: { bg: "#F5DAD1", fg: paprika },
  };
  const c = map[status] || map.delivered;
  return (
    <span className="text-xs px-2.5 py-1" style={{ backgroundColor: c.bg, color: c.fg, borderRadius: 20, fontWeight: 600 }}>
      {status}
    </span>
  );
}

function OrderCard({ order, onConfirm, onStatusChange }) {
  const [cookTime, setCookTime] = useState(order.cookTimeMinutes || 20);
  return (
    <div
      className="p-4 mb-3 relative"
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        boxShadow: "0 1px 0 #FFFFFF, 0 -1px 0 #FFFFFF",
        border: `1px solid ${line}`,
        borderLeft: `4px solid ${order.status === "pending" ? paprika : order.status === "cancelled" ? "#C9BBA0" : leaf}`,
      }}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm font-semibold" style={{ color: ink, fontFamily: "Georgia, serif" }}>{order.name}</div>
          <div className="text-xs mt-0.5" style={{ color: moss }}>{order.phone} · {order.community}, {order.flatNumber}</div>
        </div>
        <StatusPill status={order.status} />
      </div>

      <div className="mt-3 pt-3" style={{ borderTop: `1px dashed ${line}` }}>
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-xs py-0.5" style={{ color: moss }}>
            <span>{item.name} × {item.quantity || 1} ({item.portions === 1 ? "1 serving" : "2 servings"})</span>
            <span>₹{item.price * (item.quantity || 1)}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-2 pt-2" style={{ borderTop: `1px dashed ${line}` }}>
        <span className="text-xs" style={{ color: moss }}>
          {order.paymentMethod} · {order.paymentStatus === "paid" ? "Paid" : "Payment pending"}
        </span>
        <span className="text-base font-semibold" style={{ color: gold, fontFamily: "Georgia, serif" }}>₹{order.totalAmount}</span>
      </div>
      {order.allergiesNotes && <div className="text-xs mt-2 italic" style={{ color: moss }}>Note: {order.allergiesNotes}</div>}

      <div className="mt-3 pt-3 flex items-center gap-3 flex-wrap" style={{ borderTop: `1px solid ${line}` }}>
        {order.status === "pending" ? (
          <>
            <label className="text-xs flex items-center gap-1" style={{ color: moss }}><ChefHat size={13} /> Cook time</label>
            <input
              type="number"
              value={cookTime}
              onChange={(e) => setCookTime(Number(e.target.value))}
              style={{ width: 56, border: `1px solid ${line}`, borderRadius: 4, padding: "4px 8px", fontSize: 13 }}
            />
            <span className="text-xs" style={{ color: moss }}>min</span>
            <button
              onClick={() => onConfirm(order._id, cookTime)}
              className="text-xs px-3 py-1.5 ml-auto flex items-center gap-1"
              style={{ backgroundColor: ink, color: cream, borderRadius: 6 }}
            >
              <CheckCircle2 size={13} /> Confirm order
            </button>
          </>
        ) : order.status !== "delivered" && order.status !== "cancelled" ? (
          <>
            {order.cookTimeMinutes && (
              <span className="text-xs flex items-center gap-1" style={{ color: moss }}>
                <Clock size={13} /> {order.cookTimeMinutes} min
              </span>
            )}
            <select
              defaultValue=""
              onChange={(e) => e.target.value && onStatusChange(order._id, e.target.value)}
              className="ml-auto"
              style={{ border: `1px solid ${line}`, borderRadius: 4, padding: "4px 8px", fontSize: 13 }}
            >
              <option value="">Update status…</option>
              {STATUS_OPTIONS.filter((s) => s !== order.status).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </>
        ) : null}
      </div>
    </div>
  );
}

function SectionHeading({ children, count }) {
  return (
    <div className="flex items-center gap-2 mt-6 mb-3 first:mt-0">
      <h2 className="text-sm font-semibold" style={{ color: ink }}>{children}</h2>
      {count !== undefined && (
        <span className="text-xs px-2 py-0.5" style={{ backgroundColor: cream, color: moss, borderRadius: 20 }}>{count}</span>
      )}
    </div>
  );
}

function OrdersTab({ orders, reload }) {
  const { authFetch } = useAuth();
  const [error, setError] = useState("");

  async function handleConfirm(id, cookTimeMinutes) {
    setError("");
    try {
      const res = await authFetch(`/api/orders/${id}/confirm`, { method: "PUT", body: JSON.stringify({ cookTimeMinutes }) });
      if (!res.ok) throw new Error();
      reload();
    } catch { setError("Failed to confirm order."); }
  }

  async function handleStatusChange(id, newStatus) {
    setError("");
    try {
      const res = await authFetch(`/api/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status: newStatus }) });
      if (!res.ok) throw new Error();
      reload();
    } catch { setError("Failed to update status."); }
  }

  const pending = orders.filter((o) => o.status === "pending");
  const active = orders.filter((o) => !["pending", "delivered", "cancelled"].includes(o.status));
  const done = orders.filter((o) => ["delivered", "cancelled"].includes(o.status));

  return (
    <div>
      {error && <p className="text-sm mb-4" style={{ color: paprika }}>{error}</p>}

      <SectionHeading count={pending.length}>Awaiting confirmation</SectionHeading>
      {pending.length === 0 && <p className="text-xs" style={{ color: moss }}>Nothing pending — you're caught up.</p>}
      {pending.map((o) => <OrderCard key={o._id} order={o} onConfirm={handleConfirm} onStatusChange={handleStatusChange} />)}

      <SectionHeading count={active.length}>In progress</SectionHeading>
      {active.length === 0 && <p className="text-xs" style={{ color: moss }}>Nothing being prepared right now.</p>}
      {active.map((o) => <OrderCard key={o._id} order={o} onConfirm={handleConfirm} onStatusChange={handleStatusChange} />)}

      <SectionHeading count={done.length}>Completed</SectionHeading>
      {done.map((o) => <OrderCard key={o._id} order={o} onConfirm={handleConfirm} onStatusChange={handleStatusChange} />)}
    </div>
  );
}

function MenuManagerTab({ items, reload }) {
  const { authFetch } = useAuth();
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    name: "", type: "Salad", day: "Monday", dressing: "", description: "",
    calories: "", protein: "", fat: "", fiber: "", carbs: "", glycemicIndex: "",
    pricePerPortion: "", pricePerTwoPortions: "",
  });

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const inputStyle = { border: `1px solid ${line}`, borderRadius: 6, padding: "0.55rem 0.7rem", fontSize: "0.8rem", width: "100%", backgroundColor: cream };

  async function handleAddItem(e) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await authFetch("/api/menu", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          calories: Number(form.calories) || undefined,
          glycemicIndex: form.glycemicIndex ? Number(form.glycemicIndex) : undefined,
          pricePerPortion: Number(form.pricePerPortion),
          pricePerTwoPortions: Number(form.pricePerTwoPortions),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to add item");
      }
      setMessage("Item added to the menu.");
      setForm({ ...form, name: "", description: "", calories: "", protein: "", fat: "", fiber: "", carbs: "", glycemicIndex: "", pricePerPortion: "", pricePerTwoPortions: "" });
      reload();
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleDelete(id) {
    await authFetch(`/api/menu/${id}`, { method: "DELETE" });
    reload();
  }

  return (
    <div>
      <SectionHeading>Add a new item</SectionHeading>
      <form
        onSubmit={handleAddItem}
        className="grid grid-cols-2 gap-2 mb-8 p-5"
        style={{ border: `1px solid ${line}`, borderRadius: 10, backgroundColor: "#FFFFFF" }}
      >
        <input style={inputStyle} placeholder="Name" value={form.name} onChange={update("name")} required />
        <select style={inputStyle} value={form.type} onChange={update("type")}>
          <option value="Salad">Salad</option>
          <option value="Soup">Soup</option>
          <option value="Bowl">Bowl</option>
        </select>
        <select style={inputStyle} value={form.day} onChange={update("day")}>
          {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <input style={inputStyle} placeholder="Dressing (optional)" value={form.dressing} onChange={update("dressing")} />
        <textarea style={{ ...inputStyle, gridColumn: "span 2" }} placeholder="Description" value={form.description} onChange={update("description")} />
        <input style={inputStyle} placeholder="Calories" value={form.calories} onChange={update("calories")} />
        <input style={inputStyle} placeholder="Protein (e.g. 18g)" value={form.protein} onChange={update("protein")} />
        <input style={inputStyle} placeholder="Fat (e.g. 10g)" value={form.fat} onChange={update("fat")} />
        <input style={inputStyle} placeholder="Fiber (e.g. 11g)" value={form.fiber} onChange={update("fiber")} />
        <input style={inputStyle} placeholder="Carbs (e.g. 36g)" value={form.carbs} onChange={update("carbs")} />
        <input style={inputStyle} placeholder="Glycemic Index (soups)" value={form.glycemicIndex} onChange={update("glycemicIndex")} />
        <input style={inputStyle} placeholder="Price, 1 serving (₹)" value={form.pricePerPortion} onChange={update("pricePerPortion")} required />
        <input style={inputStyle} placeholder="Price, 2 servings (₹)" value={form.pricePerTwoPortions} onChange={update("pricePerTwoPortions")} required />
        <button type="submit" className="col-span-2 py-2.5 text-sm mt-1" style={{ backgroundColor: ink, color: cream, borderRadius: 6 }}>
          Add item
        </button>
        {message && <p className="col-span-2 text-xs" style={{ color: message.includes("added") ? leaf : paprika }}>{message}</p>}
      </form>

      <SectionHeading count={items.length}>Current menu</SectionHeading>
      {DAYS.map((day) => {
        const dayItems = items.filter((it) => it.day === day);
        if (dayItems.length === 0) return null;
        return (
          <div key={day} className="mb-4">
            <div className="text-xs font-semibold mb-1.5" style={{ color: moss }}>{day}</div>
            {dayItems.map((item) => (
              <div key={item._id} className="flex justify-between items-center p-3 mb-2" style={{ border: `1px solid ${line}`, borderRadius: 8, backgroundColor: "#FFFFFF" }}>
                <div>
                  <div className="text-sm" style={{ color: ink }}>{item.name}</div>
                  <div className="text-xs" style={{ color: moss }}>{item.type} · ₹{item.pricePerPortion} / ₹{item.pricePerTwoPortions}</div>
                </div>
                <button onClick={() => handleDelete(item._id)} style={{ color: paprika }}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function CustomersTab({ users }) {
  return (
    <div>
      <SectionHeading count={users.length}>Registered customers</SectionHeading>
      {users.map((u) => (
        <div key={u._id} className="p-3.5 mb-2" style={{ border: `1px solid ${line}`, borderRadius: 8, backgroundColor: "#FFFFFF" }}>
          <div className="text-sm" style={{ color: ink, fontFamily: "Georgia, serif" }}>{u.name}</div>
          <div className="text-xs mt-0.5" style={{ color: moss }}>{u.email} · {u.phone}</div>
          <div className="text-xs" style={{ color: moss }}>{u.community}, {u.flatNumber}</div>
        </div>
      ))}
      {users.length === 0 && <p className="text-sm" style={{ color: moss }}>No customers have signed up yet.</p>}
    </div>
  );
}

function SubscribersTab({ subs }) {
  const active = subs.filter((s) => s.status === "active");
  return (
    <div>
      <SectionHeading count={active.length}>Active subscribers</SectionHeading>
      {active.map((s) => (
        <div key={s._id} className="p-3.5 mb-2" style={{ border: `1px solid ${line}`, borderRadius: 8, backgroundColor: "#FFFFFF", borderLeft: `4px solid ${leaf}` }}>
          <div className="text-sm" style={{ color: ink, fontFamily: "Georgia, serif" }}>{s.customer?.name} — {s.planType} ({s.duration})</div>
          <div className="text-xs mt-0.5" style={{ color: moss }}>{s.customer?.email} · {s.customer?.phone}</div>
          <div className="text-sm font-semibold mt-1" style={{ color: gold }}>₹{s.price}</div>
        </div>
      ))}
      {active.length === 0 && <p className="text-sm" style={{ color: moss }}>No active subscribers yet.</p>}
    </div>
  );
}

function QRCodeTab() {
  const [url, setUrl] = useState(typeof window !== "undefined" ? window.location.origin : "");

  function downloadQR() {
    const canvas = document.getElementById("bp-qr-canvas");
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "bol-proteinis-menu-qr.png";
    link.click();
  }

  return (
    <div>
      <SectionHeading>Menu QR code</SectionHeading>
      <p className="text-xs mb-4" style={{ color: moss }}>
        Print this and display it at your counter — scanning it opens your menu directly, no login needed.
      </p>
      <label className="text-xs block mb-1.5" style={{ color: moss }}>Link the code opens</label>
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ border: `1px solid ${line}`, borderRadius: 6, padding: "0.55rem 0.7rem", fontSize: "0.8rem", width: "100%", marginBottom: 16, backgroundColor: "#FFFFFF" }}
      />
      <div className="p-8 flex flex-col items-center gap-5" style={{ border: `1px solid ${line}`, borderRadius: 12, backgroundColor: "#FFFFFF" }}>
        <div className="p-3" style={{ border: `2px solid ${ink}`, borderRadius: 8 }}>
          <QRCodeCanvas id="bp-qr-canvas" value={url || " "} size={200} bgColor="#FFFFFF" fgColor={ink} level="M" />
        </div>
        <button onClick={downloadQR} className="text-sm px-5 py-2.5" style={{ backgroundColor: ink, color: cream, borderRadius: 6 }}>
          Download QR code
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [subs, setSubs] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const { logout, authFetch } = useAuth();

  function reloadAll() {
    return Promise.all([
      authFetch("/api/orders").then((r) => r.json()).then(setOrders).catch(() => {}),
      authFetch("/api/menu").then((r) => r.json()).then(setItems).catch(() => {}),
      authFetch("/api/users").then((r) => r.json()).then(setUsers).catch(() => {}),
      authFetch("/api/subscriptions").then((r) => r.json()).then(setSubs).catch(() => {}),
    ]);
  }

  useEffect(() => {
    reloadAll().then(() => setLoaded(true));
  }, []);

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const todayRevenue = orders
    .filter((o) => new Date(o.createdAt).toDateString() === new Date().toDateString() && o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const activeSubCount = subs.filter((s) => s.status === "active").length;

  return (
    <div className="flex flex-col sm:flex-row min-h-screen" style={{ backgroundColor: cream }}>
      {/* Sidebar / mobile top nav */}
      <div
        className="flex flex-row sm:flex-col sm:w-56 sm:min-h-screen overflow-x-auto sm:overflow-visible flex-shrink-0"
        style={{ backgroundColor: inkDeep }}
      >
        <div className="hidden sm:block px-5 py-6">
          <div className="text-lg" style={{ fontFamily: "Georgia, serif", color: cream }}>Bol Proteinis</div>
          <div className="text-xs mt-0.5" style={{ color: "#7FA080" }}>Admin</div>
        </div>
        <div className="flex flex-row sm:flex-col flex-1 gap-1 px-2 sm:px-3 py-2 sm:py-0">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm whitespace-nowrap flex-shrink-0"
              style={{
                color: tab === key ? cream : "#8FA48F",
                backgroundColor: tab === key ? "rgba(255,255,255,0.08)" : "transparent",
                borderRadius: 8,
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={logout}
          className="hidden sm:flex items-center gap-2.5 px-3 py-2.5 mx-3 mb-4 mt-auto text-sm"
          style={{ color: "#8FA48F" }}
        >
          <LogOut size={16} /> Log out
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <div className="flex sm:hidden justify-end px-4 py-2" style={{ backgroundColor: inkDeep }}>
          <button onClick={logout} className="text-xs flex items-center gap-1" style={{ color: "#8FA48F" }}>
            <LogOut size={13} /> Log out
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-6">
          <div className="flex gap-3 mb-6 overflow-x-auto">
            <StatCard icon={Clock} label="Awaiting confirmation" value={pendingCount} accent={paprika} />
            <StatCard icon={IndianRupee} label="Revenue today" value={`₹${todayRevenue}`} accent={gold} />
            <StatCard icon={RefreshCcw} label="Active subscribers" value={activeSubCount} accent={leaf} />
            <StatCard icon={Salad} label="Menu items" value={items.length} accent={ink} />
          </div>

          {!loaded && <p className="text-sm" style={{ color: moss }}>Loading…</p>}
          {loaded && tab === "orders" && <OrdersTab orders={orders} reload={reloadAll} />}
          {loaded && tab === "menu" && <MenuManagerTab items={items} reload={reloadAll} />}
          {loaded && tab === "customers" && <CustomersTab users={users} />}
          {loaded && tab === "subscribers" && <SubscribersTab subs={subs} />}
          {loaded && tab === "qrcode" && <QRCodeTab />}
        </div>
      </div>
    </div>
  );
}
