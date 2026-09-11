import React from 'react';
import { ShoppingBag, Phone, MapPin, Bell, BookOpen, Package, Search, User, Lock, Clock } from 'lucide-react';
import { MERCHANT_INFO } from '../data/products';
import { PWAInstallNavButton } from './PWAInstallBanner';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenBulkModal: () => void;
  onOpenMerchantModal: () => void;
  onOpenCustomerOrders: () => void;
  customerOrderCount: number;
  customerName?: string;
  customerPhone?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  unreadAlertsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  onOpenBulkModal,
  onOpenMerchantModal,
  onOpenCustomerOrders,
  customerOrderCount,
  customerName,
  customerPhone,
  searchQuery,
  onSearchChange,
  unreadAlertsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Notification Announcement Bar */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.5 rounded text-[10px] tracking-wider uppercase">
              Kerala Offer
            </span>
            <span className="font-medium text-slate-200">
              Save up to 30% • 💵 Cash on Delivery Available across Kerala!
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-300 text-xs">
            <a
              href={`tel:${MERCHANT_INFO.phone}`}
              className="hover:text-amber-300 transition flex items-center gap-1 font-semibold"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>{MERCHANT_INFO.phone}</span>
            </a>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Venjaramoodu, Trivandrum
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <a href="#" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="leading-tight">
                <span className="text-xl font-black tracking-tight text-slate-900 flex items-center">
                  Shahin<span className="text-amber-600">MART</span>
                </span>
                <span className="text-[10px] block font-semibold text-slate-500 uppercase tracking-widest">
                  Stationery &amp; Books
                </span>
              </div>
            </a>
          </div>

          {/* Search Bar - Amazon Style Clean Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                id="header-search-input"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search Papergrid, Classmate, A4 notebooks, single line..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bulk / Wholesale Orders Button */}
            <button
              id="wholesale-inquiry-btn"
              type="button"
              onClick={onOpenBulkModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-bold transition shadow-xs"
            >
              <Package className="w-3.5 h-3.5 text-amber-700" />
              <span>Bulk Orders</span>
            </button>

            {/* In-App PWA Install Trigger */}
            <PWAInstallNavButton />

            {/* Customer Personal Orders Button */}
            <button
              id="customer-my-orders-btn"
              type="button"
              onClick={onOpenCustomerOrders}
              title="View your personal purchases and orders"
              className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
            >
              <Package className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800 hidden sm:inline">My Orders</span>
              {customerOrderCount > 0 && (
                <span className="bg-emerald-600 text-white rounded-full text-[10px] font-extrabold px-1.5 py-0.2 min-w-[18px] text-center">
                  {customerOrderCount}
                </span>
              )}
            </button>

            {/* Customer Identity Tag */}
            <button
              id="customer-account-btn"
              type="button"
              onClick={onOpenCustomerOrders}
              title={customerPhone ? `Signed in as +91 ${customerPhone}` : 'Customer Account'}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-700 transition cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-bold max-w-[110px] truncate text-slate-900">
                {customerName || (customerPhone ? `+91 ${customerPhone.slice(-4)}` : 'Customer')}
              </span>
            </button>

            {/* Store Admin Portal (PIN Protected) */}
            <button
              id="merchant-alerts-desk-btn"
              type="button"
              onClick={onOpenMerchantModal}
              title="Store Owner Admin Desk (PIN Protected)"
              className="relative p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition flex items-center cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
              )}
            </button>

            {/* Shopping Cart Drawer Trigger */}
            <button
              id="shopping-cart-drawer-btn"
              type="button"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-sm hover:shadow transition"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded-full text-xs font-black min-w-[20px] text-center">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <input
              type="text"
              id="mobile-search-input"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search Papergrid, Classmate, notebooks..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>
    </header>
  );
};
