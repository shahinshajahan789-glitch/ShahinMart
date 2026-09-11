import React from 'react';
import { MapPin, Phone, ShieldCheck, Truck, Headphones, BadgePercent, QrCode, CreditCard, Banknote } from 'lucide-react';
import { MERCHANT_INFO } from '../data/products';

export const StoreInfoSection: React.FC = () => {
  return (
    <section className="bg-slate-900 text-white py-14 px-4 sm:px-6 lg:px-8 mt-16 rounded-3xl mx-2 sm:mx-6 border border-slate-800">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Why ShahinMART Feature Grid */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-amber-400 font-extrabold text-xs uppercase tracking-widest block mb-1">
              Why ShahinMART
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Trusted Value. Genuine Stationery. Better Pricing.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-black">
                <BadgePercent className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Affordable Prices 💛</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Competitive pricing on every notebook, with special bulk rates for schools, colleges, tuition centres, and offices.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-400 flex items-center justify-center font-black">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Genuine Quality ⭐</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Only authentic, trusted brands like Papergrid and Classmate — no counterfeit or bleed-through cheap paper.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-400/20 text-indigo-400 flex items-center justify-center font-black">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Bulk Orders Welcome 📦</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Supplying institutions across Thiruvananthapuram and Kerala with prompt doorstep delivery.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-rose-400/20 text-rose-400 flex items-center justify-center font-black">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-white">Friendly Support ☎️</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our Venjaramoodu team is just a call or WhatsApp away to assist with ruling selections, orders, and inquiries.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Simple Steps & Store Location Card */}
        <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-slate-800">
          {/* Order in 3 Simple Steps */}
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
              Quick Order Process
            </span>
            <h3 className="text-xl font-extrabold text-white">Order in 3 Simple Steps</h3>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div>
                  <strong className="text-white block">1. Browse</strong>
                  <span>Explore notebook options, Papergrid sets, or school bundles that fit your need.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div>
                  <strong className="text-white block">2. Choose &amp; Customise</strong>
                  <span>Select ruling format (Single line, Double line, Grid, Unruled) and quantity.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div>
                  <strong className="text-white block">3. Pay &amp; Relax</strong>
                  <span>Pay via instant QR / UPI (<code className="text-amber-300">{MERCHANT_INFO.upiId}</code>) or Cash on Delivery.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Store Location & Official Contact */}
          <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                Store Details &amp; Registration
              </span>
              <h3 className="text-xl font-extrabold text-white mt-1">ShahinMART Venjaramoodu</h3>
              <div className="mt-3 space-y-2 text-xs text-slate-300">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>
                    Pooram, Attingal Road, Venjaramoodu, Thiruvananthapuram, Kerala – 695607
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Phone: <a href={`tel:${MERCHANT_INFO.phone}`} className="text-white font-bold hover:underline">{MERCHANT_INFO.phone}</a></span>
                </p>
                <p className="text-slate-400">
                  <strong className="text-slate-300">GST / Reg. No:</strong> {MERCHANT_INFO.regNo}
                </p>
                <p className="text-slate-400">
                  <strong className="text-slate-300">Primary Bank:</strong> {MERCHANT_INFO.bankAccountRef} ({MERCHANT_INFO.bankName})
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-700/80 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Supported Payments:</span>
              <span className="inline-flex items-center gap-1 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                <QrCode className="w-3.5 h-3.5 text-indigo-400" /> QR Code &amp; UPI
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                <Banknote className="w-3.5 h-3.5 text-amber-400" /> Cash on Delivery
              </span>
              <span className="inline-flex items-center gap-1 bg-slate-800 px-2 py-1 rounded border border-slate-700">
                <CreditCard className="w-3.5 h-3.5 text-sky-400" /> Cards &amp; Netbanking
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
