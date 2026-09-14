const nodemailer = require('nodemailer');
const { buildAdminOrderEmail, buildCustomerOrderEmail } = require('./emailTemplate');

// Uses Gmail + an App Password (not your regular Gmail password).
// Generate one at: https://myaccount.google.com/apppasswords
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function plainTextFallback(order) {
  const itemsList = order.items
    .map((i) => `- ${i.name} (${i.day}) x${i.portions} — ₹${i.price}`)
    .join('\n');
  return `Order for ${order.name}\n\n${itemsList}\n\nTotal: ₹${order.totalAmount}`;
}

async function sendAdminNotification(order) {
  await transporter.sendMail({
    from: `"Bol Proteinis Orders" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New order from ${order.name} — ₹${order.totalAmount} (needs confirmation)`,
    text: plainTextFallback(order),
    html: buildAdminOrderEmail(order),
  });
}

async function sendCustomerConfirmation(order) {
  await transporter.sendMail({
    from: `"Bol Proteinis" <${process.env.EMAIL_USER}>`,
    to: order.email,
    subject: 'Your Bol Proteinis order is confirmed',
    text: plainTextFallback(order),
    html: buildCustomerOrderEmail(order),
  });
}

module.exports = { sendAdminNotification, sendCustomerConfirmation };