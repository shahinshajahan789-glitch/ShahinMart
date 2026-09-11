import React, { useState } from 'react';
import { ShoppingCart, Zap, CheckCircle2, Star, Banknote } from 'lucide-react';
import { Product, RulingType } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, ruling: RulingType) => void;
  onBuyNow: (product: Product, ruling: RulingType) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onBuyNow,
  onQuickView,
}) => {
  const [selectedRuling, setSelectedRuling] = useState<RulingType>(product.rulings[0] || 'Single Line');
  const [activeColorIdx, setActiveColorIdx] = useState(0);

  const activeVariant = product.colorVariants && product.colorVariants.length > 0
    ? product.colorVariants[activeColorIdx]
    : null;

  const currentImage = activeVariant ? activeVariant.image : product.image;
  const currentQuote = activeVariant?.quote || product.motivationalQuote;

  const discountPercent = Math.round(((product.originalPrice - product.offerPrice) / product.originalPrice) * 100);

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden relative"
    >
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {product.isOfferHighlight && (
          <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold shadow-sm tracking-wide">
            <Star className="w-3 h-3 fill-slate-950" />
            Top Deal Pick
          </span>
        )}
        {discountPercent > 0 && (
          <span className="inline-flex items-center bg-rose-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-xs">
            {discountPercent}% OFF
          </span>
        )}
      </div>

      {/* Product Image */}
      <div
        onClick={() => onQuickView(product)}
        className="relative h-52 sm:h-56 overflow-hidden bg-slate-100 cursor-pointer flex items-center justify-center p-2"
      >
        <img
          src={currentImage}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        
        {/* Subtle Dimension Tag if available (e.g. 29.7 cm x 21 cm) */}
        {product.dimensions && (
          <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md shadow-xs">
            {product.dimensions}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <span className="text-white text-xs font-semibold bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-xs">
            Click for full details &amp; sample pages
          </span>
        </div>
      </div>

      {/* Interactive Color Swatches if available */}
      {product.colorVariants && product.colorVariants.length > 0 && (
        <div className="px-4 pt-3 pb-1 flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/50">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Colors: <span className="text-slate-800 font-semibold">{activeVariant?.name}</span>
          </span>
          <div className="flex items-center gap-1.5">
            {product.colorVariants.map((variant, idx) => (
              <button
                key={variant.name}
                type="button"
                onClick={() => setActiveColorIdx(idx)}
                title={`${variant.name} - ${variant.quote || ''}`}
                style={{ backgroundColor: variant.hex }}
                className={`w-5 h-5 rounded-full border-2 transition-transform ${
                  activeColorIdx === idx
                    ? 'scale-125 border-slate-900 ring-2 ring-indigo-500 ring-offset-1'
                    : 'border-white hover:scale-110 shadow-xs'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Stock Pill */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              {product.brand}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80">
                <Banknote className="w-3 h-3 text-emerald-600" />
                COD Available
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Available
              </span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="text-base font-bold text-slate-900 line-clamp-2 hover:text-indigo-600 transition cursor-pointer mb-1.5"
          >
            {product.name}
          </h3>

          {/* Motivational Quote or Activity Feature Banner */}
          {currentQuote && (
            <div className="mb-2 px-2.5 py-1.5 bg-amber-50/80 border border-amber-200/70 rounded-xl text-[11px] text-amber-900 italic font-medium leading-tight">
              "{currentQuote}"
            </div>
          )}

          {product.activityFeature && (
            <div className="mb-2 px-2.5 py-1.5 bg-blue-50/90 border border-blue-200 rounded-xl text-[11px] text-blue-900 font-semibold flex items-center gap-1.5">
              <span>✂️</span>
              <span>{product.activityFeature}</span>
            </div>
          )}

          {/* Specifications Box: Size & Pages */}
          <div className="grid grid-cols-2 gap-1.5 p-2 bg-slate-50 rounded-xl text-xs text-slate-600 mb-3 border border-slate-100">
            <div>
              <span className="text-[10px] block uppercase text-slate-400 font-semibold">Size</span>
              <span className="font-semibold text-slate-800 text-[11px] truncate block">{product.size}</span>
            </div>
            <div>
              <span className="text-[10px] block uppercase text-slate-400 font-semibold">Pages / Set</span>
              <span className="font-semibold text-slate-800 text-[11px] block">{product.pages} pgs • {product.setDetails}</span>
            </div>
          </div>

          {/* Ruling Option Selector */}
          {product.rulings.length > 0 && (
            <div className="mb-3">
              <label htmlFor={`ruling-select-${product.id}`} className="block text-[11px] font-semibold text-slate-500 mb-1">
                Select Ruling:
              </label>
              <select
                id={`ruling-select-${product.id}`}
                value={selectedRuling}
                onChange={(e) => setSelectedRuling(e.target.value as RulingType)}
                className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {product.rulings.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Pricing & Action Buttons */}
        <div className="pt-2 border-t border-slate-100">
          {/* Price Block */}
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900">₹{product.offerPrice}</span>
              <span className="text-xs text-slate-400 line-through">₹{product.originalPrice}</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              Save ₹{product.originalPrice - product.offerPrice}
            </span>
          </div>

          {/* Amazon-style Buttons: Add to Cart & Buy Now */}
          <div className="grid grid-cols-2 gap-2">
            <button
              id={`add-to-cart-${product.id}`}
              type="button"
              onClick={() => onAddToCart(product, selectedRuling)}
              className="py-2 px-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-slate-600" />
              <span>Add to Cart</span>
            </button>

            <button
              id={`buy-now-${product.id}`}
              type="button"
              onClick={() => onBuyNow(product, selectedRuling)}
              className="py-2 px-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1 shadow-sm hover:shadow transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
