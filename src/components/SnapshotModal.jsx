import React from 'react';
import { X, Download, Share2, Check, Sparkles, ShoppingBag } from 'lucide-react';

export function SnapshotModal({
  isOpen,
  onClose,
  snapshotUrl,
  frame,
  color,
  lens
}) {
  const [copied, setCopied] = React.useState(false);

  const [ordered, setOrdered] = React.useState(false);

  if (!isOpen || !snapshotUrl) return null;

  const handleOrder = () => {
    setOrdered(true);
    setTimeout(() => setOrdered(false), 2500);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = snapshotUrl;
    a.download = `SpectaAR-${frame.name.replace(/\s+/g, '-')}-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl glass-panel bg-neutral-950/95 border border-neutral-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="font-luxury font-bold text-lg text-white">Your Virtual Fitting Look</h3>
        </div>

        {/* Snapshot Image Preview */}
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-neutral-900 aspect-[16/10] flex items-center justify-center">
          <img
            src={snapshotUrl}
            alt="Virtual Try-On Snapshot"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details & Specs */}
        <div className="mt-4 flex items-center justify-between p-3.5 rounded-xl bg-neutral-900/60 border border-white/5">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-white">{frame.name}</span>
              <span className="text-xs text-amber-400 font-semibold">₹{frame.price.toLocaleString('en-IN')}</span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {color.name} • {lens.name}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
              title="Copy Link"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Save Photo</span>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-neutral-400">Includes anti-scratch & 100% UV400 lens</span>
          <button
            onClick={handleOrder}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all ${
              ordered
                ? 'bg-emerald-400 text-neutral-950 scale-105'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950'
            }`}
          >
            {ordered ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Added to Bag!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Order This Look • ${frame.price}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
