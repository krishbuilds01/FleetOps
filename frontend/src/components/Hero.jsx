import { ArrowRight } from 'lucide-react';

export default function Hero({ onNavigate }) {
  return (
    <section className="relative overflow-hidden bg-white pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Subtle grid pattern background for technical feel */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-6">
              Manage Every Mile. <br />
              <span className="text-blue-600">Deliver With Confidence.</span>
            </h1>
            
            <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-lg">
              A centralized platform for managing fleets, tracking operations, and keeping logistics teams connected.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button 
                onClick={() => onNavigate('login')}
                className="inline-flex items-center justify-center text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer group"
              >
                Sign In to Console
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              
            </div>
          </div>

          {/* Right Column: High Fidelity Dashboard Preview (Revived with real project specs) */}
          <div className="lg:col-span-7 w-full">
            <div className="bg-slate-50 border border-slate-200 rounded-xl shadow-lg p-3 md:p-5 overflow-hidden select-none">
              
              {/* macOS Window Frame Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-2xs mb-4">
                <div className="flex items-center gap-3">
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-700 tracking-tight">fleetops-control-tower</span>
                  </div>
                  <span className="text-xs text-slate-300">|</span>
                  <span className="text-[10px] font-mono text-slate-400">HQ-Logistics-West</span>
                </div>
                {/* Window Actions */}
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 border border-rose-500/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-amber-500/20" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-500/20" />
                </div>
              </div>

              {/* Stats Grid - 3 Premium Portal Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Card 1: Manager Portal */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 text-left shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <span className="text-[9px] uppercase font-bold text-blue-600 tracking-wider">
                    Control Tower
                  </span>
                  <div className="text-lg font-bold text-slate-800 tracking-tight mt-1">
                    Manager Portal
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal mt-2">
                    Monitor telemetry, dispatch repair units, and oversee live vehicle status.
                  </p>
                </div>

                {/* Card 2: Driver Portal */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 text-left shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <span className="text-[9px] uppercase font-bold text-emerald-600 tracking-wider">
                    On-The-Road
                  </span>
                  <div className="text-lg font-bold text-slate-800 tracking-tight mt-1">
                    Driver Console
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal mt-2">
                    Claim active vehicles, start/end shift logs, and report road incidents.
                  </p>
                </div>

                {/* Card 3: Admin Reports */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 text-left shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <span className="text-[9px] uppercase font-bold text-indigo-600 tracking-wider">
                    Compliance Hub
                  </span>
                  <div className="text-lg font-bold text-slate-800 tracking-tight mt-1">
                    Admin Center
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal mt-2">
                    Manage credentials, audit driver rosters, and export custom CSV reports.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
