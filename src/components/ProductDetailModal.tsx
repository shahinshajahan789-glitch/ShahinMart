import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Truck, RefreshCw, ShoppingCart, Zap, Star, Banknote } from 'lucide-react';
import { Product, RulingType } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, ruling: RulingType) => void;
  onBuyNow: (product: Product, ruling: RulingType) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  if (!product) return null;

  const [selectedRuling, setSelectedRuling] = useState<RulingType>(product.rulings[0] || 'Single Line');
  const [activeColorIdx, setActiveColorIdx] = useState(0);

  const activeVariant = product.colorVariants && product.colorVariants.length > 0
    ? product.colorVariants[activeColorIdx]
    : null;

  const currentImage = activeVariant ? activeVariant.image : product.image;
  const currentQuote = activeVariant?.quote || product.motivationalQuote;

  const discountAmount = product.originalPrice - product.offerPrice;
  const discountPercent = Math.round((discountAmount / product.originalPrice) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        id="product-detail-modal"
        className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 relative my-8"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center shadow-md transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Product Image Panel */}
          <div className="bg-slate-100 relative h-64 md:h-auto min-h-[320px] flex items-center justify-center p-4">
            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
            {product.isOfferHighlight && (
              <span className="absolute top-4 left-4 bg-amber-400 text-slate-950 font-extrabold px-3 py-1 rounded-full text-xs shadow-md flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-slate-950" />
                Featured Offer
              </span>
            )}
            {product.dimensions && (
              <span className="absolute bottom-4 right-4 bg-slate-900/80 text-white font-mono text-xs px-2.5 py-1 rounded-md backdrop-blur-xs shadow">
                {product.dimensions}
              </span>
            )}
          </div>

          {/* Details Panel */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full uppercase">
                  {product.brand}
                </span>
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> In Stock at Venjaramoodu
                </span>
              </div>

              <h2 className="text-xl font-extrabold text-slate-900 mb-1.5 leading-snug">
                {product.name}
              </h2>

              {/* Motivational Quote Banner */}
              {currentQuote && (
                <div className="mb-3 px-3 py-2 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-900 italic font-medium leading-relaxed">
                  "{currentQuote}"
                </div>
              )}

              {/* Origami Activity Feature Banner */}
              {product.activityFeature && (
                <div className="mb-3 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-semibold flex items-center gap-2">
                  <span className="text-base">🦊</span>
                  <span>{product.activityFeature}</span>
                </div>
              )}

              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                {product.description}
              </p>

              {/* Interactive Color Swatches if available */}
              {product.colorVariants && product.colorVariants.length > 0 && (
                <div className="mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Select Cover Edition: <span className="text-indigo-600 font-semibold">{activeVariant?.name}</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {product.colorVariants.map((variant, idx) => (
                      <button
                        key={variant.name}
                        type="button"
                        onClick={() => setActiveColorIdx(idx)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                          activeColorIdx === idx
                            ? 'bg-white border-indigo-600 shadow-xs ring-2 ring-indigo-500/20 text-slate-900'
                            : 'bg-white/60 border-slate-200 hover:bg-white text-slate-600'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: variant.hex }}
                        />
                        <span>{variant.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Details */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 mb-4">
                <div className="flex items-baseline gap-2.5">
                  <span className="text-2xl font-black text-slate-900">₹{product.offerPrice}</span>
                  <span className="text-sm text-slate-400 line-through">₹{product.originalPrice}</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {discountPercent}% OFF (Save ₹{discountAmount})
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Inclusive of all taxes. Free delivery on orders above ₹499 in Kerala.
                </p>
              </div>

              {/* Specifications Table */}
              <div className="space-y-1.5 text-xs text-slate-700 mb-4 bg-slate-50/60 p-3 rounded-xl">
                <div className="flex justify-between border-b border-slate-200/60 pb-1">
                  <span className="text-slate-500">Book Size:</span>
                  <span className="font-semibold text-slate-900">{product.size}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1">
                  <span className="text-slate-500">Page Count:</span>
                  <span className="font-semibold text-slate-900">{product.pages} Pages</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1">
                  <span className="text-slate-500">Set Quantity:</span>
                  <span className="font-semibold text-slate-900">{product.setDetails}</span>
                </div>
                {product.paperGsm && (
                  <div className="flex justify-between border-b border-slate-200/60 pb-1">
                    <span className="text-slate-500">Paper GSM:</span>
                    <span className="font-semibold text-slate-900">{product.paperGsm} GSM Smooth</span>
                  </div>
                )}
                {product.coverType && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cover:</span>
                    <span className="font-semibold text-slate-900">{product.coverType}</span>
                  </div>
                )}
              </div>

              {/* Ruling Option Selector */}
              {product.rulings.length > 0 && (
                <div className="mb-4">
                  <label htmlFor="modal-ruling-select" className="block text-xs font-bold text-slate-800 mb-1.5">
                    Choose Ruling Type:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {product.rulings.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setSelectedRuling(r)}
                        className={`text-xs py-1.5 px-2.5 rounded-lg border font-medium text-left transition ${
                          selectedRuling === r
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ShahinMART Guarantees */}
              <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] text-slate-600 mb-4">
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200/70 flex flex-col items-center gap-1">
                  <Banknote className="w-4 h-4 text-emerald-700" />
                  <span className="font-bold text-emerald-900 leading-tight">Cash on Delivery</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 flex flex-col items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>100% Genuine</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 flex flex-col items-center gap-1">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  <span>Fast Delivery</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 flex flex-col items-center gap-1">
                  <RefreshCw className="w-4 h-4 text-indigo-600" />
                  <span>Easy Exchange</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  onAddToCart(product, selectedRuling);
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 text-slate-600" />
                <span>Add to Cart</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onBuyNow(product, selectedRuling);
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
