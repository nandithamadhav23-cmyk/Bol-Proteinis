const twilio = require('twilio');

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendOrderWhatsApp(order) {
  const itemsList = order.items.map((i) => `${i.name} x${i.portions}`).join(', ');

  // Sends to the restaurant/admin's WhatsApp — customer-facing WhatsApp
  // messages require a Meta-approved message template, so start with
  // admin notifications only; see notes below for customer messages.
  await client.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`, // sandbox: whatsapp:+14155238886
    to: `whatsapp:${process.env.ADMIN_WHATSAPP}`, // e.g. whatsapp:+9198XXXXXXXX
    body: `🥗 New order — ${order.name} (${order.phone})\n${itemsList}\nTotal: ₹${order.totalAmount}\n📍 ${order.flatNumber}, ${order.community}`,
  });
}

module.exports = { sendOrderWhatsApp };
