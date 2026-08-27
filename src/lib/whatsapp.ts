import { Sale, Branch } from './types';

/**
 * Formats currency in Ghana Cedis (GH₵)
 */
export function formatGHSCurrency(amount: number): string {
  return `GH₵ ${amount.toFixed(2)}`;
}

/**
 * Format date nicely for receipts
 */
export function formatReceiptDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('en-GH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Generate formatted plain text digital receipt for WhatsApp sharing
 */
export function generateWhatsAppReceiptText(sale: Sale, branch: Branch): string {
  const dateStr = formatReceiptDate(sale.timestamp);
  
  let text = `🏥 *${branch.name.toUpperCase()}*\n`;
  text += `📍 ${branch.location}\n`;
  text += `📞 Tel: ${branch.phone}\n`;
  text += `------------------------------------\n`;
  text += `🧾 *DIGITAL PHARMACY RECEIPT*\n`;
  text += `Invoice #: *${sale.receiptNumber}*\n`;
  text += `Date: ${dateStr}\n`;
  if (sale.payment.customerName) {
    text += `Customer: ${sale.payment.customerName}\n`;
  }
  text += `Attendant: ${sale.attendantName}\n`;
  text += `------------------------------------\n\n`;

  text += `*ITEMS PURCHASED:*\n`;
  sale.items.forEach((item, index) => {
    text += `${index + 1}. *${item.product.brandName}*\n`;
    text += `   Form: ${item.product.dosageForm} (${item.selectedBatch.batchNumber})\n`;
    text += `   Qty: ${item.quantity} x ${formatGHSCurrency(item.unitPrice)} = *${formatGHSCurrency(item.lineTotal)}*\n\n`;
  });

  text += `------------------------------------\n`;
  text += `Subtotal: ${formatGHSCurrency(sale.subtotal)}\n`;
  if (sale.discount > 0) {
    text += `Discount: -${formatGHSCurrency(sale.discount)}\n`;
  }
  text += `*TOTAL AMOUNT: ${formatGHSCurrency(sale.total)}*\n`;
  text += `------------------------------------\n`;

  // Payment Breakdown
  text += `*PAYMENT METHOD:* `;
  if (sale.payment.method === 'CASH') {
    text += `Cash 💵\n`;
    text += `Cash Paid: ${formatGHSCurrency(sale.payment.cashPaid || sale.total)}\n`;
    if ((sale.payment.cashChange || 0) > 0) {
      text += `Change Returned: ${formatGHSCurrency(sale.payment.cashChange || 0)}\n`;
    }
  } else if (sale.payment.method === 'SPLIT') {
    text += `Cash + Mobile Money 🔄\n`;
    text += `• Cash: ${formatGHSCurrency(sale.payment.cashPaid || 0)}\n`;
    text += `• ${sale.payment.momoProvider}: ${formatGHSCurrency(sale.payment.momoAmount || 0)} (Ref: ${sale.payment.momoRef || 'N/A'})\n`;
  } else {
    text += `${sale.payment.momoProvider || 'Mobile Money'} 📱\n`;
    text += `Ref: ${sale.payment.momoRef || 'N/A'}\n`;
  }

  text += `\nThank you for choosing ${branch.name}! Wish you speedy recovery and good health. 🙏✨\n`;
  text += `_Powered by PharmaSync GH_`;

  return text;
}

/**
 * Generate WhatsApp Click-To-Chat URL
 */
export function getWhatsAppShareUrl(phone: string | undefined, message: string): string {
  const encodedText = encodeURIComponent(message);
  let cleanPhone = (phone || '').replace(/[^0-9]/g, '');

  if (cleanPhone.startsWith('0')) {
    cleanPhone = '233' + cleanPhone.substring(1);
  }

  if (cleanPhone.length >= 10) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }

  return `https://wa.me/?text=${encodedText}`;
}
