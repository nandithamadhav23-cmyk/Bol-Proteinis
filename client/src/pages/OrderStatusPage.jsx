import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Package, CheckCircle2, ChefHat, Truck, XCircle } from "lucide-react";
import { payWithRazorpay } from "../utils/razorpayPayment";

const ink = "#223A2E";
const cream = "#F6F2E7";
const moss = "#5C7A56";
const line = "#DAD2BC";
const gold = "#C98A2C";
const paprika = "#B0472A";
const leaf = "#6E9B5E";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

const STEPS = [
  { key: "pending", label: "Order received", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "delivered", label: "Delivered", icon: Truck },
];

export default function OrderStatusPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading");
  const [payError, setPayError] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/orders/${id}`)
      .then((res) => { if (!res.ok) throw new Error("not found"); return res.json(); })
      .then((data) => { setOrder(data); setStatus("ready"); })
      .catch(() => setStatus("error"));
  }, [id]);

  function handlePayNow() {
    setPayError("");
    setPaying(true);
    payWithRazorpay({
      order,
      customer: order,
      onSuccess: (updated) => { setOrder(updated); setPaying(false); },
      onCancel: () => setPaying(false),
      onError: (msg) => { setPayError(msg); setPaying(false); },
    });
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: cream }}>
        <p className="text-sm" style={{ color: moss }}>Loading your order…</p>
      </div>
    );
  }
  if (status === "error" || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: cream }}>
        <div className="text-center">
          <XCircle size={26} color={paprika} className="mx-auto mb-2" />
          <p className="text-sm" style={{ color: paprika }}>We couldn't find that order. Double-check the link and try again.</p>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === "cancelled";
  const currentIndex = STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: cream }}>
      <div className="px-6 py-6" style={{ backgroundColor: ink }}>
        <div className="max-w-md mx-auto">
          <div className="text-lg" style={{ fontFamily: "Georgia, serif", color: cream }}>Order status</div>
          <div className="text-xs mt-1" style={{ color: "#B7C7B2", fontFamily: "Georgia, serif" }}>{order._id}</div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 py-8">
        {isCancelled ? (
          <div className="flex items-center gap-2 p-4 mb-6" style={{ backgroundColor: "#F5DAD1", borderRadius: 10 }}>
            <XCircle size={18} color={paprika} />
            <p className="text-sm" style={{ color: paprika }}>This order was cancelled. Reach out to us if that's a mistake.</p>
          </div>
        ) : (
          <div className="mb-8">
            {STEPS.map((step, i) => {
              const done = i <= currentIndex;
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex items-start gap-3 pb-7 relative">
                  {i < STEPS.length - 1 && (
                    <div
                      className="absolute left-[13px] top-7"
                      style={{ width: 2, height: "calc(100% - 12px)", backgroundColor: done && i < currentIndex ? leaf : line }}
                    />
                  )}
                  <div
                    className="rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{
                      width: 28, height: 28,
                      backgroundColor: done ? (i === currentIndex ? gold : leaf) : "#FFFFFF",
                      border: `2px solid ${done ? (i === currentIndex ? gold : leaf) : line}`,
                    }}
                  >
                    <Icon size={14} color={done ? "#FFFFFF" : moss} />
                  </div>
                  <div className="pt-1">
                    <div className="text-sm font-medium" style={{ color: done ? ink : moss }}>{step.label}</div>
                    {step.key === "confirmed" && order.cookTimeMinutes && i <= currentIndex && (
                      <div className="text-xs mt-0.5" style={{ color: gold }}>Estimated cook time: {order.cookTimeMinutes} min</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="p-4" style={{ backgroundColor: "#FFFFFF", border: `1px solid ${line}`, borderRadius: 10 }}>
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm" style={{ color: ink }}>Order summary</div>
            <span
              className="text-xs px-2.5 py-1"
              style={{ backgroundColor: order.paymentStatus === "paid" ? "#E6EFE3" : "#FBEADB", color: order.paymentStatus === "paid" ? leaf : paprika, borderRadius: 20, fontWeight: 600 }}
            >
              {order.paymentStatus === "paid" ? "Paid" : "Payment pending"}
            </span>
          </div>
          <div style={{ borderTop: `1px dashed ${line}` }} className="pt-2 mt-1">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-xs py-1" style={{ color: moss }}>
                <span>{item.name} × {item.quantity || 1}</span>
                <span>₹{item.price * (item.quantity || 1)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-base font-semibold mt-2 pt-2" style={{ color: ink, borderTop: `1px dashed ${line}`, fontFamily: "Georgia, serif" }}>
            <span>Total</span>
            <span style={{ color: gold }}>₹{order.totalAmount}</span>
          </div>

          {order.paymentStatus !== "paid" && !isCancelled && (
            <div className="mt-4">
              <button
                onClick={handlePayNow}
                disabled={paying}
                className="w-full py-2.5 text-sm"
                style={{ backgroundColor: ink, color: cream, borderRadius: 6, opacity: paying ? 0.6 : 1 }}
              >
                {paying ? "Opening payment…" : `Pay ₹${order.totalAmount} online now`}
              </button>
              {payError && <p className="text-xs mt-2" style={{ color: paprika }}>{payError}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
