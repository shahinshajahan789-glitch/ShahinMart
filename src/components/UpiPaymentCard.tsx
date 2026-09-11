import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, ExternalLink, ArrowRight, ShieldCheck, Smartphone, Download } from 'lucide-react';
import { MERCHANT_INFO } from '../data/products';

interface UpiPaymentCardProps {
  amount: number;
  orderNumber?: string;
  onPaymentConfirmed: (transactionId: string) => void;
  isProcessing?: boolean;
}

export const UpiPaymentCard: React.FC<UpiPaymentCardProps> = ({
  amount,
  orderNumber = 'SM' + Math.floor(1000 + Math.random() * 9000),
  onPaymentConfirmed,
  isProcessing = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState('');
  const [qrLoaded, setQrLoaded] = useState(false);

  // Standard NPCI UPI URI Scheme
  const upiUri = `upi://pay?pa=${MERCHANT_INFO.upiId}&pn=${encodeURIComponent(MERCHANT_INFO.name)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Order ' + orderNumber)}`;

  // Direct app intents
  const gpayUri = `tez://upi/pay?pa=${MERCHANT_INFO.upiId}&pn=${encodeURIComponent(MERCHANT_INFO.name)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Order ' + orderNumber)}`;
  const phonepeUri = `phonepe://pay?pa=${MERCHANT_INFO.upiId}&pn=${encodeURIComponent(MERCHANT_INFO.name)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Order ' + orderNumber)}`;
  const paytmUri = `paytmmp://pay?pa=${MERCHANT_INFO.upiId}&pn=${encodeURIComponent(MERCHANT_INFO.name)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Order ' + orderNumber)}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        upiUri,
        {
          width: 240,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
          errorCorrectionLevel: 'H',
        },
        (error) => {
          if (error) console.error('QR code generation error:', error);
          else setQrLoaded(true);
        }
      );
    }
  }, [upiUri]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(MERCHANT_INFO.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `ShahinMART_UPI_QR_₹${amount}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleSubmitUtr = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = utrNumber.trim();
    if (!clean) {
      setUtrError('Please enter the 12-digit UTR or UPI Reference Number from your payment receipt');
      return;
    }
    setUtrError('');
    onPaymentConfirmed(clean);
  };

  return (
    <div id="upi-payment-container" className="space-y-6">
      {/* Exact PhonePe/YesBank QR Styled Card from User's Screenshot */}
      <div
        id="upi-official-card"
        className="max-w-md mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden relative"
      >
        {/* Top Header */}
        <div className="px-6 pt-6 pb-2 text-center">
          <div className="flex items-center justify-between text-slate-400 mb-1 text-xs">
            <span className="font-semibold text-slate-500 tracking-wide uppercase">ShahinMART Payment</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadQR}
                title="Save QR Code"
                className="p-1 hover:text-slate-700 transition"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h2 className="text-2xl font-black text-indigo-700 tracking-tight">My QR code</h2>

          {/* UPI ID Pill with Copy */}
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 text-sm transition">
            <span className="text-slate-600 text-xs sm:text-sm">For UPI ID:</span>
            <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">{MERCHANT_INFO.upiId}</span>
            <button
              type="button"
              id="copy-upi-id-button"
              onClick={handleCopyUpi}
              className="p-1 text-indigo-600 hover:text-indigo-800 transition"
              title="Copy UPI ID"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          {copied && (
            <p className="text-[11px] text-emerald-600 font-medium mt-1">UPI ID copied to clipboard!</p>
          )}
        </div>

        {/* Center QR Code Container with YesBank Diamond Center Emblem */}
        <div className="p-4 flex flex-col items-center justify-center">
          <div className="relative p-3 bg-white rounded-2xl border-2 border-slate-100 shadow-inner flex items-center justify-center">
            <canvas ref={canvasRef} className="rounded-lg max-w-full" />

            {/* Center Logo Emblem representing PhonePe/YesBank diamond */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 shadow-md flex items-center justify-center border-2 border-white">
                <div className="w-4 h-4 bg-white rotate-45 transform"></div>
              </div>
            </div>
          </div>

          {/* Amount Badge */}
          <div className="mt-3 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2">
            <span className="text-xs text-indigo-700 font-medium">Payable Amount:</span>
            <span className="text-base font-extrabold text-indigo-900">₹{amount}</span>
          </div>
        </div>

        {/* Bank Account Info: SBI 9914 Bank account Primary */}
        <div className="px-6 py-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-xs border border-sky-200">
              SBI
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">SBI 9914</p>
              <p className="text-[11px] text-slate-500">Bank account</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
            Primary
          </span>
        </div>

        {/* Bottom Gateway Branding */}
        <div className="px-6 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="font-bold tracking-wider text-slate-700 text-[11px]">UPI</span>
            <span className="text-[9px] text-slate-400">UNIFIED PAYMENTS INTERFACE</span>
          </div>
          <div className="flex items-center gap-1 font-bold text-slate-700 text-[11px]">
            <span className="text-red-500">✓</span> YES BANK
          </div>
        </div>
      </div>

      {/* Direct UPI Apps Quick Launch for Mobile & Fast Desktop */}
      <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-indigo-600" />
          Click to Pay Directly on your UPI App:
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <a
            id="gpay-pay-button"
            href={gpayUri}
            className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow transition text-center group"
          >
            <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">Google Pay</span>
            <span className="text-[10px] text-slate-500">Tap to open</span>
          </a>

          <a
            id="phonepe-pay-button"
            href={phonepeUri}
            className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-purple-400 hover:shadow transition text-center group"
          >
            <span className="text-xs font-bold text-purple-700">PhonePe</span>
            <span className="text-[10px] text-slate-500">Tap to open</span>
          </a>

          <a
            id="paytm-pay-button"
            href={paytmUri}
            className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-sky-400 hover:shadow transition text-center group"
          >
            <span className="text-xs font-bold text-sky-700">Paytm UPI</span>
            <span className="text-[10px] text-slate-500">Tap to open</span>
          </a>

          <a
            id="any-upi-pay-button"
            href={upiUri}
            className="flex flex-col items-center justify-center p-3 bg-indigo-600 text-white rounded-xl shadow-sm hover:bg-indigo-700 transition text-center group"
          >
            <span className="text-xs font-bold flex items-center gap-1">
              Any UPI <ExternalLink className="w-3 h-3" />
            </span>
            <span className="text-[10px] text-indigo-100">BHIM / CRED / etc</span>
          </a>
        </div>
      </div>

      {/* Confirmation Form: Enter UTR / UPI Reference */}
      <form onSubmit={handleSubmitUtr} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="utr-input" className="text-sm font-bold text-slate-800">
            Step 2: Enter UPI Ref / UTR No. after payment:
          </label>
          <span className="text-[11px] text-slate-500">12 digits reference</span>
        </div>

        <div className="relative">
          <input
            id="utr-input"
            type="text"
            value={utrNumber}
            onChange={(e) => {
              setUtrNumber(e.target.value);
              setUtrError('');
            }}
            placeholder="e.g. 423985719302 or last 4 digits"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm font-mono"
          />
        </div>

        {utrError && <p className="text-xs text-rose-600 font-medium">{utrError}</p>}

        <p className="text-xs text-slate-500 leading-relaxed">
          💡 After paying with the QR code or your UPI app, check your payment receipt for the 12-digit UPI Reference /
          UTR Number and enter it here so ShahinMART can instantly verify your order.
        </p>

        <button
          id="confirm-upi-payment-btn"
          type="submit"
          disabled={isProcessing}
          className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? (
            'Verifying & Booking Order...'
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              I Have Paid ₹{amount} — Confirm Order
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
