const ink = '#223A2E';
const cream = '#F6F2E7';
const moss = '#5C7A56';
const gold = '#C98A2C';
const line = '#DAD2BC';

function itemCard(item) {
  return `
    <tr>
      <td style="padding: 6px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
               style="background:#FFFFFF; border:1px solid ${line}; border-radius:8px; animation: sdFadeUp 0.5s ease both;">
          <tr>
            <td style="padding:14px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:Georgia, serif; font-size:16px; color:${ink}; font-weight:700;">
                    ${item.name}
                  </td>
                  <td align="right" style="font-family:Arial, sans-serif; font-size:16px; color:${gold}; font-weight:700; white-space:nowrap;">
                    ₹${item.price * (item.quantity || 1)}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="font-family:Arial, sans-serif; font-size:12px; color:${moss}; padding-top:2px;">
                    ${item.day} · ${item.portions === 1 ? '1 serving' : '2 servings'}${item.quantity > 1 ? ` · qty ${item.quantity}` : ''}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function baseTemplate({ heading, subheading, bodyHtml }) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @keyframes sdFadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes sdFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .sd-banner { animation: sdFadeIn 0.6s ease both; }
</style>
</head>
<body style="margin:0; padding:0; background:${cream}; font-family:Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${cream}; padding:24px 0;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Header banner -->
          <tr>
            <td class="sd-banner" style="background:${ink}; border-radius:10px 10px 0 0; padding:28px 24px;">
              <div style="font-family:Arial Black, Arial, sans-serif; font-size:24px; color:${cream}; font-weight:900;">BOL PROTEINIS</div>
              <div style="font-family:Arial, sans-serif; font-size:13px; color:#C7D2C2; margin-top:4px;">${heading}</div>
            </td>
          </tr>

          <!-- Body card -->
          <tr>
            <td style="background:#FFFFFF; padding:24px; border-left:1px solid ${line}; border-right:1px solid ${line};">
              <div style="font-family:Arial, sans-serif; font-size:14px; color:${ink}; margin-bottom:16px;">${subheading}</div>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${bodyHtml}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${ink}; border-radius:0 0 10px 10px; padding:16px 24px; font-family:Arial, sans-serif; font-size:11px; color:#C7D2C2;">
              Bol Proteinis · Protein bowls, salads, smoothies and sandwiches.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function itemsTableRows(items) {
  return items.map(itemCard).join('');
}

function totalRow(total) {
  return `
    <tr>
      <td style="padding-top:10px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
               style="background:${gold}; border-radius:8px;">
          <tr>
            <td style="padding:12px 16px; font-family:Arial, sans-serif; font-size:14px; color:${cream}; font-weight:700;">
              Total
            </td>
            <td align="right" style="padding:12px 16px; font-family:Arial, sans-serif; font-size:16px; color:${cream}; font-weight:700;">
              ₹${total}
            </td>
          </tr>
        </table>
      </td>
    </tr>`;
}

function detailRow(label, value) {
  return `
    <tr>
      <td style="padding:3px 0; font-family:Arial, sans-serif; font-size:13px; color:${moss};">${label}</td>
      <td align="right" style="padding:3px 0; font-family:Arial, sans-serif; font-size:13px; color:${ink}; font-weight:600;">${value}</td>
    </tr>`;
}

function buildAdminOrderEmail(order) {
  const details = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background:${cream}; border-radius:8px; padding:12px 16px; margin-bottom:16px;">
      ${detailRow('Name', order.name)}
      ${detailRow('Phone', order.phone)}
      ${detailRow('Email', order.email)}
      ${detailRow('Community', order.community)}
      ${detailRow('Flat/Villa', order.flatNumber)}
      ${order.allergiesNotes ? detailRow('Notes', order.allergiesNotes) : ''}
    </table>`;

  const bodyHtml = `<tr><td>${details}</td></tr>` + itemsTableRows(order.items) + totalRow(order.totalAmount);

  return baseTemplate({
    heading: 'New order received',
    subheading: `New order from <strong>${order.name}</strong> — here's what they ordered:`,
    bodyHtml,
  });
}

function buildCustomerOrderEmail(order) {
  const bodyHtml = itemsTableRows(order.items) + totalRow(order.totalAmount);
  const cookTimeLine = order.cookTimeMinutes
    ? `Estimated cook time: <strong>${order.cookTimeMinutes} minutes</strong>. `
    : '';

  return baseTemplate({
    heading: 'Order confirmed',
    subheading: `Hi ${order.name}, your order is confirmed! ${cookTimeLine}Here's what's coming your way, delivered to <strong>${order.flatNumber}, ${order.community}</strong>.`,
    bodyHtml,
  });
}

module.exports = { buildAdminOrderEmail, buildCustomerOrderEmail };