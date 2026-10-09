import React from 'react';
import { X, ShieldCheck, CheckCircle2, AlertTriangle, Building, Globe } from 'lucide-react';

export function LegalNoticeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel bg-neutral-950/98 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-luxury font-bold text-xl text-white">
              Freedom to Operate & Patent Clearance
            </h3>
            <p className="text-xs text-emerald-400 font-semibold">
              Commercial Viability Assessment for Eyewear Virtual Try-On
            </p>
          </div>
        </div>

        {/* Core Verdict Box */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mb-5">
          <div className="flex items-start space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-emerald-300">
                Verdict: Legally Free to Build, Sell & Pitch to Other Eyewear Brands
              </h4>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                Lenskart does <strong>not</strong> hold an exclusive patent on real-time webcam virtual try-on filters.
                Virtual Try-On (VTO) is a public domain computer-vision capability and an open global industry standard.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Major Pillars */}
        <div className="space-y-4 text-xs text-neutral-300">
          {/* Pillar 1 */}
          <div className="p-4 rounded-xl bg-neutral-900/70 border border-white/5">
            <div className="flex items-center space-x-2 text-white font-bold text-sm mb-1.5">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>1. Extensive Prior Art & Global Commercial Precedent</span>
            </div>
            <p className="leading-relaxed text-neutral-300">
              Virtual Try-On is actively deployed by dozens of major brands worldwide:
            </p>
            <ul className="grid grid-cols-2 gap-1.5 mt-2 text-neutral-400">
              <li>• <strong>Warby Parker</strong> (AR try-on since 2019)</li>
              <li>• <strong>Ray-Ban / Luxottica</strong> (Virtual Mirror)</li>
              <li>• <strong>Zenni Optical</strong> (3D Try-On)</li>
              <li>• <strong>Specsavers & Mister Spex</strong></li>
            </ul>
            <p className="mt-2 text-neutral-400">
              Furthermore, dedicated B2B technology providers exist whose primary business is selling eyewear AR modules to retailers:
              <strong> FittingBox</strong>, <strong>Banuba</strong>, <strong>DeepAR</strong>, and <strong>MemoMi</strong>.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-4 rounded-xl bg-neutral-900/70 border border-white/5">
            <div className="flex items-center space-x-2 text-white font-bold text-sm mb-1.5">
              <Building className="w-4 h-4 text-sky-400" />
              <span>2. What Lenskart Actually Owns (Ditto Acquisition)</span>
            </div>
            <p className="leading-relaxed text-neutral-300">
              Lenskart acquired <strong>Ditto</strong>, a US-based 3D face-scanning startup. Ditto’s patents pertain to specific multi-angle video booth avatar capture workflows. They do <strong>not</strong> own the generic concept of WebGL 3D face filters, MediaPipe tracking, or real-time camera projection.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-4 rounded-xl bg-neutral-900/70 border border-white/5">
            <div className="flex items-center space-x-2 text-white font-bold text-sm mb-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>3. Essential Compliance Rules to Protect Your Business</span>
            </div>
            <ul className="space-y-1.5 text-neutral-400 leading-relaxed">
              <li>
                <strong className="text-neutral-200">• Clean-Room Code:</strong> Develop your own 3D assets, Three.js shaders, and user interface. Never copy or scrape Lenskart’s source code or proprietary 3D CAD assets.
              </li>
              <li>
                <strong className="text-neutral-200">• Avoid Trademark Infringement:</strong> Do not use "Lenskart", "Ditto", or their private label brand names (<em>Vincent Chase, John Jacobs, Hooper</em>).
              </li>
              <li>
                <strong className="text-neutral-200">• Original UI/UX:</strong> Keep your layout distinct to avoid trade-dress conflicts.
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] text-neutral-400 mt-4 italic text-center">
          Note: This document provides technical and commercial analysis based on publicly known prior art and industry practice. Consult a registered patent attorney for formal legal opinions for enterprise licensing agreements.
        </p>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-colors"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
