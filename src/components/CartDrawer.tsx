import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Banknote, QrCode, User, RotateCcw } from 'lucide-react';
import { CartItem, PaymentMethod } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  customerName?: string;
  customerPhone?: string;
  onStartNewCustomer?: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: (method?: PaymentMethod) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  customerName,
  customerPhone,
  onStartNewCustomer,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + item.product.offerPrice * item.quantity, 0);
  const originalTotal = items.reduce((acc, item) => acc + item.product.originalPrice * item.quantity, 0);
  const totalSavings = originalTotal - subtotal;
  const freeDeliveryThreshold = 499;
  const isFreeDelivery = subtotal >= freeDeliveryThreshold || items.length === 0;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end transition-opacity">
      <div
        id="cart-drawer-panel"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-extrabold text-slate-900">Your Shopping Cart</h2>
            <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Session Bar */}
        <div className="px-4 py-2 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5 truncate">
            <User className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="font-semibold truncate">
              Customer: <strong className="text-slate-900">{customerName || (customerPhone ? `+91 ${customerPhone}` : 'Personal Cart')}</strong>
            </span>
          </div>
          {onStartNewCustomer && (
            <button
              type="button"
              onClick={onStartNewCustomer}
              title="Start a fresh cart for another person so products do not mix up"
              className="text-[10px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 shrink-0 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Switch / New User</span>
            </button>
          )}
        </div>

        {/* Free Delivery Bar */}
        <div className="px-4 py-2.5 bg-amber-50/80 border-b border-amber-100 text-xs">
          {isFreeDelivery ? (
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
              <span>🎉 Congratulations!</span>
              <span>You have unlocked FREE Delivery in Kerala</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex justify-between text-amber-900 font-medium text-[11px]">
                <span>Add ₹{amountNeededForFreeDelivery} more for FREE delivery</span>
                <span>₹{subtotal} / ₹{freeDeliveryThreshold}</span>
              </div>
              <div className="w-full h-1.5 bg-amber-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (subtotal / freeDeliveryThreshold) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-700 text-base">Your cart is empty</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Explore our notebook collections, Papergrid, Classmate sets and add items to your cart.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 flex gap-3">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-18 h-18 object-cover rounded-xl border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.product.name}</h4>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition p-0.5"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {item.selectedRuling}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                        {item.product.size}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-50">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-slate-900">
                        ₹{item.product.offerPrice * item.quantity}
                      </span>
                      <span className="text-[11px] text-slate-400 line-through">
                        ₹{item.product.originalPrice * item.quantity}
                      </span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-200 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 py-0.5 text-xs font-bold text-slate-800 min-w-[22px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-200 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout Button */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50/60 space-y-3">
            {totalSavings > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-center">
                <p className="text-xs font-bold text-emerald-800">
                  🎉 Total Savings: ₹{totalSavings} with ShahinMART Offer Pricing!
                </p>
              </div>
            )}

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-semibold text-slate-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Delivery in Kerala</span>
                <span className="font-semibold text-emerald-700">
                  {isFreeDelivery ? 'FREE' : '₹40'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Order Total</span>
                <span>₹{subtotal + (isFreeDelivery ? 0 : 40)}</span>
              </div>
            </div>

            {/* Quick Checkout Actions with explicit Cash on Delivery */}
            <div className="space-y-2 pt-1">
              <button
                id="cart-cod-checkout-btn"
                type="button"
                onClick={() => {
                  onClose();
                  onProceedToCheckout('cod');
                }}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Banknote className="w-5 h-5 text-emerald-200" />
                <span>💵 Order with Cash on Delivery</span>
              </button>

              <button
                id="cart-proceed-checkout-btn"
                type="button"
                onClick={() => {
                  onClose();
                  onProceedToCheckout('upi_qr');
                }}
                className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl font-bold text-xs shadow-sm hover:shadow transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                <span>Or Pay Online (Instant UPI QR / Cards)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-600 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cash on Delivery Available • Verified Kerala Dispatch</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
