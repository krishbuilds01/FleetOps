import React, { useState } from 'react';
import { 
  BookOpen, CheckCircle, ShieldAlert, Database, Server, Layout, 
  Clock, FileSpreadsheet, X, Sparkles, HelpCircle, ChevronRight, Play
} from 'lucide-react';

export default function VivaExplainerModal({ isOpen, onClose, onNavigate }) {
  const [activeTab, setActiveTab] = useState('flow');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/30 border border-blue-500/40 p-2 rounded-xl text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight flex items-center gap-2">
                FleetOps | Viva & Architecture Explanation Center
                <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  MERN Stack Guide
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Quick reference guide for project viva examination & technical presentation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 px-6 py-2 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('flow')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'flow'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            1. Complete App Flow
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            2. Tech Stack & Middleware
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'security'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            3. Security Guardrails (403)
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            4. Viva Q&A Cheat Sheet
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-sm">
          
          {/* TAB 1: Complete App Flow */}
          {activeTab === 'flow' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-blue-950 text-xs uppercase tracking-wide">
                    Operational Workflow Overview
                  </h3>
                  <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                    FleetOps acts as a real-time logistics command center connecting road drivers with office fleet managers and system administrators.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <span className="text-[10px] font-extrabold text-blue-600 bg-blue-100 px-2 py-0.5 rounded uppercase">Step 1: Driver Shift Start</span>
                  <h4 className="font-bold text-slate-900 text-xs">Driver Portal Action</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Driver logs in, selects vehicle (e.g. VAN-103), and clicks <strong className="text-emerald-700">Start Shift</strong>. Backend logs start timestamp in <strong className="text-slate-900">UTC</strong> and auto-updates vehicle status from <strong className="text-slate-700">Idle</strong> to <strong className="text-blue-700">En Route</strong> in MongoDB.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded uppercase">Step 2: Command Center Monitoring</span>
                  <h4 className="font-bold text-slate-900 text-xs">Fleet Manager Dashboard</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Manager views live roster table. React State (<code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">useMemo</code>) enables instant zero-latency filtering by <strong className="text-slate-900">[All] [Idle] [En Route] [Maintenance]</strong> without database re-queries.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <span className="text-[10px] font-extrabold text-amber-600 bg-amber-100 px-2 py-0.5 rounded uppercase">Step 3: Issue & Incident Logging</span>
                  <h4 className="font-bold text-slate-900 text-xs">Driver Status Update</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    If breakdown occurs (e.g. flat tire), Driver updates dropdown to <strong className="text-amber-700">Maintenance/Breakdown</strong> and submits incident notes. MongoDB updates instantly and triggers active alert on Manager Dashboard.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                  <span className="text-[10px] font-extrabold text-purple-600 bg-purple-100 px-2 py-0.5 rounded uppercase">Step 4: Dispatch Response</span>
                  <h4 className="font-bold text-slate-900 text-xs">Manager Command Action</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Manager notices high-priority alert banner, clicks <strong className="text-slate-900">Dispatch Repair Unit</strong>, and reassigns remaining deliveries to an idle driver.
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded uppercase">Step 5: Operational Audit Export</span>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="font-bold text-xs">Admin / Manager Export Hub</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  System Admin generates weekly operational CSV reports. Express route aggregates shift logs and returns streamed CSV with HTTP headers <code className="text-emerald-300 bg-slate-800 px-1 py-0.5 rounded">Content-Disposition: attachment; filename="fleet-report.csv"</code> for automatic browser download.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Tech Stack & Middleware */}
          {activeTab === 'architecture' && (
            <div className="space-y-5">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                MERN Stack Technical Architecture
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-2">
                    <Database className="w-4 h-4 text-emerald-600" />
                    MongoDB Database Schema
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                    <li><strong className="text-slate-800">User Schema:</strong> Email, Password, Role (Admin, FleetManager, Driver)</li>
                    <li><strong className="text-slate-800">Vehicle Schema:</strong> id, driver, status, speed, fuel, telemetry, alerts</li>
                    <li><strong className="text-slate-800">Shift Schema:</strong> driverName, vehicleId, startTime (UTC), status</li>
                    <li><strong className="text-slate-800">Log & Incident Schema:</strong> vehicleId, description, severity, timestamp</li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-2">
                    <Server className="w-4 h-4 text-blue-600" />
                    Express.js Backend & API
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                    <li><strong className="text-slate-800">Authentication:</strong> POST /api/auth/login validates credentials</li>
                    <li><strong className="text-slate-800">Role Middleware:</strong> verifyRole(['admin', 'manager'])</li>
                    <li><strong className="text-slate-800">CSV Streamer:</strong> GET /api/reports/export-csv</li>
                    <li><strong className="text-slate-800">In-Memory Fallback:</strong> Ensures full offline functionality without DB connection errors</li>
                  </ul>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  UTC Timezone Consistency Standard
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All shift start/end timestamps are strictly serialized using <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">new Date().toISOString()</code> in UTC format. This avoids timezone conversion bugs when generating global operational CSV reports across different fleet regions.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Security Guardrails */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-900">
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wide">
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  Express Security Guardrail Middleware: verifyRole()
                </div>
                <p className="text-xs text-red-800 mt-1 leading-relaxed">
                  Security is enforced at the Express route level. Access to compliance reporting endpoints requires Admin or FleetManager roles.
                </p>
              </div>

              <div className="bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                <div className="text-slate-400 text-[10px] uppercase font-sans font-bold mb-2">Express Middleware Code (backend/auth.js):</div>
                <pre>{`export function verifyRole(allowedRoles) {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'] || req.query.role;
    if (!userRole) {
      return res.status(401).json({ message: 'Unauthorized: No operational role provided.' });
    }
    const finalRole = userRole.toLowerCase() === 'fleetmanager' ? 'manager' : userRole.toLowerCase();
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());
    
    if (!normalizedAllowed.includes(finalRole)) {
      return res.status(403).json({ 
        message: 'Security Guardrail: Access Denied. Role strictly unauthorized.' 
      });
    }
    next();
  };
}`}</pre>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                <h4 className="font-bold text-xs text-slate-900">Driver Access Attempt Simulation</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  If a user logged in as <strong className="text-amber-700">Driver</strong> attempts to call the Export CSV route, the middleware intercepts the request before controller execution and returns HTTP Status <strong className="text-red-600 font-mono">403 Forbidden</strong>. The frontend renders a Security Guardrail rejection card explaining the violation.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: Viva Q&A Cheat Sheet */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Common Viva Questions & Ready Answers
              </h3>

              <div className="space-y-3">
                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                  <p className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                    Q1: How does the Fleet Manager view update dynamically without page reloads?
                  </p>
                  <p className="text-xs text-slate-600 mt-1 pl-5">
                    <strong>Answer:</strong> On initial component mount, the initial vehicle roster payload is fetched from MongoDB. React State (<code className="bg-slate-200 px-1 text-[10px]">useState</code> and <code className="bg-slate-200 px-1 text-[10px]">useMemo</code>) manages local status filtering ([All], [Idle], [En Route], [Maintenance]) so UI state updates instantly without unneeded network requests.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                  <p className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                    Q2: How is role authorization handled in Express?
                  </p>
                  <p className="text-xs text-slate-600 mt-1 pl-5">
                    <strong>Answer:</strong> We use an Express custom middleware function <code className="bg-slate-200 px-1 text-[10px]">verifyRole(['admin', 'manager'])</code> that inspects the request headers/tokens. If an unprivileged user (like a Driver) calls a restricted route, it responds with HTTP status 403 Forbidden.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                  <p className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                    Q3: How does CSV file export work on the backend?
                  </p>
                  <p className="text-xs text-slate-600 mt-1 pl-5">
                    <strong>Answer:</strong> The backend queries shift/report records from MongoDB according to date range, formats rows into comma-separated text strings, sets HTTP response headers (<code className="bg-slate-200 px-1 text-[10px]">Content-Type: text/csv</code> & <code className="bg-slate-200 px-1 text-[10px]">Content-Disposition: attachment</code>), and sends the CSV stream directly to trigger browser download.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                  <p className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-blue-600" />
                    Q4: Why store shift logs strictly in UTC?
                  </p>
                  <p className="text-xs text-slate-600 mt-1 pl-5">
                    <strong>Answer:</strong> Storing timestamps in UTC avoids ambiguity when fleet operations span multiple timezones, preventing calculation errors in weekly hours worked audit reports.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Quick Launch Actions */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] font-semibold text-slate-500">
            Quick Viva Demo Shortcuts:
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                onClose();
                onNavigate('login');
              }}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 text-blue-600" />
              1-Click Login Page
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Got It, Return to App
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
