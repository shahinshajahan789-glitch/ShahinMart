import { Order, MerchantNotification } from '../types';
import { MERCHANT_INFO } from '../data/products';
import { soundAlert } from './audioAlert';

const ORDERS_STORAGE_KEY = 'shahinmart_orders_db_v1';
const ALERTS_STORAGE_KEY = 'shahinmart_alerts_db_v1';

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Generate the exact WhatsApp message to notify the merchant (and customer copy)
export function generateWhatsAppOrderMessage(order: Order): string {
  const isCod = order.paymentMethod === 'cod';
  const paymentBadge = isCod
    ? '⚠️ CASH ON DELIVERY (Collect ₹' + order.totalAmount + ')'
    : `✅ PAID VIA UPI / QR (₹${order.totalAmount}${order.upiTransactionId ? ' | Ref: ' + order.upiTransactionId : ''})`;

  const itemsList = order.items
    .map((item, idx) => {
      return `${idx + 1}. *${item.product.name}*\n   • Qty: ${item.quantity} set(s)\n   • Ruling: ${item.selectedRuling}\n   • Size: ${item.product.size}\n   • Price: ₹${item.product.offerPrice * item.quantity}`;
    })
    .join('\n');

  const addr = order.deliveryAddress;
  const addressText = `${addr.fullName}
📞 Phone: ${addr.phone}${addr.altPhone ? ` | Alt: ${addr.altPhone}` : ''}
🏠 Address: ${addr.houseNo}, ${addr.streetArea}
📍 Landmark: ${addr.landmark || 'N/A'}
🏙️ City/District: ${addr.city}, ${addr.district} - ${addr.pincode}
🏷️ Type: ${addr.addressType.toUpperCase()}${addr.deliveryInstructions ? `\n📝 Note: ${addr.deliveryInstructions}` : ''}`;

  return `*🚨 NEW ORDER ALERT - ShahinMART!*
===========================
*Order ID:* ${order.orderNumber}
*Date:* ${new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
*Status:* ${paymentBadge}

*📦 ITEMS ORDERED:*
${itemsList}

*💰 BILLING SUMMARY:*
• Subtotal: ₹${order.subtotal}
• Discount Saved: ₹${order.discount}
• Delivery: ${order.deliveryFee === 0 ? 'FREE' : '₹' + order.deliveryFee}
*TOTAL PAYABLE: ₹${order.totalAmount}*

*📍 DELIVERY ADDRESS:*
${addressText}

===========================
_Sent via ShahinMART Book & Stationery Store (Venjaramoodu)_`;
}

export function getWhatsAppOrderUrl(order: Order): string {
  const message = generateWhatsAppOrderMessage(order);
  return `https://wa.me/${MERCHANT_INFO.phoneRaw}?text=${encodeURIComponent(message)}`;
}

// Local persistence for orders
export function getStoredOrders(): Order[] {
  try {
    const data = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load orders', e);
    return [];
  }
}

export function saveOrderToStorage(order: Order): void {
  try {
    const existing = getStoredOrders();
    const updated = [order, ...existing];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));

    // Also trigger merchant notification record
    const notification: MerchantNotification = {
      id: 'notif_' + Date.now(),
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.deliveryAddress.fullName,
      customerPhone: order.deliveryAddress.phone,
      amount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      timestamp: new Date().toISOString(),
      read: false,
      message: `New ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Prepaid UPI'} order ${order.orderNumber} from ${order.deliveryAddress.fullName} for ₹${order.totalAmount}`,
    };

    const existingAlerts = getStoredAlerts();
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify([notification, ...existingAlerts]));

    // Sound chime
    if (order.paymentMethod === 'cod') {
      soundAlert.playCodAlert();
    } else {
      soundAlert.playOrderChime();
    }

    // Trigger browser notification if supported and allowed
    triggerBrowserNotification(order);
  } catch (e) {
    console.error('Failed to save order', e);
  }
}

export function updateOrderStatusInStorage(orderId: string, status: Order['status']): void {
  try {
    const orders = getStoredOrders();
    const updated = orders.map((ord) => (ord.id === orderId ? { ...ord, status } : ord));
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update status', e);
  }
}

export function getStoredAlerts(): MerchantNotification[] {
  try {
    const data = localStorage.getItem(ALERTS_STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

export function markAlertAsRead(alertId: string): void {
  try {
    const alerts = getStoredAlerts();
    const updated = alerts.map((a) => (a.id === alertId ? { ...a, read: true } : a));
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
}

// HTML5 Notification Helper
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const result = await Notification.requestPermission();
    return result === 'granted';
  }
  return false;
}

export function triggerBrowserNotification(order: Order): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(`🔔 ShahinMART: New Order ${order.orderNumber}!`, {
        body: `₹${order.totalAmount} by ${order.deliveryAddress.fullName} (${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid via UPI'})`,
        icon: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=128&q=80',
      });
    } catch (e) {
      console.warn('Browser notification error', e);
    }
  }
}
