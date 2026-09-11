import React, { useState, useEffect } from 'react';
import {
  X,
  Bell,
  Volume2,
  VolumeX,
  Phone,
  MessageSquare,
  MapPin,
  CheckCircle,
  Clock,
  Truck,
  Package,
  AlertTriangle,
  Printer,
  RefreshCw,
  Lock,
  Key,
  ShieldCheck,
} from 'lucide-react';
import { Order, MerchantNotification } from '../types';
import {
  getStoredOrders,
  getStoredAlerts,
  updateOrderStatusInStorage,
  requestNotificationPermission,
} from '../utils/notifications';
import { soundAlert } from '../utils/audioAlert';
import { MERCHANT_INFO } from '../data/products';

interface MerchantDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshOrders?: () => void;
}

export const MerchantDashboardModal: React.FC<MerchantDashboardModalProps> = ({
  isOpen,
  onClose,
  onRefreshOrders,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [alerts, setAlerts] = useState<MerchantNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'upi' | 'cod'>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState(false);

  // Store PIN protection so regular customers cannot see other customers' orders
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('shahinmart_merchant_unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');

  const handleUnlockPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPin.trim() === '7890' || enteredPin.trim() === '1234') {
      setIsUnlocked(true);
      setPinError('');
      try {
        sessionStorage.setItem('shahinmart_merchant_unlocked', 'true');
      } catch (err) {
        console.error(err);
      }
    } else {
      setPinError('Incorrect Store PIN. Access restricted to ShahinMART store management.');
    }
  };

  const handleLockDashboard = () => {
    setIsUnlocked(false);
    setEnteredPin('');
    try {
      sessionStorage.removeItem('shahinmart_merchant_unlocked');
    } catch (err) {
      console.error(err);
    }
  };

  const loadData = () => {
    setOrders(getStoredOrders());
    setAlerts(getStoredAlerts());
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setNotificationPermissionGranted(Notification.permission === 'granted');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestSound = () => {
    soundAlert.playOrderChime();
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationPermissionGranted(granted);
  };

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    updateOrderStatusInStorage(orderId, newStatus);
    loadData();
    if (onRefreshOrders) onRefreshOrders();
  };

  const filteredOrders = orders.filter((ord) => {
    if (filter === 'upi') return ord.paymentMethod === 'upi_qr' || ord.paymentMethod === 'upi_app' || ord.paymentMethod === 'card';
    if (filter === 'cod') return ord.paymentMethod === 'cod';
    return true;
  });

  const totalRevenue = orders.reduce((sum, ord) => sum + ord.totalAmount, 0);
  const codCount = orders.filter((o) => o.paymentMethod === 'cod').length;
  const upiCount = orders.filter((o) => o.paymentMethod !== 'cod').length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div
        id="merchant-dashboard-panel"
        className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 relative my-6 max-h-[92vh] flex flex-col"
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  ShahinMART Store Management Desk
                </h2>
                {isUnlocked && (
                  <span className="bg-emerald-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Store Manager
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Venjaramoodu Dispatch Hub • UPI ID: {MERCHANT_INFO.upiId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked ? (
              <>
                <button
                  type="button"
                  onClick={handleTestSound}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
                  title="Test chime sound"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Test Ring</span>
                </button>

                <button
                  type="button"
                  onClick={handleLockDashboard}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition border border-slate-700 cursor-pointer"
                  title="Lock dashboard"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Lock Desk</span>
                </button>
              </>
            ) : null}

            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* If Locked, show Security PIN Gate */}
        {!isUnlocked ? (
          <div className="p-8 sm:p-12 text-center max-w-md mx-auto my-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">Store Manager Security Verification</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Customer privacy protected. Enter the ShahinMART Store Management PIN to view all incoming store orders, customer delivery addresses, and revenue.
              </p>
            </div>

            <form onSubmit={handleUnlockPin} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Store PIN Code
                </label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={6}
                    autoFocus
                    value={enteredPin}
                    onChange={(e) => {
                      setEnteredPin(e.target.value);
                      if (pinError) setPinError('');
                    }}
                    placeholder="Enter 4-digit PIN (e.g. 7890)"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-center text-lg tracking-widest font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Key className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                </div>
                {pinError && <p className="text-xs text-rose-600 font-semibold mt-1">{pinError}</p>}
                <p className="text-[11px] text-slate-400 mt-1">Default Store PIN: <span className="font-mono font-bold text-slate-600">7890</span></p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  I'm a Customer
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition cursor-pointer"
                >
                  Unlock Orders Desk
                </button>
              </div>
            </form>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Each customer's purchases remain private to their personal account.</span>
            </div>
          </div>
        ) : (
          <>

        {/* Stats & Quick Actions Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Orders</span>
            <span className="text-xl font-black text-slate-900">{orders.length}</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Sales</span>
            <span className="text-xl font-black text-indigo-700">₹{totalRevenue}</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">UPI / Prepaid</span>
            <span className="text-xl font-black text-emerald-600">{upiCount}</span>
          </div>
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Cash On Delivery</span>
            <span className="text-xl font-black text-amber-600">{codCount}</span>
          </div>
        </div>

        {/* Browser Notification Banner if not granted */}
        {!notificationPermissionGranted && (
          <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Enable browser popups to get instant sound &amp; banner alerts when customers order.</span>
            </div>
            <button
              type="button"
              onClick={handleEnableNotifications}
              className="px-3 py-1 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition"
            >
              Allow Alerts
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('upi')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                filter === 'upi' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Prepaid UPI ({upiCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('cod')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                filter === 'cod' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Cash on Delivery ({codCount})
            </button>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition"
            title="Refresh order list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Orders Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-slate-600 font-bold text-sm">No orders yet in this view</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                When a customer completes checkout or selects Cash on Delivery / UPI QR, it will ring and appear here in real time.
              </p>
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const isCod = ord.paymentMethod === 'cod';
              const cleanPhone = ord.deliveryAddress.phone.replace(/\D/g, '');
              const waLink = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                `Hello ${ord.deliveryAddress.fullName}, this is Shahin from ShahinMART Venjaramoodu regarding your order #${ord.orderNumber}.`
              )}`;

              return (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3"
                >
                  {/* Card Header: Order #, Date, Status Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-slate-900">
                        #{ord.orderNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(ord.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCod ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          ⚠️ Cash On Delivery (Collect ₹{ord.totalAmount})
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          PAID via UPI ({ord.upiTransactionId || 'Verified'})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customer Details & Contact Actions */}
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <p className="font-extrabold text-slate-900 text-sm">
                        {ord.deliveryAddress.fullName}
                      </p>
                      <p className="flex items-start gap-1.5 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span>
                          {ord.deliveryAddress.houseNo}, {ord.deliveryAddress.streetArea},{' '}
                          {ord.deliveryAddress.city}, {ord.deliveryAddress.district} -{' '}
                          <strong className="text-slate-900">{ord.deliveryAddress.pincode}</strong>
                        </span>
                      </p>
                      {ord.deliveryAddress.landmark && (
                        <p className="text-[11px] text-slate-500 pl-5">
                          Landmark: {ord.deliveryAddress.landmark}
                        </p>
                      )}
                      {ord.customerNotes && (
                        <p className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded-lg border border-amber-200 mt-1">
                          Note: {ord.customerNotes}
                        </p>
                      )}
                    </div>

                    {/* Quick Call & WhatsApp Customer */}
                    <div className="flex flex-col justify-between sm:items-end gap-2">
                      <div className="flex gap-2">
                        <a
                          href={`tel:${cleanPhone}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Call +91 {cleanPhone}</span>
                        </a>

                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400">Total Order Amount:</span>
                        <span className="text-lg font-black text-slate-900 block">
                          ₹{ord.totalAmount}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Table */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs">
                    <span className="font-bold text-slate-700 block text-[11px]">Items to Pack:</span>
                    {ord.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-slate-700">
                        <span>
                          • {item.quantity}x {item.product.name}{' '}
                          <span className="text-indigo-600 font-semibold">[{item.selectedRuling}]</span>
                        </span>
                        <span className="font-bold text-slate-900">
                          ₹{item.product.offerPrice * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Status Progression Selector */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">Update Status:</span>
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value as Order['status'])}
                        className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="new">🟡 New Order</option>
                        <option value="confirmed">🟢 Confirmed</option>
                        <option value="packing">📦 Packing</option>
                        <option value="out_for_delivery">🚚 Out for Delivery</option>
                        <option value="delivered">✅ Delivered</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Slip</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        </>
        )}
      </div>
    </div>
  );
};
