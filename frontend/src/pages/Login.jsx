import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowLeft } from 'lucide-react';
import { api } from '../api';


const REGISTERED_USERS = [
  { email: 'admin@fleetops.com', password: 'admin123', role: 'admin' },
  { email: 'manager@fleetops.com', password: 'manager123', role: 'manager' },
  { email: 'driver@fleetops.com', password: 'driver123', role: 'driver' },
  { email: 'rajesh.kumar@fleetops.com', password: 'driver123', role: 'driver' },
  { email: 'amit.sharma@fleetops.com', password: 'driver123', role: 'driver' },
  { email: 'suresh.verma@fleetops.com', password: 'driver123', role: 'driver' },
  { email: 'vikram.singh@fleetops.com', password: 'driver123', role: 'driver' },
  { email: 'priya.patel@fleetops.com', password: 'driver123', role: 'driver' },
  { email: 'anil.yadav@fleetops.com', password: 'driver123', role: 'driver' },
  { email: 'ramesh.gupta@fleetops.com', password: 'driver123', role: 'driver' },
  { email: 'deepak.reddy@fleetops.com', password: 'driver123', role: 'driver' }
];

export default function Login({ onNavigate, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    const performLogin = async () => {
      try {
        const data = await api.login(email, password);
        setIsLoading(false);
        setSuccess(true);
        setTimeout(() => {
          if (onLogin) {
            onLogin(data.user);
          } else {
            onNavigate('home');
          }
        }, 1000);
      } catch (err) {
        setIsLoading(false);
        const emailClean = email.toLowerCase().trim();
        const matched = REGISTERED_USERS.find(
          (u) => u.email.toLowerCase() === emailClean && u.password === password
        );

        if (matched) {
          setSuccess(true);
          setTimeout(() => {
            if (onLogin) {
              onLogin({ email: matched.email, role: matched.role });
            } else {
              onNavigate('home');
            }
          }, 1000);
        } else {
          setError(err.message || 'Invalid email or password.');
        }
      }
    };

    performLogin();
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50/50 relative">
      {}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-2.5 py-1.5 border border-transparent hover:border-slate-200 hover:bg-white cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {}
        <div className="flex justify-center">
          <div className="bg-blue-600 p-2 rounded-xl shadow-sm flex items-center justify-center">
            <svg 
              className="w-6 h-6 text-white" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
        </div>
        
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900">
          Welcome back
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-500 font-medium">
          Enter your credentials to access the FleetOps Console
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-slate-200 shadow-md sm:rounded-xl sm:px-10">
          {success ? (
            <div className="text-center py-8">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-50 border border-emerald-100 mb-4">
                <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Authenticated Successfully</h3>
              <p className="mt-1 text-xs text-slate-500">Redirecting to operations terminal...</p>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-2.5 rounded-lg text-left font-medium">
                  {error}
                </div>
              )}

              {}
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wide text-left mb-1.5">
                  Email Address
                </label>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              {}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Password
                  </label>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      alert('Password recovery is managed by your system administrator.');
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 focus:outline-none focus-visible:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative rounded-md shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-700 font-medium select-none cursor-pointer">
                    Remember this device
                  </label>
                </div>
              </div>

              {}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying session...
                    </>
                  ) : (
                    'Sign In to Console'
                  )}
                </button>
              </div>

            </form>
          )}

          {!success && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
                Quick Demo Access
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@fleetops.com');
                    setPassword('admin123');
                  }}
                  className="w-full inline-flex items-center justify-between px-2 py-2.5 border border-purple-100 rounded-lg text-[10px] font-semibold text-purple-700 bg-purple-50/50 hover:bg-purple-55 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-purple-600"></span>
                    Admin
                  </span>
                  <span className="text-[8px] text-purple-400 font-medium">Autofill</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('manager@fleetops.com');
                    setPassword('manager123');
                  }}
                  className="w-full inline-flex items-center justify-between px-2 py-2.5 border border-blue-100 rounded-lg text-[10px] font-semibold text-blue-700 bg-blue-50/50 hover:bg-blue-55 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-blue-600"></span>
                    Manager
                  </span>
                  <span className="text-[8px] text-blue-400 font-medium">Autofill</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('driver@fleetops.com');
                    setPassword('driver123');
                  }}
                  className="w-full inline-flex items-center justify-between px-2 py-2.5 border border-amber-100 rounded-lg text-[10px] font-semibold text-amber-700 bg-amber-50/50 hover:bg-amber-55 transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Driver
                  </span>
                  <span className="text-[8px] text-amber-400 font-medium">Autofill</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {}
        <p className="mt-8 text-center text-xs text-slate-400">
          Authorized personnel access only. <br />
          All actions on this console are logged and audited.
        </p>
      </div>
    </div>
  );
}
