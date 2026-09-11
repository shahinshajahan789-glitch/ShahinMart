import React, { useState } from 'react';
import {
  X,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  Phone,
  Printer,
  MessageSquare,
  ShieldCheck,
  User,
  LogOut,
  Search,
  Lock,
  ArrowRight,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { Order, CustomerProfile } from '../types';
import {
  filterCustomerOrders,
  normalizePhone,
  saveCustomerPrivateOrder,
  verifyAndTrackOrder,
  startNewCustomerSession,
} from '../utils/customer';
import { getStoredOrders, getWhatsAppOrderUrl, formatINR } from '../utils/notifications';
import { MERCHANT_INFO } from '../data/products';

interface CustomerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerProfile;
  onCustomerChange?: (customer: CustomerProfile) => void;
  onCustomerUpdated?: (customer: CustomerProfile) => void;
  onStartNewCustomer?: () => void;
  onOpenStore?: () => void;
}

export const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({
  isOpen,
  onClose,
  customer,
  onCustomerChange,
  onCustomerUpdated,
  onStartNewCustomer,
  onOpenStore,
}) => {
  const [trackOrderNumber, setTrackOrderNumber] = useState('');
  const [trackPhone, setTrackPhone] = useState(customer.phone || '');
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackError, setTrackError] = useState('');
  const [trackSuccess, setTrackSuccess] = useState('');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  if (!isOpen) return null;

  const allOrders = getStoredOrders();
  const activeOrders = filterCustomerOrders(allOrders, customer);

  const notifyCustomerUpdated = (updated: CustomerProfile) => {
    if (onCustomerUpdated) onCustomerUpdated(updated);
    if (onCustomerChange) onCustomerChange(updated);
  };

  // 2-Factor credential verification: Order Number + Registered Phone
  // Prevents unauthorized persons from looking up anyone else's address
  const handleVerifyAndTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError('');
    setTrackSuccess('');

    const verification = verifyAndTrackOrder(allOrders, trackOrderNumber, trackPhone);
    if (verification.success && verification.order) {
      saveCustomerPrivateOrder(customer.id, verification.order);
      setTrackSuccess(`Order #${verification.order.orderNumber} successfully verified & linked to your session!`);
      setTrackOrderNumber('');
      setTimeout(() => {
        setIsTrackingOpen(false);
        setTrackSuccess('');
      }, 1500);
    } else {
      setTrackError(
        verification.error ||
          'Verification failed. Both Order Number and registered 10-digit Phone Number must match our delivery records to view this order.'
      );
    }
  };

  const handleStartNewSession = () => {
    if (onStartNewCustomer) {
      onStartNewCustomer();
    } else {
      const fresh = startNewCustomerSession();
      notifyCustomerUpdated(fresh);
    }
    setIsTrackingOpen(false);
    setTrackError('');
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Delivered
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
            <Truck className="w-3.5 h-3.5" />
            Out for Delivery
          </span>
        );
      case 'packing':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <Package className="w-3.5 h-3.5" />
            Packing Station
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            Order Placed
          </span>
        );
    }
  };

  const handlePrintOrder = (ord: Order) => {
    setSelectedOrderForInvoice(ord);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div
        id="customer-orders-modal"
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 relative my-6 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">My Purchases &amp; Orders</h2>
              <p className="text-xs text-slate-300">
                Individual customer portal • Only you can see your purchases &amp; address
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Strict Privacy Guarantee Banner */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2.5 flex items-center gap-2.5 text-xs text-emerald-900 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <p className="text-[11px] leading-snug">
            <strong>Address Privacy Guaranteed:</strong> Your delivery address and orders can only be seen by <strong>you</strong> and the <strong>Store Owner (Shahin)</strong> for fulfillment. No other customers can view your address or orders.
          </p>
        </div>

        {/* Customer Identity Bar & Switcher */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 shrink-0 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900">
                {customer.name ? customer.name : customer.phone ? `Customer (+91 ${customer.phone})` : 'Private Customer Session'}
              </span>
              <span className="block text-[10px] text-slate-500 font-mono">
                ID: {customer.id.substring(0, 14)}...
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTrackingOpen(!isTrackingOpen)}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-white border border-indigo-200 px-2.5 py-1 rounded-lg transition shadow-2xs flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isTrackingOpen ? 'Cancel' : 'Track Order with ID'}</span>
            </button>
            <button
              type="button"
              onClick={handleStartNewSession}
              title="Start a fresh separate customer session"
              className="text-xs font-semibold text-slate-600 hover:text-rose-600 bg-white border border-slate-200 px-2 py-1 rounded-lg transition flex items-center gap-1 shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>New Session</span>
            </button>
          </div>
        </div>

        {/* Optional 2-Factor Order Tracking: Requires BOTH Order Number and Registered Phone */}
        {isTrackingOpen && (
          <div className="bg-indigo-50/70 border-b border-indigo-100 p-4 shrink-0 transition space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>Secure Order Tracking (Order ID + Registered Phone Required):</span>
            </div>
            <p className="text-[11px] text-indigo-800">
              To protect customer addresses, you must enter both the Order Number and the 10-digit mobile number used during checkout.
            </p>

            <form onSubmit={handleVerifyAndTrack} className="space-y-2 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                    Order Number
                  </label>
                  <input
                    type="text"
                    value={trackOrderNumber}
                    onChange={(e) => setTrackOrderNumber(e.target.value)}
                    placeholder="e.g. SM-2026-9182"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-0.5">
                    10-Digit Mobile Number
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={trackPhone}
                    onChange={(e) => setTrackPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {trackError && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-700 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{trackError}</span>
                </div>
              )}

              {trackSuccess && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{trackSuccess}</span>
                </div>
              )}

              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="submit"
                  disabled={!trackOrderNumber.trim() || normalizePhone(trackPhone).length !== 10}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Verify &amp; View Order</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Orders List Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeOrders.length === 0 ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">No Orders in this Session</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Orders placed on this device are strictly private to you. They will appear here right after checkout.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsTrackingOpen(true)}
                  className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Track Past Order with Order ID</span>
                </button>
                {onOpenStore && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenStore();
                    }}
                    className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition flex items-center gap-1.5"
                  >
                    <span>Browse Notebooks</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                <span>My Active Orders: {activeOrders.length}</span>
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Private to your session
                </span>
              </div>

              {activeOrders.map((ord) => {
                const isCod = ord.paymentMethod === 'cod';
                const whatsappUrl = getWhatsAppOrderUrl(ord);

                return (
                  <div
                    key={ord.id}
                    className="border border-slate-200 rounded-2xl p-4 bg-white hover:border-slate-300 transition space-y-3.5 shadow-2xs"
                  >
                    {/* Top Row: Order ID, Date & Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-slate-900">
                          #{ord.orderNumber}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {getStatusBadge(ord.status)}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isCod
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}
                        >
                          {isCod ? '💵 Cash on Delivery' : '✅ Paid Online'}
                        </span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-1.5 text-xs text-slate-700">
                      {ord.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-1">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-slate-100 font-bold text-[11px] text-slate-700 flex items-center justify-center">
                              {item.quantity}
                            </span>
                            <div>
                              <p className="font-semibold text-slate-900">{item.product.name}</p>
                              <p className="text-[10px] text-slate-500">
                                Ruling: {item.selectedRuling} • Size: {item.product.size}
                              </p>
                            </div>
                          </div>
                          <span className="font-bold text-slate-900">
                            ₹{item.product.offerPrice * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Details and Total with Privacy Shield */}
                    <div className="bg-slate-50 rounded-xl p-3.5 text-xs space-y-2 border border-slate-200/80">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-md w-fit">
                        <ShieldCheck className="w-3 h-3 text-emerald-700" />
                        <span>Confidential Delivery Address • Protected</span>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            {ord.deliveryAddress.fullName}
                          </p>
                          <p className="text-slate-600 flex items-center gap-1.5 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" />
                            +91 {ord.deliveryAddress.phone}
                          </p>
                          <p className="text-slate-600 flex items-start gap-1.5 text-[11px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                            <span>
                              {ord.deliveryAddress.houseNo ? `${ord.deliveryAddress.houseNo}, ` : ''}
                              {ord.deliveryAddress.streetArea ? `${ord.deliveryAddress.streetArea}, ` : ''}
                              {ord.deliveryAddress.landmark ? `(Near: ${ord.deliveryAddress.landmark}), ` : ''}
                              {ord.deliveryAddress.city} - {ord.deliveryAddress.pincode}
                            </span>
                          </p>
                        </div>

                        {/* Amount Box */}
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                            Total Payable
                          </p>
                          <p className="text-base font-black text-indigo-700">₹{ord.totalAmount}</p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {isCod ? 'Pay upon delivery' : 'Payment received'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp ShahinMART Support</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handlePrintOrder(ord)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Bill Receipt</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info note */}
        <div className="px-6 py-3 bg-slate-100/80 border-t border-slate-200 text-[11px] text-slate-600 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Strict privacy: Customer addresses and purchases are never shared with others</span>
          </span>
          <span className="font-semibold text-slate-700">ShahinMART Venjaramoodu</span>
        </div>
      </div>
    </div>
  );
};
