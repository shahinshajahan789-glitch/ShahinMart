export type RulingType = 'Single Line' | 'Double Line' | 'Four Line' | 'Unruled' | 'Square / Grid';

export type BookSize = 'A4 (29.7 x 21 cm)' | 'Long (31 x 19.5 cm)' | 'Short / Compact (19 x 15.5 cm)' | 'Medium (24 x 18 cm)' | 'Practical / Record (A4)';

export type TargetAudience = 'all' | 'students' | 'teachers' | 'offices';

export interface ColorVariant {
  name: string;
  hex: string;
  image: string;
  quote?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: 'Papergrid' | 'Classmate' | 'Premium Local' | 'Budget Friendly';
  originalPrice: number;
  offerPrice: number;
  size: string;
  pages: number | string;
  setDetails: string;
  inStock: boolean;
  isOfferHighlight?: boolean;
  category: 'notebook-set' | 'compact-book' | 'bundle' | 'practical' | 'essentials';
  targetAudience: ('students' | 'teachers' | 'offices')[];
  rulings: RulingType[];
  description: string;
  paperGsm?: number;
  coverType?: string;
  binding?: string;
  tags: string[];
  image: string;
  motivationalQuote?: string;
  colorVariants?: ColorVariant[];
  activityFeature?: string;
  dimensions?: string;
}

export interface CartItem {
  id: string; // unique item instance in cart
  product: Product;
  quantity: number;
  selectedRuling: RulingType;
  selectedSize?: string;
}

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  altPhone?: string;
  pincode: string;
  houseNo: string;
  streetArea: string;
  landmark?: string;
  city: string;
  district: string;
  state: string;
  addressType: 'home' | 'work' | 'school';
  deliveryInstructions?: string;
}

export type PaymentMethod = 'upi_qr' | 'upi_app' | 'card' | 'cod' | 'bank_transfer';

export interface Order {
  id: string;
  orderNumber: string;
  customerId?: string;
  items: CartItem[];
  deliveryAddress: DeliveryAddress;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'cod_pending' | 'verification_pending';
  upiTransactionId?: string;
  paymentScreenshot?: string;
  createdAt: string;
  status: 'new' | 'confirmed' | 'packing' | 'out_for_delivery' | 'delivered';
  customerNotes?: string;
}

export interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface MerchantNotification {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  timestamp: string;
  read: boolean;
  message: string;
}

export interface BulkQuoteRequest {
  id: string;
  institutionName: string;
  contactPerson: string;
  phone: string;
  institutionType: 'school' | 'college' | 'tuition' | 'office' | 'retail';
  estimatedQuantity: string;
  requiredItems: string;
  submittedAt: string;
}
