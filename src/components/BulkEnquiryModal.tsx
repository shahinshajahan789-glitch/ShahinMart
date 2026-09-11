import React, { useState } from 'react';
import { X, Building2, Send, CheckCircle2 } from 'lucide-react';
import { MERCHANT_INFO } from '../data/products';

interface BulkEnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkEnquiryModal: React.FC<BulkEnquiryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [institutionName, setInstitutionName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [institutionType, setInstitutionType] = useState('school');
  const [quantity, setQuantity] = useState('100-500 books');
  const [requirements, setRequirements] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    // Direct WhatsApp quote dispatcher to ShahinMART
    const message = `*🏢 BULK / WHOLESALE QUOTE REQUEST - ShahinMART*
===========================
*Institution:* ${institutionName} (${institutionType.toUpperCase()})
*Contact Person:* ${contactPerson}
*Phone:* +91 ${phone}
*Estimated Volume:* ${quantity}
*Requirements / Notebook Formats:*
${requirements || 'General A4, Long notebooks & practical records quote needed'}
===========================`;

    const waLink = `https://wa.me/${MERCHANT_INFO.phoneRaw}?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div
        id="bulk-quote-modal"
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 relative my-6"
      >
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-3">
            <Building2 className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-black">Wholesale &amp; Institutional Supply</h2>
          <p className="text-xs text-slate-300 mt-1">
            Supplying schools, colleges, tuition centres, and offices across Thiruvananthapuram with special bulk rates.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Enquiry Dispatched!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Your bulk requirements have been sent to ShahinMART team. We will call you back at <strong>+91 {phone}</strong> with our wholesale price sheet and sample delivery.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Institution / Organization Name *
              </label>
              <input
                type="text"
                required
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="e.g. Model High School / Excel Tuition Centre"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Principal / Manager"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Institution Type
                </label>
                <select
                  value={institutionType}
                  onChange={(e) => setInstitutionType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="school">School / College</option>
                  <option value="tuition">Tuition / Coaching Centre</option>
                  <option value="office">Office / Corporate</option>
                  <option value="retail">Retail Reseller</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expected Volume
                </label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="50-100 books">50 - 100 Books</option>
                  <option value="100-500 books">100 - 500 Books</option>
                  <option value="500-1000 books">500 - 1,000 Books</option>
                  <option value="1000+ books">1,000+ Books (Maximum Discount)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Specific Books &amp; Ruling Requirements
              </label>
              <textarea
                rows={2}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="e.g. Need 200 Papergrid A4 Single Line, 100 Practical Books with custom institution stamp..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Get Custom Quote on WhatsApp</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
