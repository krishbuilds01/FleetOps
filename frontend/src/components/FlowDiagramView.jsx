import React, { useState } from 'react';
import { 
  ArrowRight, ShieldCheck, Database, Server, Layout, 
  Truck, FileSpreadsheet, ShieldAlert, Sparkles, CheckCircle2, RefreshCw 
} from 'lucide-react';

export default function FlowDiagramView({ onNavigate }) {
  const [activeStep, setActiveStep] = useState(null);

  const steps = [
    {
      id: 'screen1',
      title: 'Screen 1: Home & Unified Login',
      badge: 'Step 1',
      role: 'Public / Unified Access',
      description: 'Single login portal accepts email & password for Driver, Manager, or Admin role routing.',
      details: [
        'JWT validation via POST /api/auth/login',
        'Role-Based redirecting to Driver or Manager Console',
        'Quick demo autofill credentials provided for Viva'
      ],
      color: 'blue'
    },
    {
      id: 'backend',
      title: 'MERN Backend API Layer',
      badge: 'Step 2',
      role: 'Express & MongoDB',
      description: 'Central controller performing authentication, role-based authorization middleware, and real-time state mutation.',
      details: [
        'JWT validation & x-user-role header checking',
        'UTC timezone timestamping for all shift records',
        'In-memory fallback for offline sandbox operation'
      ],
      color: 'purple'
    },
    {
      id: 'driver',
      title: 'Screen 2: Driver Portal',
      badge: 'Role: Driver',
      role: 'Mobile-Optimized UI',
      description: 'Touch-friendly mobile interface for drivers on the road.',
      details: [
        'Select assigned vehicle & start/end shift controls',
        'Status updater: At Delivery Location, Returning to Base, Breakdown',
        'Incident note logger updates MongoDB in real-time'
      ],
      color: 'emerald'
    },
    {
      id: 'manager',
      title: 'Screen 3: Manager Dashboard',
      badge: 'Role: Manager / Admin',
      role: 'Desktop Command Center',
      description: 'Master command center with instant React state dynamic filtering.',
      details: [
        'Dynamic filter toggles: [All] [Idle] [En Route] [Maintenance]',
        'Live master roster table with driver & shift UTC columns',
        'Dispatch response panel: Dispatch repair unit & reassign deliveries'
      ],
      color: 'indigo'
    },
    {
      id: 'exporthub',
      title: 'Screen 4: Export Hub & Security Guardrail',
      badge: 'Role: Admin Only',
      role: 'Compliance & Audit',
      description: 'CSV report generator protected by Express verifyRole middleware.',
      details: [
        'Generates CSV report with HTTP attachment header',
        'Driver access attempt strictly rejected with 403 Forbidden',
        'Aggregates shift logs & hours worked for payroll audit'
      ],
      color: 'amber'
    }
  ];

  return (
    <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            System Architecture Diagram
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            FleetOps Complete Operational Flow
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
            Interactive visualization of the end-to-end MERN data pipeline, role routing, and security guardrails
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('login')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            Launch Unified Login
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive ASCII / Node Flow Visualizer */}
      <div className="relative z-10 space-y-6">
        
        {/* Flow Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Card 1: Screen 1 */}
          <div 
            onClick={() => setActiveStep('screen1')}
            className={`border rounded-xl p-5 transition-all cursor-pointer ${
              activeStep === 'screen1' 
                ? 'bg-blue-950/60 border-blue-500 shadow-lg shadow-blue-500/20' 
                : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold text-blue-400 bg-blue-950 border border-blue-800 px-2.5 py-0.5 rounded-full uppercase">
                Screen 1
              </span>
              <Layout className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="font-bold text-sm text-white">Unified Home & Login</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Email & Password input with JWT validation and role-based navigation.
            </p>
            <div className="mt-3 text-[10px] text-blue-300 font-mono bg-slate-950/70 p-2 rounded border border-slate-800">
              POST /api/auth/login → verifyRole()
            </div>
          </div>

          {/* Card 2: Driver Portal */}
          <div 
            onClick={() => setActiveStep('driver')}
            className={`border rounded-xl p-5 transition-all cursor-pointer ${
              activeStep === 'driver' 
                ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-500/20' 
                : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2.5 py-0.5 rounded-full uppercase">
                Screen 2
              </span>
              <Truck className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-bold text-sm text-white">Driver Portal</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Mobile view: Shift controls (Start/End Shift), status dropdown, & incident logger.
            </p>
            <div className="mt-3 text-[10px] text-emerald-300 font-mono bg-slate-950/70 p-2 rounded border border-slate-800">
              Status → 'En Route' | Timestamps in UTC
            </div>
          </div>

          {/* Card 3: Manager Dashboard */}
          <div 
            onClick={() => setActiveStep('manager')}
            className={`border rounded-xl p-5 transition-all cursor-pointer ${
              activeStep === 'manager' 
                ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-500/20' 
                : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-extrabold text-indigo-400 bg-indigo-950 border border-indigo-800 px-2.5 py-0.5 rounded-full uppercase">
                Screen 3
              </span>
              <Server className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="font-bold text-sm text-white">Manager Dashboard</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Desktop command center: Dynamic state filtering [All][Idle][En Route][Maint].
            </p>
            <div className="mt-3 text-[10px] text-indigo-300 font-mono bg-slate-950/70 p-2 rounded border border-slate-800">
              React State memoized dynamic filter
            </div>
          </div>

        </div>

        {/* Database & Export Guardrail Pipeline Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          
          {/* Card 4: MongoDB Real-Time Sync */}
          <div 
            onClick={() => setActiveStep('backend')}
            className="border border-slate-800 bg-slate-950/80 rounded-xl p-5 hover:border-purple-500/50 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" />
                <h4 className="font-bold text-xs text-purple-300 uppercase tracking-wide">
                  MongoDB Data Persistence Engine
                </h4>
              </div>
              <span className="text-[10px] text-purple-400 font-mono">Real-time Updates</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Driver shift actions mutate vehicle status directly in MongoDB. Shift durations and timestamps are recorded in strict UTC timezone for payroll consistency.
            </p>
          </div>

          {/* Card 5: Export Hub & 403 Security Guardrail */}
          <div 
            onClick={() => setActiveStep('exporthub')}
            className="border border-slate-800 bg-slate-950/80 rounded-xl p-5 hover:border-amber-500/50 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-xs text-amber-300 uppercase tracking-wide">
                  Screen 4: Export Hub & Security Guardrail
                </h4>
              </div>
              <span className="text-[10px] text-red-400 font-mono font-bold">403 Forbidden Guardrail</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Express <code className="text-amber-300 font-mono">verifyRole(['Admin', 'FleetManager'])</code> protects CSV export. Driver access attempts trigger an explicit 403 Forbidden rejection card.
            </p>
          </div>

        </div>

        {/* Selected Step Detail Drawer */}
        {activeStep && (
          <div className="bg-slate-950 border border-blue-500/40 rounded-xl p-5 animate-fade-in text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-blue-400 uppercase tracking-wider">
                {steps.find(s => s.id === activeStep)?.title}
              </span>
              <button 
                onClick={() => setActiveStep(null)}
                className="text-slate-500 hover:text-white text-[10px] font-bold underline cursor-pointer"
              >
                Close Details
              </button>
            </div>
            <p className="text-slate-300 font-medium">
              {steps.find(s => s.id === activeStep)?.description}
            </p>
            <ul className="text-slate-400 space-y-1 list-disc list-inside pt-1">
              {steps.find(s => s.id === activeStep)?.details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        )}

      </div>

    </div>
  );
}
