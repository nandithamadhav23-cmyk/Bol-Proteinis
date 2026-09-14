import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { LogIn, ShieldCheck, CheckCircle2, MessageCircle, MapPin, ChevronDown, ShoppingBasket } from "lucide-react";
import WeeklyMenu from "../components/WeeklyMenu";
import OrderForm from "../components/OrderForm";

const ink = "#223A2E";
const inkDeep = "#16261C";
const cream = "#F6F2E7";
const moss = "#5C7A56";
const gold = "#C98A2C";
const line = "#DAD2BC";
const leaf = "#6E9B5E";

const heroStyles = `
@keyframes sdLeafSway1 { 0%,100% { transform: rotate(-8deg) translateY(0); } 50% { transform: rotate(2deg) translateY(-10px); } }
@keyframes sdLeafSway2 { 0%,100% { transform: rotate(10deg) translateY(0); } 50% { transform: rotate(-4deg) translateY(-14px); } }
@keyframes sdLeafSway3 { 0%,100% { transform: rotate(-4deg) translateY(0); } 50% { transform: rotate(8deg) translateY(-8px); } }
@keyframes sdHeroIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes sdBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(6px); } }
.sd-hero-in { animation: sdHeroIn 0.6s ease both; }
.sd-leaf-1 { animation: sdLeafSway1 7s ease-in-out infinite; }
.sd-leaf-2 { animation: sdLeafSway2 8.5s ease-in-out infinite; }
.sd-leaf-3 { animation: sdLeafSway3 6.5s ease-in-out infinite; }
.sd-scroll-cue { animation: sdBounce 1.8s ease-in-out infinite; }
@keyframes sdCartPulse { 0% { transform: scale(1); } 30% { transform: scale(1.06); } 100% { transform: scale(1); } }
.sd-cart-pulse { animation: sdCartPulse 0.35s ease; }
`;

function Leaf({ className, style, color }) {
  return (
    <svg viewBox="0 0 60 90" width="48" height="72" className={className} style={style}>
      <path fill={color} d="M30 4 C50 18 54 55 32 84 C16 66 6 34 30 4 Z" opacity="0.9" />
    </svg>
  );
}

function Hero() {
  return (
    <div className="relative overflow-hidden" style={{ backgroundColor: inkDeep }}>
      <Leaf className="sd-leaf-1" color="#2E4D37" style={{ position: "absolute", top: 20, left: "6%" }} />
      <Leaf className="sd-leaf-2" color="#3A5B41" style={{ position: "absolute", top: -10, right: "10%" }} />
      <Leaf className="sd-leaf-3" color="#26402E" style={{ position: "absolute", bottom: -20, left: "40%" }} />

      <div className="relative max-w-2xl mx-auto px-6 py-16 sm:py-20 text-center sd-hero-in">
        <h1 className="text-3xl sm:text-4xl leading-tight" style={{ fontFamily: "Georgia, serif", color: cream }}>
          Protein bowls, salads,<br />smoothies & sandwiches
        </h1>
        <p className="text-sm mt-4" style={{ color: "#B7C7B2" }}>
          Fresh, made-to-order, and delivered straight to your door.
        </p>
        <a
          href="#menu-section"
          className="inline-flex flex-col items-center gap-1 mt-10 text-xs"
          style={{ color: gold }}
        >
          Browse this week's menu
          <ChevronDown size={16} className="sd-scroll-cue" />
        </a>
      </div>
    </div>
  );
}

export default function OrderPage() {
  const [cart, setCart] = useState([]);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [pulse, setPulse] = useState(false);
  const firstRender = useRef(true);

  const itemCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const total = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    setPulse(true);
    const t = setTimeout(() => setPulse(false), 350);
    return () => clearTimeout(t);
  }, [itemCount]);

  function handleAdd(item, portions, price) {
    setCart((prev) => {
      const existingIndex = prev.findIndex((c) => c.menuItem === item._id && c.portions === portions);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity: updated[existingIndex].quantity + 1 };
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

  if (confirmedOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: cream }}>
        <style>{heroStyles}</style>
        <div
          className="sd-hero-in w-full max-w-sm text-center p-8"
          style={{ backgroundColor: "#FFFFFF", border: `1px solid ${line}`, borderTop: `4px solid ${leaf}`, borderRadius: 14 }}
        >
          <CheckCircle2 size={30} color={leaf} className="mx-auto mb-3" />
          <h1 className="text-2xl mb-2" style={{ fontFamily: "Georgia, serif", color: ink }}>Order received</h1>
          <p className="text-sm" style={{ color: moss }}>
            Thanks, {confirmedOrder.name} — your order for ₹{confirmedOrder.totalAmount} is with us now.
            We'll confirm it shortly and let you know the estimated cook time by email.
          </p>

          <div className="flex items-center justify-center gap-2 mt-5 py-2 text-xs" style={{ backgroundColor: cream, borderRadius: 6, color: moss }}>
            Order ID <span style={{ color: ink, fontWeight: 600, fontFamily: "Georgia, serif" }}>{confirmedOrder._id}</span>
          </div>

          <Link to={`/track/${confirmedOrder._id}`} className="flex items-center justify-center gap-2 mt-4 text-sm py-2.5" style={{ backgroundColor: ink, color: cream, borderRadius: 6 }}>
            <MapPin size={15} /> Track your order
          </Link>
          <a
            href={`https://wa.me/9198XXXXXXXX?text=${encodeURIComponent(`Hi, I just placed an order (₹${confirmedOrder.totalAmount}) — following up.`)}`}
            target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-2 mt-2.5 text-sm py-2.5"
            style={{ backgroundColor: "#25D366", color: "#fff", borderRadius: 6 }}
          >
            <MessageCircle size={15} /> Message us on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <style>{heroStyles}</style>
      <div className="flex justify-between items-center px-6 py-3" style={{ backgroundColor: cream, borderBottom: `1px solid ${line}` }}>
        <span className="text-sm" style={{ fontFamily: "Georgia, serif", color: ink }}>Bol Proteinis</span>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs flex items-center gap-1" style={{ color: moss }}>
            <LogIn size={13} /> Login for order history
          </Link>
          <Link to="/admin-login" className="text-xs flex items-center gap-1" style={{ color: "#B9AF8F" }}>
            <ShieldCheck size={13} /> Staff
          </Link>
        </div>
      </div>

      <Hero />

      <WeeklyMenu onAdd={handleAdd} />
      <OrderForm cart={cart} onRemove={handleRemove} onUpdateQuantity={handleUpdateQuantity} onSubmitted={setConfirmedOrder} />

      {/* Floating cart bar */}
      <div
        className={`fixed left-0 right-0 bottom-0 flex justify-center px-4 transition-all duration-300 ${itemCount > 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full pointer-events-none"}`}
        style={{ paddingBottom: 16, zIndex: 40 }}
      >
        <a
          href="#order-section"
          className={`flex items-center gap-3 px-5 py-3 max-w-md w-full sm:w-auto ${pulse ? "sd-cart-pulse" : ""}`}
          style={{ backgroundColor: ink, color: cream, borderRadius: 999, boxShadow: "0 8px 24px rgba(22,38,28,0.35)" }}
        >
          <ShoppingBasket size={17} />
          <span className="text-sm flex-1">{itemCount} item{itemCount !== 1 ? "s" : ""} in your order</span>
          <span className="text-sm font-semibold" style={{ color: gold, fontFamily: "Georgia, serif" }}>₹{total}</span>
        </a>
      </div>
    </div>
  );
}
