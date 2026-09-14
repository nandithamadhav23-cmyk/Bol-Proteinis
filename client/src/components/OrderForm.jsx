import { useState } from "react";
import { Minus, Plus, Trash2, Banknote, CreditCard, ShoppingBasket } from "lucide-react";
import { COMMUNITIES } from "../data/communities";
import { useAuth } from "../context/AuthContext";
import { payWithRazorpay } from "../utils/razorpayPayment";

const ink = "#223A2E";
const cream = "#F6F2E7";
const moss = "#5C7A56";
const gold = "#C98A2C";
const line = "#DAD2BC";
const paprika = "#B0472A";

const inputStyle = {
  border: `1px solid ${line}`,
  borderRadius: 6,
  padding: "0.6rem 0.75rem",
  fontSize: "0.875rem",
  width: "100%",
  backgroundColor: cream,
  color: ink,
};

const labelStyle = { fontSize: "0.75rem", color: moss, marginBottom: "0.3rem", display: "block" };

const styles = `
@keyframes sdCartPop {
  0% { opacity: 0; transform: translateX(-8px); }
  100% { opacity: 1; transform: translateX(0); }
}
@keyframes sdCardIn {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.sd-cart-item { animation: sdCartPop 0.25s ease; }
.sd-order-card { animation: sdCardIn 0.5s ease both; }
.sd-qty-btn { transition: background-color 0.15s ease; }
.sd-qty-btn:hover { background-color: ${cream}; }
.sd-pay-option { transition: transform 0.15s ease, box-shadow 0.15s ease; }
.sd-pay-option:hover { transform: translateY(-1px); }
.sd-submit-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; }
.sd-submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 14px rgba(34,58,46,0.25); }
.sd-submit-btn:active:not(:disabled) { transform: translateY(0) scale(0.98); }
`;

