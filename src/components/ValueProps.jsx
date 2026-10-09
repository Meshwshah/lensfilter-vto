import React from 'react';
import { Target, Shield, Award, CheckCircle2, Sparkles, Feather } from 'lucide-react';

export function ValueProps() {
  return (
    <section className="mt-16 w-full pt-10 border-t border-white/5">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">
            Engineered Precision
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl text-neutral-100 font-normal">
            Why Discerning Eyes Choose SPECTA
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
            Merging computational biometric fitting intelligence with certified ophthalmic lens surfacing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Sub-Millimeter Pupillary Lock */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-amber-500/30 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-editorial text-lg text-white font-medium">
                Sub-Millimeter Pupillary Lock
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Our MediaPipe TrueFace™ neural mesh measures 468 facial biometric nodal anchors, locking your prescription optical center precisely at the 43% gaze level.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/5 flex items-center gap-2 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Zero Astigmatic Distortion</span>
            </div>
          </div>

          {/* Card 2: Zeiss Clarity Coatings */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-emerald-500/30 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-editorial text-lg text-white font-medium">
                Zeiss Clarity Coatings
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Every frame ships with 9-layer vacuum-deposited oleophobic, hydrophobic, and high-index blue-violet radiation filtering as standard.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/5 flex items-center gap-2 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>100% UV400 Protection</span>
            </div>
          </div>

          {/* Card 3: Japanese Beta-Titanium */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:border-amber-500/30 transition-all group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Feather className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-editorial text-lg text-white font-medium">
                Japanese Beta-Titanium
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Flex hinges rated for 50,000 actuations without tension loss. Hypoallergenic, nickel-free, and effortlessly featherweight under 16 grams.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-white/5 flex items-center gap-2 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>2-Year Structural Guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
