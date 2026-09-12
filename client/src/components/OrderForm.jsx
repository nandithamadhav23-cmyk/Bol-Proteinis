import { useState } from "react";
import { COMMUNITIES } from "../data/communities";

const ink = "#223A2E";
const cream = "#F6F2E7";
const moss = "#5C7A56";
const gold = "#C98A2C";
const line = "#DAD2BC";
const errorColor = "#B3441E";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

const inputStyle = {
  border: `1px solid ${line}`,
  borderRadius: 4,
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  width: "100%",
  backgroundColor: "#FFFFFF",
  color: ink,
};

const labelStyle = { fontSize: "0.75rem", color: moss, marginBottom: "0.25rem", display: "block" };

const cartStyles = `
@keyframes sdCartPop {
  0% { opacity: 0; transform: translateX(-8px); }
  100% { opacity: 1; transform: translateX(0); }
}
.sd-cart-item { animation: sdCartPop 0.25s ease; }
`;

export default function OrderForm({ cart, onRemove, onUpdateQuantity, onSubmitted }) {
  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    community: "",
    flatNumber: "",
    allergiesNotes: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

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
      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: cart.map((c) => ({
            menuItem: c.menuItem,
            name: c.name,
            day: c.day,
            portions: c.portions,
            price: c.price,
            quantity: c.quantity,
          })),
          totalAmount: total,
        }),
      });
      if (!res.ok) throw new Error("Order failed");
      const order = await res.json();
      onSubmitted(order);
    } catch (err) {
      setSubmitError("Something went wrong placing your order. Please try again.");
      console.log(err.message)
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full" style={{ backgroundColor: cream }}>
      <style>{cartStyles}</style>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h2 className="text-2xl mb-6" style={{ fontFamily: "Georgia, serif", color: ink }}>
          Your order
        </h2>

        {/* Cart summary */}
        <div className="mb-8">
          {cart.length === 0 ? (
            <p className="text-sm" style={{ color: moss }}>No items added yet — pick something from the menu above.</p>
          ) : (
            <div style={{ borderTop: `1px solid ${line}` }}>
              {cart.map((item, i) => (
                <div
                  key={i}
                  className="sd-cart-item flex justify-between items-center py-3 text-sm"
                  style={{ borderBottom: `1px solid ${line}` }}
                >
                  <div>
                    <span style={{ color: ink }}>{item.name}</span>{" "}
                    <span style={{ color: moss }}>· {item.day} · {item.portions === 1 ? "1 serving" : "2 servings"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center" style={{ border: `1px solid ${line}`, borderRadius: 4 }}>
                      <button
                        onClick={() => onUpdateQuantity(i, -1)}
                        className="px-2 py-0.5 text-sm"
                        style={{ color: ink }}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="px-2 text-sm" style={{ color: ink, minWidth: 16, textAlign: "center" }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(i, 1)}
                        className="px-2 py-0.5 text-sm"
                        style={{ color: ink }}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <span style={{ color: gold, fontWeight: 600, minWidth: 56, textAlign: "right" }}>
                      ₹{item.price * item.quantity}
                    </span>
                    <button onClick={() => onRemove(i)} style={{ color: errorColor, fontSize: "0.75rem" }}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between py-3 text-sm font-semibold" style={{ color: ink }}>
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>
          )}
          {errors.cart && <p className="text-xs mt-2" style={{ color: errorColor }}>{errors.cart}</p>}
        </div>

        {/* Customer details */}
        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
          <div>
            <label style={labelStyle}>Email *</label>
            <input style={inputStyle} type="email" value={form.email} onChange={update("email")} />
            {errors.email && <p className="text-xs mt-1" style={{ color: errorColor }}>{errors.email}</p>}
          </div>

          <div>
            <label style={labelStyle}>Name *</label>
            <input style={inputStyle} type="text" value={form.name} onChange={update("name")} />
            {errors.name && <p className="text-xs mt-1" style={{ color: errorColor }}>{errors.name}</p>}
          </div>

          <div>
            <label style={labelStyle}>Phone Number *</label>
            <input style={inputStyle} type="tel" value={form.phone} onChange={update("phone")} placeholder="10-digit number" />
            {errors.phone && <p className="text-xs mt-1" style={{ color: errorColor }}>{errors.phone}</p>}
          </div>

          <div>
            <label style={labelStyle}>Residential Community *</label>
            <select style={inputStyle} value={form.community} onChange={update("community")}>
              <option value="">Select your community</option>
              {COMMUNITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.community && <p className="text-xs mt-1" style={{ color: errorColor }}>{errors.community}</p>}
          </div>

          <div className="sm:col-span-2">
            <label style={labelStyle}>Flat/Villa Number & Block/Phase *</label>
            <input style={inputStyle} type="text" value={form.flatNumber} onChange={update("flatNumber")} />
            {errors.flatNumber && <p className="text-xs mt-1" style={{ color: errorColor }}>{errors.flatNumber}</p>}
          </div>

          <div className="sm:col-span-2">
            <label style={labelStyle}>Allergies / concerns / comments</label>
            <textarea
              style={{ ...inputStyle, minHeight: 80 }}
              value={form.allergiesNotes}
              onChange={update("allergiesNotes")}
            />
          </div>

          {submitError && <p className="text-sm sm:col-span-2" style={{ color: errorColor }}>{submitError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="sm:col-span-2 mt-2 py-3 text-sm"
            style={{ backgroundColor: ink, color: cream, borderRadius: 4, opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? "Placing order…" : `Place order — ₹${total}`}
          </button>
        </form>
      </div>
    </div>
  );
}