export default function OrderForm({ cart, onRemove, onUpdateQuantity, onSubmitted, defaultUser }) {
  const { authFetch } = useAuth();
  const [form, setForm] = useState({
    email: defaultUser?.email || "",
    name: defaultUser?.name || "",
    phone: defaultUser?.phone || "",
    community: defaultUser?.community || "",
    flatNumber: defaultUser?.flatNumber || "",
    allergiesNotes: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  function validate() {
    const errs = {};
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.trim())) errs.phone = "Enter a valid 10-digit phone number";
    if (!form.community) errs.community = "Select your community";
    if (!form.flatNumber.trim()) errs.flatNumber = "Flat/Villa number is required";
    if (cart.length === 0) errs.cart = "Add at least one item to your order";
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await authFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          paymentMethod,
          items: cart.map((c) => ({
            menuItem: c.menuItem, name: c.name, day: c.day, portions: c.portions, price: c.price, quantity: c.quantity,
          })),
          totalAmount: total,
        }),
      });
      if (!res.ok) throw new Error("Order failed");
      const order = await res.json();

      if (paymentMethod === "COD") {
        setSubmitting(false);
        onSubmitted(order);
        return;
      }

      await payWithRazorpay({
        order,
        customer: form,
        onSuccess: (updatedOrder) => { setSubmitting(false); onSubmitted(updatedOrder); },
        onCancel: () => {
          setSubmitting(false);
          setSubmitError("Payment was cancelled. Your order is saved as unpaid — you can retry from your tracking page.");
          onSubmitted(order);
        },
        onError: (msg) => { setSubmitting(false); setSubmitError(msg); },
      });
    } catch (err) {
      setSubmitError("Something went wrong placing your order. Please try again.");
      setSubmitting(false);
      console.log(err.message)
    }
  }

  return (
    <div className="w-full" id="order-section" style={{ backgroundColor: cream }}>
      <style>{styles}</style>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="sd-order-card p-6" style={{ backgroundColor: "#FFFFFF", border: `1px solid ${line}`, borderRadius: 14 }}>
          <div className="flex items-center gap-2 mb-5">
            <ShoppingBasket size={20} color={ink} />
            <h2 className="text-xl" style={{ fontFamily: "Georgia, serif", color: ink }}>Your order</h2>
          </div>

          {/* Cart summary */}
          <div className="mb-6">
            {cart.length === 0 ? (
              <p className="text-sm" style={{ color: moss }}>No items added yet — pick something from the menu above.</p>
            ) : (
              <div style={{ borderTop: `1px dashed ${line}` }}>
                {cart.map((item, i) => (
                  <div key={i} className="sd-cart-item flex justify-between items-center py-3" style={{ borderBottom: `1px dashed ${line}` }}>
                    <div className="text-sm">
                      <span style={{ color: ink }}>{item.name}</span>{" "}
                      <span style={{ color: moss }}>· {item.day} · {item.portions === 1 ? "1 serving" : "2 servings"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center" style={{ border: `1px solid ${line}`, borderRadius: 6, overflow: "hidden" }}>
                        <button onClick={() => onUpdateQuantity(i, -1)} className="sd-qty-btn p-1.5" aria-label="Decrease quantity">
                          <Minus size={12} color={ink} />
                        </button>
                        <span className="px-2 text-sm" style={{ color: ink, minWidth: 16, textAlign: "center" }}>{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(i, 1)} className="sd-qty-btn p-1.5" aria-label="Increase quantity">
                          <Plus size={12} color={ink} />
                        </button>
                      </div>
                      <span style={{ color: gold, fontWeight: 600, minWidth: 56, textAlign: "right", fontFamily: "Georgia, serif" }}>
                        ₹{item.price * item.quantity}
                      </span>
                      <button onClick={() => onRemove(i)} aria-label="Remove item">
                        <Trash2 size={14} color={paprika} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center py-3 text-base font-semibold" style={{ color: ink }}>
                  <span>Total</span>
                  <span style={{ color: gold, fontFamily: "Georgia, serif" }}>₹{total}</span>
                </div>
              </div>
            )}
            {errors.cart && <p className="text-xs mt-2" style={{ color: paprika }}>{errors.cart}</p>}
          </div>

          {/* Customer details */}
          <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
            <div>
              <label style={labelStyle}>Email *</label>
              <input style={inputStyle} type="email" value={form.email} onChange={update("email")} />
              {errors.email && <p className="text-xs mt-1" style={{ color: paprika }}>{errors.email}</p>}
            </div>

            <div>
              <label style={labelStyle}>Name *</label>
              <input style={inputStyle} type="text" value={form.name} onChange={update("name")} />
              {errors.name && <p className="text-xs mt-1" style={{ color: paprika }}>{errors.name}</p>}
            </div>

            <div>
              <label style={labelStyle}>Phone Number *</label>
              <input style={inputStyle} type="tel" value={form.phone} onChange={update("phone")} placeholder="10-digit number" />
              {errors.phone && <p className="text-xs mt-1" style={{ color: paprika }}>{errors.phone}</p>}
            </div>

            <div>
              <label style={labelStyle}>Residential Community *</label>
              <select style={inputStyle} value={form.community} onChange={update("community")}>
                <option value="">Select your community</option>
                {COMMUNITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.community && <p className="text-xs mt-1" style={{ color: paprika }}>{errors.community}</p>}
            </div>

            <div className="sm:col-span-2">
              <label style={labelStyle}>Flat/Villa Number & Block/Phase *</label>
              <input style={inputStyle} type="text" value={form.flatNumber} onChange={update("flatNumber")} />
              {errors.flatNumber && <p className="text-xs mt-1" style={{ color: paprika }}>{errors.flatNumber}</p>}
            </div>

            <div className="sm:col-span-2">
              <label style={labelStyle}>Allergies / concerns / comments</label>
              <textarea style={{ ...inputStyle, minHeight: 80 }} value={form.allergiesNotes} onChange={update("allergiesNotes")} />
            </div>

            {submitError && <p className="text-sm sm:col-span-2" style={{ color: paprika }}>{submitError}</p>}

            <div className="sm:col-span-2">
              <label style={labelStyle}>Payment method</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className="sd-pay-option flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
                  style={{ border: `1px solid ${paymentMethod === "COD" ? ink : line}`, borderRadius: 8, backgroundColor: paymentMethod === "COD" ? ink : "#FFFFFF", color: paymentMethod === "COD" ? cream : ink }}
                >
                  <Banknote size={15} /> Cash on Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("Razorpay")}
                  className="sd-pay-option flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
                  style={{ border: `1px solid ${paymentMethod === "Razorpay" ? ink : line}`, borderRadius: 8, backgroundColor: paymentMethod === "Razorpay" ? ink : "#FFFFFF", color: paymentMethod === "Razorpay" ? cream : ink }}
                >
                  <CreditCard size={15} /> Pay Online
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="sd-submit-btn sm:col-span-2 mt-2 py-3.5 text-sm"
              style={{ backgroundColor: ink, color: cream, borderRadius: 8, opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? "Please wait…" : paymentMethod === "COD" ? `Place order (Pay on delivery) — ₹${total}` : `Pay ₹${total} online`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
