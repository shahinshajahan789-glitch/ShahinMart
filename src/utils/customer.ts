import { CustomerProfile, CartItem, Order } from '../types';

const CURRENT_CUSTOMER_KEY = 'shahinmart_active_customer_v2';
const CUSTOMERS_INDEX_KEY = 'shahinmart_customers_index_v2';

function generateGuestId(): string {
  return 'cust_' + Math.random().toString(36).substring(2, 8) + Date.now().toString(36).substring(4);
}

export function getCurrentCustomer(): CustomerProfile {
  try {
    const raw = localStorage.getItem(CURRENT_CUSTOMER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load current customer', e);
  }

  // Create a clean new customer profile
  const newGuest: CustomerProfile = {
    id: generateGuestId(),
    name: '',
    phone: '',
    createdAt: new Date().toISOString(),
  };

  saveCurrentCustomer(newGuest);
  return newGuest;
}

export function saveCurrentCustomer(profile: CustomerProfile): void {
  try {
    localStorage.setItem(CURRENT_CUSTOMER_KEY, JSON.stringify(profile));

    // Also index customer by ID/phone so returning customers can be retrieved
    const rawList = localStorage.getItem(CUSTOMERS_INDEX_KEY);
    const list: CustomerProfile[] = rawList ? JSON.parse(rawList) : [];
    const idx = list.findIndex((c) => c.id === profile.id || (c.phone && profile.phone && c.phone === profile.phone));
    if (idx > -1) {
      list[idx] = { ...list[idx], ...profile };
    } else {
      list.push(profile);
    }
    localStorage.setItem(CUSTOMERS_INDEX_KEY, JSON.stringify(list));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('shahinmart_customer_change'));
    }
  } catch (e) {
    console.error('Failed to save customer profile', e);
  }
}

export function startNewCustomerSession(): CustomerProfile {
  const freshCustomer: CustomerProfile = {
    id: generateGuestId(),
    name: '',
    phone: '',
    createdAt: new Date().toISOString(),
  };
  saveCurrentCustomer(freshCustomer);
  return freshCustomer;
}

export function switchCustomerByPhone(phone: string, name?: string): CustomerProfile {
  const cleanPhone = phone.replace(/\D/g, '');
  try {
    const rawList = localStorage.getItem(CUSTOMERS_INDEX_KEY);
    const list: CustomerProfile[] = rawList ? JSON.parse(rawList) : [];
    const existing = list.find((c) => c.phone.replace(/\D/g, '') === cleanPhone);

    if (existing) {
      const updated = {
        ...existing,
        name: name || existing.name,
      };
      saveCurrentCustomer(updated);
      return updated;
    }
  } catch (e) {
    console.error(e);
  }

  const newProfile: CustomerProfile = {
    id: 'cust_ph_' + cleanPhone,
    name: name || '',
    phone: cleanPhone,
    createdAt: new Date().toISOString(),
  };
  saveCurrentCustomer(newProfile);
  return newProfile;
}

// Cart & Order persistence strictly segregated per customer ID
export function getCustomerCartKey(customerId: string): string {
  return `shahinmart_cart_${customerId}`;
}

export function getCustomerOrdersKey(customerId: string): string {
  return `shahinmart_cust_orders_${customerId}`;
}

// Get orders belonging ONLY to this specific customer
export function getCustomerPrivateOrders(customerId: string): Order[] {
  try {
    const key = getCustomerOrdersKey(customerId);
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load customer private orders', e);
  }
  return [];
}

// Save order to customer's private storage
export function saveCustomerPrivateOrder(customerId: string, order: Order): void {
  try {
    const existing = getCustomerPrivateOrders(customerId);
    const updated = [order, ...existing.filter((o) => o.id !== order.id)];
    localStorage.setItem(getCustomerOrdersKey(customerId), JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save order to customer private storage', e);
  }
}

// Securely track an order across devices using 2-Factor credential match:
// Must provide BOTH Order Number (or ID) AND registered 10-digit Phone Number.
// Prevents any stranger or other customer from snooping into someone's address by phone number alone.
export function verifyAndTrackOrder(
  allOrders: Order[],
  orderNumberInput: string,
  phoneInput: string
): { success: boolean; order?: Order; error?: string } {
  const cleanPhone = normalizePhone(phoneInput);
  const cleanOrderNum = orderNumberInput.trim().toUpperCase().replace('#', '');

  if (!cleanOrderNum) {
    return { success: false, error: 'Please enter your Order Number (e.g. SM-2026-XXXX)' };
  }

  if (cleanPhone.length !== 10) {
    return { success: false, error: 'Please enter your registered 10-digit mobile number' };
  }

  const matched = allOrders.find((ord) => {
    const numMatch =
      ord.orderNumber.toUpperCase().replace('#', '') === cleanOrderNum ||
      ord.id.toUpperCase() === cleanOrderNum;
    if (!numMatch) return false;

    const ordPhone = normalizePhone(ord.deliveryAddress?.phone);
    const ordAltPhone = normalizePhone(ord.deliveryAddress?.altPhone);
    return ordPhone === cleanPhone || ordAltPhone === cleanPhone;
  });

  if (!matched) {
    return {
      success: false,
      error: 'Order not found with matching Order Number and Mobile Number. Please double check both details.',
    };
  }

  return { success: true, order: matched };
}

export function loadCustomerCart(customerId: string): CartItem[] {
  try {
    const key = getCustomerCartKey(customerId);
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }
    // Backward compatibility: check if there's a legacy cart to migrate once
    const legacy = localStorage.getItem('shahinmart_cart_items_v1');
    if (legacy) {
      localStorage.removeItem('shahinmart_cart_items_v1');
      const parsed = JSON.parse(legacy);
      saveCustomerCart(customerId, parsed);
      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Failed to read customer cart', e);
    return [];
  }
}

export function saveCustomerCart(customerId: string, items: CartItem[]): void {
  try {
    const key = getCustomerCartKey(customerId);
    localStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save customer cart', e);
  }
}

// Normalize phone numbers for safe comparison (extract digits, last 10 digits)
export function normalizePhone(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

// Filter orders strictly for a specific customer.
// Only returns orders that belong directly to this customer session.
// Unauthorized third-party searches are forbidden.
export function filterCustomerOrders(
  allOrders: Order[],
  customer: CustomerProfile
): Order[] {
  // 1. First check customer's private stored orders
  const privateOrders = getCustomerPrivateOrders(customer.id);
  if (privateOrders.length > 0) {
    return privateOrders;
  }

  // 2. Fallback to matching by direct customerId
  const targetId = customer.id;
  const matched = allOrders.filter((order) => order.customerId && order.customerId === targetId);

  // If customer has phone registered in this specific verified profile
  if (matched.length === 0 && customer.phone && normalizePhone(customer.phone).length === 10) {
    const cleanPhone = normalizePhone(customer.phone);
    return allOrders.filter((order) => {
      const ordPhone = normalizePhone(order.deliveryAddress?.phone);
      return ordPhone === cleanPhone;
    });
  }

  return matched;
}
