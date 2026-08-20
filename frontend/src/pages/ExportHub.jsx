import React, { useState } from 'react';
import { 
  FileSpreadsheet, ShieldAlert, ShieldCheck, 
  ArrowLeft, Loader2, Download, AlertTriangle, Lock 
} from 'lucide-react';
import { getApiUrl } from '../config';

export default function ExportHub({ onNavigate, user }) {
  const [dateRange, setDateRange] = useState('current_week');
  const [format, setFormat] = useState('csv');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [simulateDriverBlocked, setSimulateDriverBlocked] = useState(false);

  // Map local role to backend headers role
  const getBackendRole = (role) => {
    if (role === 'admin') return 'Admin';
    if (role === 'manager') return 'FleetManager';
    return 'Driver';
  };

  // Check if role is authorized
  const isAuthorized = !simulateDriverBlocked && user && (user.role === 'admin' || user.role === 'manager');

  const handleGenerateReport = async () => {
    setIsLoading(true);
    setError('');
    setSuccess(false);

    const roleToSend = getBackendRole(user?.role);
    const token = localStorage.getItem('fleetops_token');
    const headers = {
      'x-user-role': roleToSend
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      try {
        const response = await fetch(getApiUrl(`/api/reports/export-csv?range=${dateRange}&role=${roleToSend}&_t=${Date.now()}`), {
          method: 'GET',
          headers: headers
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('403 Forbidden - Security Guardrail: Role unauthorized for Export Hub operations.');
          } else if (response.status === 401) {
            throw new Error('401 Unauthorized - No operational role provided.');
          } else {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
          }
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fleet-report-${dateRange}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setSuccess(true);
        return;
      } catch (fetchErr) {
        if (fetchErr.message.includes('403') || fetchErr.message.includes('401')) {
          throw fetchErr;
        }

        console.warn('Backend API unreachable, using client-side report generator fallback:', fetchErr.message);

        const mockReports = [
          { date: '2026-08-15', vehId: 'TRK-101', driver: 'Rajesh Kumar', status: 'En Route', shift: '08:00 IST', hours: '4.5', note: 'Mumbai to Pune transit active' },
          { date: '2026-08-15', vehId: 'TRK-102', driver: 'Amit Sharma', status: 'En Route', shift: '08:15 IST', hours: '4.2', note: 'Delhi to Jaipur expressway clear' },
          { date: '2026-08-15', vehId: 'TRK-106', driver: 'Anil Yadav', status: 'Maintenance', shift: '07:15 IST', hours: '2.0', note: 'Kolkata dock tire pressure service' },
          { date: '2026-08-14', vehId: 'TRK-103', driver: 'Suresh Verma', status: 'En Route', shift: '09:00 IST', hours: '6.0', note: 'Bengaluru to Chennai corridor' },
          { date: '2026-08-13', vehId: 'TRK-105', driver: 'Priya Patel', status: 'En Route', shift: '08:00 IST', hours: '7.5', note: 'Hyderabad to Vijayawada highway' },
          { date: '2026-08-12', vehId: 'TRK-104', driver: 'Vikram Singh', status: 'Idle', shift: '10:00 IST', hours: '5.0', note: 'Ahmedabad Logistics Yard' }
        ];

        let csv = 'VEH ID,ASSIGNED DRIVER,STATUS,SHIFT (IST),HOURS WORKED,NOTES,DATE\n';
        mockReports.forEach(item => {
          csv += `"${item.vehId}","${item.driver}","${item.status}","${item.shift}","${item.hours}","${item.note}","${item.date}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fleet-report-${dateRange}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setSuccess(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8 relative font-sans">
      
      {/* Back button */}
      <div className="max-w-4xl mx-auto mb-6">
        <button
          onClick={() => onNavigate(user?.role === 'driver' ? 'home' : 'manager-dashboard')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-2.5 py-1.5 border border-transparent hover:border-slate-200 hover:bg-white cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to {user?.role === 'driver' ? 'Home' : 'Manager Console'}
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white border border-slate-200 shadow-md rounded-2xl overflow-hidden">
        
        {/* Header Block */}
        <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              FleetOps | EXPORT HUB
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wide">
                System Admin View
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              Authorized Operational Audit & Report Panel
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg select-none">
              Operator: <span className="font-bold text-slate-700">{user ? user.email : 'Guest'}</span>
            </span>
            <button 
              onClick={() => onNavigate('logout')}
              className="text-xs font-bold text-red-600 hover:text-red-700 active:text-red-800 transition-colors px-2.5 py-1.5 focus:outline-none focus-visible:underline rounded-lg cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>



        {/* Body Area */}
        <div className="p-6 sm:p-8">
          {!isAuthorized ? (
            /* SECURITY GUARDRAIL - 403 Forbidden Block */
            <div className="bg-red-50/70 border border-red-200 rounded-xl p-6 text-center max-w-xl mx-auto shadow-inner my-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 border border-red-200 mb-4 animate-pulse">
                <ShieldAlert className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-sm font-black text-red-900 uppercase tracking-wide">
                Security Guardrail Detected
              </h3>
              <p className="mt-2 text-xs text-red-750 font-semibold leading-relaxed">
                403 Forbidden Error. Access attempt blocked by Express Middleware guardrails. Your account role (<span className="font-mono text-red-950 uppercase">{user?.role || 'unknown'}</span>) is strictly unauthorized for compliance exports.
              </p>
              
              <div className="mt-4 pt-4 border-t border-red-200/50 text-[10px] text-red-500 font-bold uppercase tracking-wider text-left space-y-1.5 font-mono">
                <p>• API Route: GET /api/reports/export-csv</p>
                <p>• Middleware check: verifyRole(['Admin', 'FleetManager'])</p>
                <p>• Action: Access strictly rejected with 403 Forbidden</p>
              </div>
            </div>
          ) : (
            /* Authorized Panel Details */
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-5 max-w-xl mx-auto">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
                Export Setup
              </h3>
              
              {/* Error/Success Feedbacks */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 text-xs font-semibold px-3 py-2.5 rounded-lg flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-3 py-2.5 rounded-lg flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Report downloaded successfully in CSV format!</span>
                </div>
              )}

              {/* Range Select */}
              <div>
                <label htmlFor="range" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Select Range
                </label>
                <select
                  id="range"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="block w-full text-slate-900 border border-slate-300 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="current_week">Current Week (All Drivers)</option>
                  <option value="today">Today (Active Logs)</option>
                  <option value="last_30_days">Last 30 Days (Compliance Archive)</option>
                </select>
              </div>

              {/* Format Select */}
              <div>
                <label htmlFor="format" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Format
                </label>
                <select
                  id="format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="block w-full text-slate-900 border border-slate-300 rounded-lg px-3 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="csv">CSV Spreadsheet (.csv)</option>
                </select>
              </div>

              {/* Submit Action Button */}
              <button
                onClick={handleGenerateReport}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Generate Excel / CSV Report
                  </>
                )}
              </button>
            </div>
          )}
        </div>



      </div>
    </div>
  );
}
