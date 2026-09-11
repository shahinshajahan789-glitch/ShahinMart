import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, MessageSquare, Printer, MapPin, Phone, PackageCheck, AlertCircle } from 'lucide-react';
import { Order } from '../types';
import { getWhatsAppOrderUrl, generateWhatsAppOrderMessage } from '../utils/notifications';
import { MERCHANT_INFO } from '../data/products';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  useEffect(() => {
    if (order) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [order]);

  if (!order) return null;

  const whatsappUrl = getWhatsAppOrderUrl(order);
  const isCod = order.paymentMethod === 'cod';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div
        id="order-success-card"
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 relative my-6 text-slate-900"
      >
        {/* Top Celebration Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-xs">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Order Confirmed!</h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            Thank you for ordering with ShahinMART. Your stationery is being processed.
          </p>
          <div className="mt-3 inline-block bg-white/20 px-3 py-1 rounded-full text-xs font-mono font-bold">
            Order #{order.orderNumber}
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Automatic Merchant Alert Notification Status */}
          <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
            isCod ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
          }`}>
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-indigo-600" />
            <div className="space-y-1">
              <p className="font-bold">
                {isCod
                  ? 'Cash on Delivery Alert Sent to ShahinMART!'
                  : 'UPI Payment Recorded & ShahinMART Alerted!'}
              </p>
              <p className="text-[11px] leading-relaxed">
                The merchant desk at Venjaramoodu has been notified with your delivery address and order details.
                For instantaneous dispatch updates, you can also send a direct WhatsApp copy to Shahin:
              </p>
            </div>
          </div>

          {/* Direct 1-Click WhatsApp Notification Trigger */}
          <a
            id="whatsapp-dispatch-btn"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 text-center group"
          >
            <MessageSquare className="w-5 h-5 fill-white" />
            <span>Open WhatsApp with Order Summary (+91 {MERCHANT_INFO.phoneRaw})</span>
          </a>

          {/* Delivery & Items Summary */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-700">Delivery Information</span>
              <span className="text-slate-500 font-mono text-[11px]">
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="space-y-1 text-slate-700">
              <p className="font-bold text-slate-900 text-sm">{order.deliveryAddress.fullName}</p>
              <p className="flex items-center gap-1.5 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                +91 {order.deliveryAddress.phone}
              </p>
              <p className="flex items-start gap-1.5 text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  {order.deliveryAddress.houseNo}, {order.deliveryAddress.streetArea}, {order.deliveryAddress.city},{' '}
                  {order.deliveryAddress.district} - {order.deliveryAddress.pincode}
                </span>
              </p>
            </div>

            {/* Items */}
            <div className="pt-2 border-t border-slate-200 space-y-1.5">
              <p className="font-bold text-slate-700">Items Ordered:</p>
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-slate-600">
                  <span>
                    {item.quantity}x {item.product.name} ({item.selectedRuling})
                  </span>
                  <span className="font-bold text-slate-900">
                    ₹{item.product.offerPrice * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Price row */}
            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-bold">
              <span className="text-slate-900">Total Amount:</span>
              <span className="text-base text-indigo-700 font-black">
                ₹{order.totalAmount}{' '}
                <span className="text-xs font-semibold text-slate-500">
                  ({isCod ? 'Pay on Delivery' : 'Paid'})
                </span>
              </span>
            </div>
          </div>

          {/* Action Buttons: Print Receipt & Continue */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Back to Store</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
