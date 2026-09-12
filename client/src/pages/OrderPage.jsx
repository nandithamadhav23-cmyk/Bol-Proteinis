import { useState } from "react";
import WeeklyMenu from "../components/WeeklyMenu";
import OrderForm from "../components/OrderForm";

const ink = "#223A2E";
const cream = "#F6F2E7";
const moss = "#5C7A56";

export default function OrderPage() {
  const [cart, setCart] = useState([]);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  function handleAdd(item, portions, price) {
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (c) => c.menuItem === item._id && c.portions === portions
      );
      if (existingIndex !== -1) {
        // Same dish + same portion size already in the cart — bump quantity instead of duplicating
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [
        ...prev,
        { menuItem: item._id, name: item.name, day: item.day, portions, price, quantity: 1 },
      ];
    });
  }

  function handleUpdateQuantity(index, delta) {
    setCart((prev) => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index] = { ...updated[index], quantity: newQty };
      return updated;
    });
  }

  function handleRemove(index) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  if (confirmedOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: cream }}>
        <div className="text-center px-6">
          <h1 className="text-3xl mb-3" style={{ fontFamily: "Georgia, serif", color: ink }}>
            Order received
          </h1>
          <p className="text-sm" style={{ color: moss }}>
            Thanks, {confirmedOrder.name} — we've noted your order for ₹{confirmedOrder.totalAmount}.
            You'll receive a confirmation once payment is verified.
          </p>
          <a
            href={`https://wa.me/9198XXXXXXXX?text=${encodeURIComponent(
              `Hi, I just placed an order (₹${confirmedOrder.totalAmount}) — following up on payment.`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-5 text-sm px-4 py-2"
            style={{ backgroundColor: "#25D366", color: "#fff", borderRadius: 4 }}
          >
            Message us on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <WeeklyMenu onAdd={handleAdd} />
      <OrderForm cart={cart} onRemove={handleRemove} onUpdateQuantity={handleUpdateQuantity} onSubmitted={setConfirmedOrder} />
    </div>
  );
}
