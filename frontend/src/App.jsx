import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import ManagerDashboard from './pages/ManagerDashboard';
import DriverDashboard from './pages/DriverDashboard';
import ExportHub from './pages/ExportHub';
import { INITIAL_VEHICLES, INITIAL_LOGS } from './pages/mockData';
import { api } from './api';

function App() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('fleetops_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [logs, setLogs] = useState(INITIAL_LOGS);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedVehicles = await api.getVehicles();
        if (fetchedVehicles && fetchedVehicles.length > 0) {
          setVehicles(fetchedVehicles);
        }
      } catch {
        console.warn('Backend API connection failed, running in sandbox mode with local vehicle state.');
      }

      try {
        const fetchedLogs = await api.getLogs();
        if (fetchedLogs && fetchedLogs.length > 0) {
          setLogs(fetchedLogs);
        }
      } catch {
        console.warn('Backend API connection failed, running in sandbox mode with local event logs.');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const currentUser = localStorage.getItem('fleetops_user') ? JSON.parse(localStorage.getItem('fleetops_user')) : null;

      if (hash === '#/login') {
        setView('login');
        window.scrollTo(0, 0);
      } else if (hash === '#/dashboard' || hash === '#/manager-dashboard') {
        if (currentUser && (currentUser.role === 'manager' || currentUser.role === 'admin')) {
          setView('manager-dashboard');
          window.scrollTo(0, 0);
        } else {
          window.location.hash = '#/login';
        }
      } else if (hash === '#/driver' || hash === '#/driver-dashboard') {
        if (currentUser && currentUser.role === 'driver') {
          setView('driver-dashboard');
          window.scrollTo(0, 0);
        } else {
          window.location.hash = '#/login';
        }
      } else if (hash === '#/export-hub') {
        if (currentUser && (currentUser.role === 'manager' || currentUser.role === 'admin')) {
          setView('export-hub');
          window.scrollTo(0, 0);
        } else {
          window.location.hash = '#/login';
        }
      } else {
        setView('home');
      }
    };

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (newView) => {
    if (newView === 'login') {
      window.location.hash = '#/login';
    } else if (newView === 'manager-dashboard') {
      window.location.hash = '#/dashboard';
    } else if (newView === 'driver-dashboard') {
      window.location.hash = '#/driver';
    } else if (newView === 'export-hub') {
      window.location.hash = '#/export-hub';
    } else if (newView === 'logout') {
      api.logout();
      localStorage.removeItem('fleetops_user');
      setUser(null);
      window.location.hash = '#/';
    } else {
      window.location.hash = '#/';
    }
  };

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    localStorage.setItem('fleetops_user', JSON.stringify(loggedInUser));
    if (loggedInUser.role === 'manager' || loggedInUser.role === 'admin') {
      navigateTo('manager-dashboard');
    } else if (loggedInUser.role === 'driver') {
      navigateTo('driver-dashboard');
    } else {
      navigateTo('home');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-blue-100 selection:text-blue-900 relative">
      {view === 'login' ? (
        <Login onNavigate={navigateTo} onLogin={handleLogin} />
      ) : (
        <>
          <Navbar onNavigate={navigateTo} currentView={view} user={user} />
          <main className="flex-grow">
            {view === 'manager-dashboard' ? (
              <ManagerDashboard 
                vehicles={vehicles} 
                setVehicles={setVehicles} 
                logs={logs} 
                setLogs={setLogs} 
                user={user}
              />
            ) : view === 'driver-dashboard' ? (
              <DriverDashboard 
                vehicles={vehicles} 
                setVehicles={setVehicles} 
                setLogs={setLogs}
                user={user}
              />
            ) : view === 'export-hub' ? (
              <ExportHub onNavigate={navigateTo} user={user} />
            ) : (
              <Home onNavigate={navigateTo} />
            )}
          </main>
          <Footer onNavigate={navigateTo} />
        </>
      )}
    </div>
  );
}

export default App;
