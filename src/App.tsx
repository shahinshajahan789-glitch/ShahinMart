import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Sparkles,
  ShieldCheck,
  Truck,
  Phone,
  Package,
  Layers,
  CheckCircle,
  GraduationCap,
  Briefcase,
  QrCode,
  ArrowRight,
  Filter,
  Flame,
  Search,
} from 'lucide-react';
import { Product, CartItem, RulingType, Order, TargetAudience, PaymentMethod, CustomerProfile } from './types';
import { PRODUCTS, MERCHANT_INFO } from './data/products';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { MerchantDashboardModal } from './components/MerchantDashboardModal';
import { BulkEnquiryModal } from './components/BulkEnquiryModal';
import { CustomerOrdersModal } from './components/CustomerOrdersModal';
import { StoreInfoSection } from './components/StoreInfoSection';
import { UpiPaymentCard } from './components/UpiPaymentCard';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { saveOrderToStorage, getStoredAlerts, getStoredOrders } from './utils/notifications';
import {
  getCurrentCustomer,
  saveCurrentCustomer,
  loadCustomerCart,
  saveCustomerCart,
  startNewCustomerSession,
  filterCustomerOrders,
  saveCustomerPrivateOrder,
} from './utils/customer';

export default function App() {
  // Customer Profile & Session Isolation
  const [customer, setCustomer] = useState<CustomerProfile>(() => getCurrentCustomer());
  const [isCustomerOrdersOpen, setIsCustomerOrdersOpen] = useState(false);

  // Cart state with per-customer isolation
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    return loadCustomerCart(customer.id);
  });

  useEffect(() => {
    saveCustomerCart(customer.id, cartItems);
  }, [customer.id, cartItems]);

  // Filtering and Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAudience, setSelectedAudience] = useState<TargetAudience>('all');
  const [selectedRuling, setSelectedRuling] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  // Modals & Drawers State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<PaymentMethod>('cod');
  const [isMerchantModalOpen, setIsMerchantModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [latestConfirmedOrder, setLatestConfirmedOrder] = useState<Order | null>(null);

  // Unread merchant alerts count
  const [unreadAlertsCount, setUnreadAlertsCount] = useState<number>(() => {
    return getStoredAlerts().filter((a) => !a.read).length;
  });

  const refreshAlertCount = () => {
    setUnreadAlertsCount(getStoredAlerts().filter((a) => !a.read).length);
  };

  // Cart operations
  const handleAddToCart = (product: Product, ruling: RulingType) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedRuling === ruling
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        const newItem: CartItem = {
          id: `${product.id}_${ruling}_${Date.now()}`,
          product,
          quantity: 1,
          selectedRuling: ruling,
          selectedSize: product.size,
        };
        return [...prev, newItem];
      }
    });
    setIsCartOpen(true);
  };

  const handleBuyNow = (product: Product, ruling: RulingType) => {
    handleAddToCart(product, ruling);
    setIsCartOpen(false);
    setCheckoutPaymentMethod('cod');
    setIsCheckoutOpen(true);
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Compute number of orders for the currently active customer
  const customerOrderCount = useMemo(() => {
    const all = getStoredOrders();
    return filterCustomerOrders(all, customer).length;
  }, [customer, latestConfirmedOrder, unreadAlertsCount]);

  // Customer session switching and starting fresh
  const handleStartNewCustomer = () => {
    const fresh = startNewCustomerSession();
    setCustomer(fresh);
    setCartItems([]);
    setIsCartOpen(false);
  };

  const handleSelectCustomer = (selected: CustomerProfile) => {
    saveCurrentCustomer(selected);
    setCustomer(selected);
    setCartItems(loadCustomerCart(selected.id));
  };

  // Order placement handler
  const handleOrderPlaced = (order: Order) => {
    saveOrderToStorage(order);
    saveCustomerPrivateOrder(customer.id, order);
    setCartItems([]);
    setIsCheckoutOpen(false);
    setLatestConfirmedOrder(order);

    // Save and link customer credentials so their orders persist strictly to their account
    const updatedCustomer: CustomerProfile = {
      ...customer,
      name: order.deliveryAddress.fullName || customer.name,
      phone: order.deliveryAddress.phone || customer.phone,
    };
    saveCurrentCustomer(updatedCustomer);
    saveCustomerPrivateOrder(updatedCustomer.id, order);
    setCustomer(updatedCustomer);
    refreshAlertCount();
  };

  // Filtered Products list
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesBrand = p.brand.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesTags = p.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesName && !matchesBrand && !matchesDesc && !matchesTags) return false;
      }

      // Audience filter
      if (selectedAudience !== 'all') {
        if (!p.targetAudience.includes(selectedAudience)) return false;
      }

      // Ruling filter
      if (selectedRuling !== 'all') {
        if (!p.rulings.includes(selectedRuling as RulingType)) return false;
      }

      // Brand filter
      if (selectedBrand !== 'all') {
        if (p.brand !== selectedBrand) return false;
      }

      return true;
    });
  }, [searchQuery, selectedAudience, selectedRuling, selectedBrand]);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased">
      {/* PWA In-App Install Prompt Banner for Mobile and Desktop */}
      <PWAInstallBanner />

      {/* Navbar with Customer Orders, Identity & Store Desk */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
        onOpenMerchantModal={() => setIsMerchantModalOpen(true)}
        onOpenCustomerOrders={() => setIsCustomerOrdersOpen(true)}
        customerOrderCount={customerOrderCount}
        customerName={customer.name}
        customerPhone={customer.phone}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        unreadAlertsCount={unreadAlertsCount}
      />

      {/* Hero Section: School Essentials & Best Value Guaranteed */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 text-white pt-10 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Subtle geometric background accents */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            {/* Hero Left Column */}
            <div className="lg:col-span-7 space-y-5">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  📚 School Essentials • Best Value
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/10">
                  <Truck className="w-3.5 h-3.5 text-emerald-400" />
                  Across Venjaramoodu &amp; Kerala
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                Affordable Notebooks for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                  Every Student.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                At <strong className="text-white">ShahinMART</strong>, quality stationery should never break the budget.
                We bring you trusted brands, wide variety, and unbeatable prices — for students, teachers, and offices
                across Kerala. Save up to <span className="text-amber-400 font-extrabold">30%</span> on Papergrid,
                Classmate, and premium local options.
              </p>

              {/* Value Highlights Pill Bar */}
              <div className="pt-1 flex flex-wrap gap-4 text-xs font-semibold text-slate-200">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  Papergrid &amp; Classmate Brands
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  Instant UPI (<code className="text-amber-300 font-mono">8138015908@superyes</code>)
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-amber-400" />
                  Cash on Delivery Available
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <a
                  href="#collection-grid"
                  className="px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-sm shadow-lg hover:shadow-xl transition flex items-center gap-2"
                >
                  <span>Explore Notebook Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(true)}
                  className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition flex items-center gap-2"
                >
                  <Package className="w-4 h-4 text-amber-400" />
                  <span>Wholesale Institutional Quote</span>
                </button>
              </div>
            </div>

            {/* Hero Right Column: Fast Interactive UPI QR Card Teaser */}
            <div className="lg:col-span-5">
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/20 text-slate-900 shadow-2xl space-y-4">
                <div className="flex items-center justify-between text-white border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block">
                      Direct Payment Ready
                    </span>
                    <h3 className="text-base font-extrabold text-white">ShahinMART QR Code</h3>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30">
                    UPI Verified
                  </span>
                </div>

                {/* Mini preview of the merchant's exact QR & PhonePe/YesBank details */}
                <div className="bg-white rounded-2xl p-4 text-center space-y-2 border border-slate-200">
                  <p className="text-xs text-slate-500 font-semibold">Official UPI ID for Direct Booking:</p>
                  <p className="font-mono font-extrabold text-indigo-700 text-sm bg-indigo-50 py-1.5 px-3 rounded-lg inline-block border border-indigo-100">
                    {MERCHANT_INFO.upiId}
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-600">
                    <span>🏦 {MERCHANT_INFO.bankAccountRef} (SBI)</span>
                    <span>•</span>
                    <span className="font-bold text-slate-800">PhonePe / Yes Bank</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Venjaramoodu, Thiruvananthapuram • Reg: {MERCHANT_INFO.regNo}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Need help selecting ruling?</span>
                  <a
                    href={`tel:${MERCHANT_INFO.phone}`}
                    className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Shahin ({MERCHANT_INFO.phone})
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audiences Bento Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Students Card */}
          <div
            onClick={() => setSelectedAudience('students')}
            className={`p-5 rounded-2xl border transition cursor-pointer shadow-sm ${
              selectedAudience === 'students'
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/30'
                : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-md'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">🎒 Students</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              From school to college, find the perfect notebook for every subject, homework, and exam preparation.
            </p>
            <span className="mt-3 inline-block text-[11px] font-bold text-amber-700">
              View Student Notebooks →
            </span>
          </div>

          {/* Teachers Card */}
          <div
            onClick={() => setSelectedAudience('teachers')}
            className={`p-5 rounded-2xl border transition cursor-pointer shadow-sm ${
              selectedAudience === 'teachers'
                ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-400/30'
                : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">👩‍🏫 Teachers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Practical books, record books, mark registers, and bulk stationery supplies for your classroom needs.
            </p>
            <span className="mt-3 inline-block text-[11px] font-bold text-indigo-700">
              View Practical &amp; Record Books →
            </span>
          </div>

          {/* Offices Card */}
          <div
            onClick={() => setSelectedAudience('offices')}
            className={`p-5 rounded-2xl border transition cursor-pointer shadow-sm ${
              selectedAudience === 'offices'
                ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/30'
                : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-1">🏢 Offices</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Professional-grade notebooks and planners at wholesale rates for corporate teams, coaching institutions, and shops.
            </p>
            <span className="mt-3 inline-block text-[11px] font-bold text-emerald-700">
              View Office Supplies →
            </span>
          </div>
        </div>
      </section>

      {/* Main Catalog & Filter Bar */}
      <main id="collection-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full space-y-8">
        {/* Section Title & Highlights */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-amber-100 text-amber-900 uppercase tracking-wider">
                ✨ Premium Collection
              </span>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-emerald-700" />
                Special Offer Pricing Active
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              📚 Our Notebook Collection
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Explore our curated range of notebooks, designed for quality, style, and everyday use. Highlighted offer
              prices are the best value picks for quick shopping!
            </p>
          </div>

          {/* Quick Filters Pill Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedAudience('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedAudience === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Items ({PRODUCTS.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedAudience('students')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedAudience === 'students'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Students
            </button>
            <button
              type="button"
              onClick={() => setSelectedAudience('teachers')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedAudience === 'teachers'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Teachers
            </button>
            <button
              type="button"
              onClick={() => setSelectedAudience('offices')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedAudience === 'offices'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Offices
            </button>
          </div>
        </div>

        {/* Secondary Filter Controls: Ruling & Brand */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Ruling Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500">Ruling:</span>
              <select
                value={selectedRuling}
                onChange={(e) => setSelectedRuling(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Rulings (Single, Double, Grid, Unruled)</option>
                <option value="Single Line">Single Line</option>
                <option value="Double Line">Double Line</option>
                <option value="Four Line">Four Line</option>
                <option value="Unruled">Unruled / Plain</option>
                <option value="Square / Grid">Square / Grid</option>
              </select>
            </div>

            {/* Brand Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500">Brand:</span>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Brands</option>
                <option value="Papergrid">Papergrid</option>
                <option value="Classmate">Classmate</option>
                <option value="Premium Local">Premium Local</option>
                <option value="Budget Friendly">Budget Friendly</option>
              </select>
            </div>

            {/* Fast Brand Pills */}
            <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <button
                type="button"
                onClick={() => setSelectedBrand(selectedBrand === 'Papergrid' ? 'all' : 'Papergrid')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  selectedBrand === 'Papergrid'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <span>Papergrid</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedBrand(selectedBrand === 'Classmate' ? 'all' : 'Classmate')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  selectedBrand === 'Classmate'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
                }`}
              >
                <span>Classmate</span>
              </button>
            </div>
          </div>

          <div className="text-slate-500 text-xs">
            Showing <strong className="text-slate-900">{filteredProducts.length}</strong> items
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-base text-slate-800">No books found matching your filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try resetting your ruling or brand filters, or clear your search keyword.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedAudience('all');
                setSelectedRuling('all');
                setSelectedBrand('all');
              }}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(prod, ruling) => handleAddToCart(prod, ruling)}
                onBuyNow={(prod, ruling) => handleBuyNow(prod, ruling)}
                onQuickView={(prod) => setQuickViewProduct(prod)}
              />
            ))}
          </div>
        )}

        {/* Special Brand Spotlight Section */}
        <section className="pt-8 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-indigo-600 font-extrabold text-xs uppercase tracking-wider">
              ✨ Trusted Brands • Quality First
            </span>
            <h2 className="text-2xl font-black text-slate-900">Genuine Stationery from Trusted Names</h2>
            <p className="text-xs text-slate-500">
              We carry notebooks from the most trusted names in stationery across Kerala, so you never have to compromise on paper or binding quality.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wide">
                📘 Papergrid
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Student Favourite</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Premium paper quality with durable covers and smooth ink absorption — loved by students across Kerala.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xs font-extrabold text-amber-700 uppercase tracking-wide">
                📒 Classmate
              </span>
              <h3 className="font-bold text-slate-900 text-sm">India’s #1 Student Brand</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                ITC Classmate notebooks known for consistent brightness, smooth writing, and safety rounded corners.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wide">
                🛍️ Premium Local Brands
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Handpicked Kerala Editions</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Excellent value without compromising on 70 GSM paper quality, syllabus ruling, or heavy-duty thread binding.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xs font-extrabold text-purple-700 uppercase tracking-wide">
                🎯 Budget-Friendly Packs
              </span>
              <h3 className="font-bold text-slate-900 text-sm">Tuition &amp; Bulk Classes</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Designed for high-volume coaching centres and charity distributions at wholesale volume discounts.
              </p>
            </div>
          </div>
        </section>

        {/* Notebook Range & Rulings Guide Section */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600">
                📐 Sizes Available
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">A Notebook for Every Need</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                From long to A4, single line to grid — we have the right format for every school subject, college lab, and office record keeping.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-semibold text-slate-800">
                  • Long Notebooks (31 x 19.5 cm)
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-semibold text-slate-800">
                  • A4 Notebooks (29.7 x 21 cm)
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-semibold text-slate-800">
                  • Short / Compact (19 x 15.5 cm)
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 font-semibold text-slate-800">
                  • Practical &amp; Record Books
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">
                ✏️ Rulings Available
              </span>
              <h3 className="text-xl font-extrabold text-slate-900">Choose Your Page Ruling</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select your preferred ruling right from the product card or checkout screen.
              </p>

              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold rounded-xl">
                  Single Line
                </span>
                <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold rounded-xl">
                  Double Line
                </span>
                <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold rounded-xl">
                  Four Line
                </span>
                <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold rounded-xl">
                  Unruled / Plain
                </span>
                <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold rounded-xl">
                  Square / Math Grid
                </span>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                Not sure which ruling you need for your child&apos;s grade? Our team at Venjaramoodu is happy to guide you!
                Call <a href={`tel:${MERCHANT_INFO.phone}`} className="font-bold underline">{MERCHANT_INFO.phone}</a>.
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Store Location & Why ShahinMART Section */}
      <StoreInfoSection />

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-8 px-4 sm:px-6 lg:px-8 mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white font-black text-base">ShahinMART</span>
            <span>– Your Trusted Stationery Partner in Venjaramoodu, Kerala</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-slate-500">
            <span>Reg. No: {MERCHANT_INFO.regNo}</span>
            <span>•</span>
            <span>UPI: {MERCHANT_INFO.upiId}</span>
            <span>•</span>
            <span>Phone: +91 8138015908</span>
          </div>
        </div>
      </footer>

      {/* MODALS AND DRAWERS */}

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        customerName={customer.name}
        customerPhone={customer.phone}
        onStartNewCustomer={handleStartNewCustomer}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={(method) => {
          setCheckoutPaymentMethod(method || 'cod');
          setIsCheckoutOpen(true);
        }}
      />

      {/* Amazon-style Checkout Modal with Address & UPI QR */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        customer={customer}
        initialPaymentMethod={checkoutPaymentMethod}
        onOrderPlaced={handleOrderPlaced}
      />

      {/* Customer Personal Orders & Purchases Modal */}
      <CustomerOrdersModal
        isOpen={isCustomerOrdersOpen}
        onClose={() => setIsCustomerOrdersOpen(false)}
        customer={customer}
        onCustomerChange={handleSelectCustomer}
        onStartNewCustomer={handleStartNewCustomer}
      />

      {/* Order Success Celebratory Modal */}
      <OrderSuccessModal
        order={latestConfirmedOrder}
        onClose={() => setLatestConfirmedOrder(null)}
      />

      {/* Product Specification Quick View Modal */}
      <ProductDetailModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Merchant Order Alert Desk */}
      <MerchantDashboardModal
        isOpen={isMerchantModalOpen}
        onClose={() => {
          setIsMerchantModalOpen(false);
          refreshAlertCount();
        }}
        onRefreshOrders={refreshAlertCount}
      />

      {/* Wholesale / Bulk Order Enquiry Modal */}
      <BulkEnquiryModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
      />

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}
