import React, { useState } from 'react';
import { X, MapPin, CreditCard, QrCode, Banknote, Building, ShieldCheck, CheckCircle2, ChevronRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { CartItem, DeliveryAddress, PaymentMethod, Order, CustomerProfile } from '../types';
import { UpiPaymentCard } from './UpiPaymentCard';
import { MERCHANT_INFO } from '../data/products';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  customer?: CustomerProfile;
  onOrderPlaced: (order: Order) => void;
  initialPaymentMethod?: PaymentMethod;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  customer,
  onOrderPlaced,
  initialPaymentMethod = 'cod',
}) => {
  if (!isOpen || cartItems.length === 0) return null;

  // Checkout Steps: 1: Delivery Address, 2: Payment & Review
  const [currentStep, setCurrentStep] = useState<'address' | 'payment'>('address');

  // Amazon-like Delivery Address State
  const [address, setAddress] = useState<DeliveryAddress>({
    fullName: '',
    phone: '',
    altPhone: '',
    pincode: '695607',
    houseNo: '',
    streetArea: '',
    landmark: '',
    city: 'Venjaramoodu',
    district: 'Thiruvananthapuram',
    state: 'Kerala',
    addressType: 'home',
    deliveryInstructions: '',
  });

  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});

  // Payment Selection - Default to Cash on Delivery (COD)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialPaymentMethod || 'cod');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialPaymentMethod) {
      setPaymentMethod(initialPaymentMethod);
    }
    if (isOpen && customer) {
      setAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || customer.name || '',
        phone: prev.phone || customer.phone || '',
      }));
    }
  }, [initialPaymentMethod, isOpen, customer]);

  // Card details state for card payment option
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardError, setCardError] = useState('');

  // Financial calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.offerPrice * item.quantity, 0);
  const originalTotal = cartItems.reduce((acc, item) => acc + item.product.originalPrice * item.quantity, 0);
  const discountSaved = originalTotal - subtotal;
  const deliveryFee = subtotal >= 499 ? 0 : 40;
  const grandTotal = subtotal + deliveryFee;

  // Quick Kerala autofill helpers
  const handleKeralaPreset = (city: string, pin: string, district: string) => {
    setAddress((prev) => ({
      ...prev,
      city,
      pincode: pin,
      district,
    }));
  };

  const validateAddress = (): boolean => {
    const errs: Record<string, string> = {};
    if (!address.fullName.trim()) errs.fullName = 'Full name is required';
    if (!address.phone.trim() || address.phone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Valid 10-digit mobile number required for delivery coordination';
    }
    if (!address.houseNo.trim()) errs.houseNo = 'House / Flat / Building name is required';
    if (!address.streetArea.trim()) errs.streetArea = 'Street / Area is required';
    if (!address.pincode.trim() || address.pincode.length < 6) {
      errs.pincode = 'Valid 6-digit Kerala PIN code is required';
    }
    if (!address.city.trim()) errs.city = 'City / Town is required';

    setAddressErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAddress()) {
      setCurrentStep('payment');
    }
  };

  const handleQuickCodOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    if (validateAddress()) {
      finalizeOrder('cod', 'cod_pending');
    }
  };

  const finalizeOrder = (method: PaymentMethod, paymentStatus: Order['paymentStatus'], utr?: string) => {
    setIsSubmitting(true);
    const orderNum = 'SM-' + Math.floor(100000 + Math.random() * 900000);

    const newOrder: Order = {
      id: 'ord_' + Date.now(),
      orderNumber: orderNum,
      customerId: customer?.id || ('cust_ph_' + address.phone.replace(/\D/g, '')),
      items: cartItems,
      deliveryAddress: address,
      subtotal,
      discount: discountSaved,
      deliveryFee,
      totalAmount: grandTotal,
      paymentMethod: method,
      paymentStatus,
      upiTransactionId: utr,
      createdAt: new Date().toISOString(),
      status: 'new',
      customerNotes: address.deliveryInstructions,
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onOrderPlaced(newOrder);
    }, 600);
  };

  const handleCodSubmit = () => {
    finalizeOrder('cod', 'cod_pending');
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setCardError('Please enter a valid 16-digit card number');
      return;
    }
    if (!cardExpiry || !cardCvv || !cardHolder) {
      setCardError('Please complete all card details');
      return;
    }
    setCardError('');
    finalizeOrder('card', 'paid', 'CARD_' + cardNumber.slice(-4));
  };

  const handleBankTransferSubmit = () => {
    finalizeOrder('bank_transfer', 'verification_pending', 'NEFT_PENDING');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div
        id="amazon-checkout-modal"
        className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 relative my-6 max-h-[92vh] flex flex-col"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-lg font-black text-slate-900">
              Shahin<span className="text-amber-600">MART</span> Checkout
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className={`font-bold ${currentStep === 'address' ? 'text-indigo-600' : 'text-slate-700'}`}>
                1. Delivery Address
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className={`font-bold ${currentStep === 'payment' ? 'text-indigo-600' : 'text-slate-400'}`}>
                2. Payment &amp; Review
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split into main flow & summary sidebar */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid lg:grid-cols-12 gap-6">
          {/* Main Flow (Steps) */}
          <div className="lg:col-span-8 space-y-6">
            {/* STEP 1: Amazon-style Delivery Address Form */}
            {currentStep === 'address' ? (
              <form onSubmit={handleProceedToPayment} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    Enter Delivery Address in Kerala
                  </h3>
                  <span className="text-xs text-slate-500">* All fields required</span>
                </div>

                {/* Quick Presets for Kerala locations */}
                <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-xs">
                  <span className="font-bold text-indigo-900 block mb-1.5">
                    📍 Quick Select Local Kerala Hubs:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleKeralaPreset('Venjaramoodu', '695607', 'Thiruvananthapuram')}
                      className="px-2.5 py-1 bg-white border border-indigo-200 rounded-lg text-indigo-800 font-semibold hover:bg-indigo-100 text-xs transition"
                    >
                      Venjaramoodu (695607)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleKeralaPreset('Attingal', '695101', 'Thiruvananthapuram')}
                      className="px-2.5 py-1 bg-white border border-indigo-200 rounded-lg text-indigo-800 font-semibold hover:bg-indigo-100 text-xs transition"
                    >
                      Attingal (695101)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleKeralaPreset('Trivandrum City', '695001', 'Thiruvananthapuram')}
                      className="px-2.5 py-1 bg-white border border-indigo-200 rounded-lg text-indigo-800 font-semibold hover:bg-indigo-100 text-xs transition"
                    >
                      Trivandrum City (695001)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleKeralaPreset('Kollam', '691001', 'Kollam')}
                      className="px-2.5 py-1 bg-white border border-indigo-200 rounded-lg text-indigo-800 font-semibold hover:bg-indigo-100 text-xs transition"
                    >
                      Kollam (691001)
                    </button>
                  </div>
                </div>

                {/* Full Name & Phone */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="addr-fullname" className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name (Recipient)
                    </label>
                    <input
                      id="addr-fullname"
                      type="text"
                      value={address.fullName}
                      onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                      placeholder="e.g. Rahul Nair / Principal, St. Joseph"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    {addressErrors.fullName && (
                      <p className="text-xs text-rose-600 mt-1">{addressErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="addr-phone" className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number (for Delivery Updates)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-500">+91</span>
                      <input
                        id="addr-phone"
                        type="tel"
                        maxLength={10}
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value.replace(/\D/g, '') })}
                        placeholder="9876543210"
                        className="w-full pl-12 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    {addressErrors.phone && (
                      <p className="text-xs text-rose-600 mt-1">{addressErrors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Flat, House No, Building */}
                <div>
                  <label htmlFor="addr-house" className="block text-xs font-bold text-slate-700 mb-1">
                    Flat, House no., Building, Company, Apartment
                  </label>
                  <input
                    id="addr-house"
                    type="text"
                    value={address.houseNo}
                    onChange={(e) => setAddress({ ...address, houseNo: e.target.value })}
                    placeholder="e.g. House No. 24, Grace Villa / Room 102"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  {addressErrors.houseNo && (
                    <p className="text-xs text-rose-600 mt-1">{addressErrors.houseNo}</p>
                  )}
                </div>

                {/* Area, Street, Sector */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="addr-street" className="block text-xs font-bold text-slate-700 mb-1">
                      Area, Street, Sector, Village
                    </label>
                    <input
                      id="addr-street"
                      type="text"
                      value={address.streetArea}
                      onChange={(e) => setAddress({ ...address, streetArea: e.target.value })}
                      placeholder="e.g. Pooram, Attingal Road, Near High School"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    {addressErrors.streetArea && (
                      <p className="text-xs text-rose-600 mt-1">{addressErrors.streetArea}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="addr-landmark" className="block text-xs font-bold text-slate-700 mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      id="addr-landmark"
                      type="text"
                      value={address.landmark || ''}
                      onChange={(e) => setAddress({ ...address, landmark: e.target.value })}
                      placeholder="e.g. Near Venjaramoodu Police Station"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Town/City, District, Pincode */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="addr-city" className="block text-xs font-bold text-slate-700 mb-1">
                      Town / City
                    </label>
                    <input
                      id="addr-city"
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    {addressErrors.city && (
                      <p className="text-xs text-rose-600 mt-1">{addressErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="addr-district" className="block text-xs font-bold text-slate-700 mb-1">
                      District
                    </label>
                    <input
                      id="addr-district"
                      type="text"
                      value={address.district}
                      onChange={(e) => setAddress({ ...address, district: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="addr-pincode" className="block text-xs font-bold text-slate-700 mb-1">
                      6-Digit PIN
                    </label>
                    <input
                      id="addr-pincode"
                      type="text"
                      maxLength={6}
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    {addressErrors.pincode && (
                      <p className="text-xs text-rose-600 mt-1">{addressErrors.pincode}</p>
                    )}
                  </div>
                </div>

                {/* Address Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Address Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="addr-type"
                        checked={address.addressType === 'home'}
                        onChange={() => setAddress({ ...address, addressType: 'home' })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Home (7 AM - 9 PM delivery)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="addr-type"
                        checked={address.addressType === 'school'}
                        onChange={() => setAddress({ ...address, addressType: 'school' })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>School / Tuition Centre</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="addr-type"
                        checked={address.addressType === 'work'}
                        onChange={() => setAddress({ ...address, addressType: 'work' })}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Office / Commercial</span>
                    </label>
                  </div>
                </div>

                {/* Delivery Instructions */}
                <div>
                  <label htmlFor="addr-notes" className="block text-xs font-bold text-slate-700 mb-1">
                    Delivery Instructions / Notes (Optional)
                  </label>
                  <input
                    id="addr-notes"
                    type="text"
                    value={address.deliveryInstructions || ''}
                    onChange={(e) => setAddress({ ...address, deliveryInstructions: e.target.value })}
                    placeholder="e.g. Call before arriving / Leave with security guard"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Submit Address Buttons: Direct 1-Click COD or Continue to Online Payment */}
                <div className="pt-3 space-y-2.5">
                  <button
                    id="quick-cod-order-btn"
                    type="button"
                    onClick={handleQuickCodOrder}
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Banknote className="w-5 h-5 text-emerald-200" />
                    <span>💵 1-Click Order with Cash on Delivery (₹{grandTotal})</span>
                  </button>

                  <button
                    id="proceed-to-payment-button"
                    type="submit"
                    className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Or Pay Online (Instant UPI QR, Cards, Netbanking)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Address & Customer Privacy Guarantee */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-slate-600 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    <strong className="text-slate-800">Strict Address Privacy:</strong> Your delivery address and order details are strictly private to you. No other customers can view your address or items. Only you and ShahinMART Store Management can see this for shipping.
                  </p>
                </div>
              </form>
            ) : (
              /* STEP 2: Payment Selection */
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentStep('address')}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center gap-1 text-xs font-bold"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Address
                    </button>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">Delivering to:</span>
                    <span className="text-xs font-bold text-slate-900 block truncate max-w-[200px]">
                      {address.fullName} ({address.city})
                    </span>
                  </div>
                </div>

                {/* Payment Methods Tabs */}
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 mb-3">
                    Select Payment Method:
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                        paymentMethod === 'cod'
                          ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-emerald-200'
                      }`}
                    >
                      <Banknote className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">Cash on Delivery</span>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/90 px-1.5 py-0.5 rounded">
                        Pay at Doorstep
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi_qr')}
                      className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                        paymentMethod === 'upi_qr'
                          ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-indigo-200'
                      }`}
                    >
                      <QrCode className="w-5 h-5 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-900">UPI / QR Code</span>
                      <span className="text-[10px] text-indigo-600 font-semibold">Instant &amp; Fast</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                        paymentMethod === 'card'
                          ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-indigo-200'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-sky-600" />
                      <span className="text-xs font-bold text-slate-900">Cards / Netbanking</span>
                      <span className="text-[10px] text-slate-500">Visa / Master / RuPay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                        paymentMethod === 'bank_transfer'
                          ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-indigo-200'
                      }`}
                    >
                      <Building className="w-5 h-5 text-purple-600" />
                      <span className="text-xs font-bold text-slate-900">Bank Transfer</span>
                      <span className="text-[10px] text-slate-500">Bulk &amp; Institutional</span>
                    </button>
                  </div>

                  {/* Payment Tab View 1: UPI & QR CODE */}
                  {paymentMethod === 'upi_qr' && (
                    <UpiPaymentCard
                      amount={grandTotal}
                      onPaymentConfirmed={(utr) => finalizeOrder('upi_qr', 'paid', utr)}
                      isProcessing={isSubmitting}
                    />
                  )}

                  {/* Payment Tab View 2: CASH ON DELIVERY */}
                  {paymentMethod === 'cod' && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-900">
                          <p className="font-bold">Cash on Delivery Alert Enabled</p>
                          <p className="mt-0.5">
                            Our Venjaramoodu dispatch team will receive an instant alert to prepare your order. Please keep
                            exact cash <span className="font-extrabold">₹{grandTotal}</span> ready at the time of delivery.
                          </p>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl">
                        <p>✓ Order will be verified via phone call to <strong>+91 {address.phone}</strong></p>
                        <p>✓ Fast delivery across Thiruvananthapuram &amp; neighboring areas</p>
                      </div>

                      <button
                        id="confirm-cod-order-btn"
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleCodSubmit}
                        className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl font-black text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Cash on Delivery Order (₹{grandTotal})</span>
                      </button>
                    </div>
                  )}

                  {/* Payment Tab View 3: CREDIT / DEBIT CARDS */}
                  {paymentMethod === 'card' && (
                    <form onSubmit={handleCardSubmit} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-800">Card Payment Gateway</span>
                        <span className="text-[11px] text-slate-400">256-Bit SSL Encrypted</span>
                      </div>

                      {cardError && <p className="text-xs text-rose-600 font-medium">{cardError}</p>}

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Card Number</label>
                        <input
                          type="text"
                          maxLength={19}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          placeholder="4111 2222 3333 4444"
                          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="12/28"
                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">CVV</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="•••"
                            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Name on Card</label>
                        <input
                          type="text"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value)}
                          placeholder="e.g. Rahul Nair"
                          className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-3 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Pay ₹{grandTotal} Securely</span>
                      </button>
                    </form>
                  )}

                  {/* Payment Tab View 4: BANK TRANSFER */}
                  {paymentMethod === 'bank_transfer' && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-950 space-y-1.5">
                        <p className="font-bold text-sm">ShahinMART Institutional Bank Account</p>
                        <p><strong>Bank:</strong> {MERCHANT_INFO.bankName} (Venjaramoodu Branch)</p>
                        <p><strong>Account Ref:</strong> {MERCHANT_INFO.bankAccountRef}</p>
                        <p><strong>UPI Reference:</strong> {MERCHANT_INFO.upiId}</p>
                        <p><strong>Business Reg:</strong> {MERCHANT_INFO.regNo}</p>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        Direct bank transfer is recommended for bulk school, college, and office orders. After initiating NEFT/IMPS/RTGS, click below to log your order and send transaction confirmation.
                      </p>

                      <button
                        type="button"
                        onClick={handleBankTransferSubmit}
                        disabled={isSubmitting}
                        className="w-full py-3 px-4 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Confirm Bank Transfer Order (₹{grandTotal})</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Summary Sidebar */}
          <div className="lg:col-span-4 bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200 h-fit space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-2">
              Order Items ({cartItems.length})
            </h4>

            {/* Item thumbnail previews */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-xs">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{item.product.name}</p>
                    <p className="text-[11px] text-slate-500">
                      Qty: {item.quantity} • {item.selectedRuling}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    ₹{item.product.offerPrice * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-slate-900">₹{subtotal}</span>
              </div>

              {discountSaved > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Offer Savings:</span>
                  <span>-₹{discountSaved}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery in Kerala:</span>
                <span className="font-semibold text-emerald-700">
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
                <span>Total Payable:</span>
                <span className="text-indigo-700">₹{grandTotal}</span>
              </div>
            </div>

            {/* Safety & Store Assurance */}
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>ShahinMART Quality Promise</span>
              </div>
              <p>Venjaramoodu, Thiruvananthapuram • Reg: {MERCHANT_INFO.regNo}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
