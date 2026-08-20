import React from 'react';
import { Sparkles, Shield, Truck, Layout, FileSpreadsheet, Play, CheckCircle } from 'lucide-react';

export default function TeacherVivaBanner({ onNavigate, user }) {
  const switchRole = (email, role, view) => {
    const userObj = { email, role };
    localStorage.setItem('fleetops_user', JSON.stringify(userObj));
    onNavigate(view);
    window.location.reload(); // Refresh state cleanly
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white text-xs py-2 px-4 border-b border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 font-sans shadow-md select-none">
      
      {/* Title */}
      <div className="flex items-center gap-2 font-bold shrink-0">
        <span className="bg-blue-600 text-white text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-300" />
          Viva Demo Mode
        </span>
        <span className="text-slate-300 text-[11px] hidden md:inline">
          1-Click Role Switcher for Teacher Evaluation:
        </span>
      </div>

      {/* 3 Simple 1-Click Role Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto justify-center">
        
        {/* Button 1: Driver */}
        <button
          onClick={() => switchRole('driver@fleetops.com', 'driver', 'driver-dashboard')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            user?.role === 'driver'
              ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-sm ring-2 ring-emerald-300'
              : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          1. Driver Portal
          {user?.role === 'driver' && <CheckCircle className="w-3 h-3 text-slate-950" />}
        </button>

        {/* Button 2: Manager */}
        <button
          onClick={() => switchRole('manager@fleetops.com', 'manager', 'manager-dashboard')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            user?.role === 'manager'
              ? 'bg-blue-500 text-white font-extrabold shadow-sm ring-2 ring-blue-300'
              : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          2. Manager Dashboard
          {user?.role === 'manager' && <CheckCircle className="w-3 h-3 text-white" />}
        </button>

        {/* Button 3: Admin & Export */}
        <button
          onClick={() => switchRole('admin@fleetops.com', 'admin', 'export-hub')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            user?.role === 'admin'
              ? 'bg-purple-500 text-white font-extrabold shadow-sm ring-2 ring-purple-300'
              : 'bg-slate-800/90 text-slate-200 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          3. Admin Export & 403 Security
          {user?.role === 'admin' && <CheckCircle className="w-3 h-3 text-white" />}
        </button>

      </div>

    </div>
  );
}
