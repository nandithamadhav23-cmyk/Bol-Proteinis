const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    if (document.getElementById("razorpay-checkout-js")) {
      const check = setInterval(() => {
        if (window.Razorpay) {
          clearInterval(check);
          resolve(true);
        }
      }, 100);
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// order: the app's own Order document (already created, unpaid)
// customer: { name, email, phone } to prefill the checkout form
export async function payWithRazorpay({ order, customer, onSuccess, onCancel, onError }) {
  const loaded = await loadRazorpayScript();
  if (!loaded) return onError("Couldn't load the payment gateway. Check your connection and try again.");

  try {
    const createRes = await fetch(`${API_BASE}/api/payment/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order._id }),
    });
    const paymentOrder = await createRes.json();
    if (!createRes.ok) throw new Error(paymentOrder.message || "Could not start payment");

    const rzp = new window.Razorpay({
      key: paymentOrder.keyId,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      order_id: paymentOrder.razorpayOrderId,
      name: "Bol Proteinis",
      description: `Order ${order._id}`,
      prefill: {
        name: customer?.name,
        email: customer?.email,
        contact: customer?.phone,
      },
      theme: { color: "#223A2E" },
      handler: async (response) => {
        try {
          const verifyRes = await fetch(`${API_BASE}/api/payment/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: order._id, ...response }),
          });
          const data = await verifyRes.json();
          if (!verifyRes.ok) throw new Error(data.message || "Payment verification failed");
          onSuccess(data.order);
        } catch (err) {
          onError(err.message);
        }
      },
      modal: {
        ondismiss: () => onCancel && onCancel(),
      },
    });
    rzp.open();
  } catch (err) {
    onError(err.message);
  }
}