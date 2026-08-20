import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Truck,
  Clock,
  Activity,
  AlertTriangle,
  Gauge,
  Battery,
  MapPin,
  Play,
  Square,
  X,
  CheckCircle2,
  Bell,
  History,
  AlertCircle,
} from "lucide-react";
import { api } from "../api";

const getDriverNameFromEmail = (email) => {
  if (!email) return "Rajesh Kumar";
  const clean = email.toLowerCase().trim();
  if (clean === "driver@fleetops.com" || clean.startsWith("rajesh")) return "Rajesh Kumar";
  if (clean.startsWith("amit")) return "Amit Sharma";
  if (clean.startsWith("suresh")) return "Suresh Verma";
  if (clean.startsWith("vikram")) return "Vikram Singh";
  if (clean.startsWith("priya")) return "Priya Patel";
  if (clean.startsWith("anil")) return "Anil Yadav";
  if (clean.startsWith("ramesh")) return "Ramesh Gupta";
  if (clean.startsWith("deepak")) return "Deepak Reddy";
  
  const prefix = clean.split("@")[0];
  const parts = prefix.split(/[._-]/);
  return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
};

export default function DriverDashboard({
  vehicles,
  setVehicles,
  setLogs,
  user,
}) {
  const driverEmail = user?.email || "driver@fleetops.com";
  const [driverName, setDriverName] = useState(() => getDriverNameFromEmail(user?.email));

  const [activeShift, setActiveShift] = useState(false);
  const [shiftId, setShiftId] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [shiftSeconds, setShiftSeconds] = useState(0);
  const [isReporting, setIsReporting] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [incidentType, setIncidentType] = useState("Breakdown");
  const [incidentSeverity, setIncidentSeverity] = useState("medium");
  const [incidentLocation, setIncidentLocation] = useState("");
  const [incidentDesc, setIncidentDesc] = useState("");
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);

  const [driverLocationInput, setDriverLocationInput] = useState("");
  const [driverFuelInput, setDriverFuelInput] = useState("");
  const [driverPressureInput, setDriverPressureInput] = useState("");
  const [driverCargoInput, setDriverCargoInput] = useState("");

  const handleUpdateLocation = async (e) => {
    if (e) e.preventDefault();
    if (!selectedVehicleId) {
      showToast("Please select a vehicle first.", "warning");
      return;
    }
    if (!driverLocationInput.trim()) {
      showToast("Please enter a location.", "warning");
      return;
    }

    const newLoc = driverLocationInput.trim();
    try {
      await api.updateVehicleStatus(selectedVehicleId, { location: newLoc });
      setVehicles((prev) =>
        prev.map((v) => (v.id === selectedVehicleId ? { ...v, location: newLoc } : v))
      );
      showToast(`Vehicle location updated to: ${newLoc}`, "success");
      setDriverLocationInput("");
    } catch (err) {
      console.warn("Backend offline, updating location locally:", err.message);
      setVehicles((prev) =>
        prev.map((v) => (v.id === selectedVehicleId ? { ...v, location: newLoc } : v))
      );
      showToast(`Location updated to: ${newLoc}`, "success");
      setDriverLocationInput("");
    }
  };

  const handleUpdateFuelAndPressure = async (e) => {
    if (e) e.preventDefault();
    if (!selectedVehicleId) {
      showToast("Please select a vehicle first.", "warning");
      return;
    }
    if (!driverFuelInput && !driverPressureInput.trim() && !driverCargoInput.trim()) {
      showToast("Please enter fuel percentage, tire pressure, or cargo load weight.", "warning");
      return;
    }

    const updatedData = {};
    if (driverFuelInput !== "") {
      const fuelNum = Math.max(0, Math.min(100, Number(driverFuelInput)));
      updatedData.fuel = fuelNum;
    }

    const currentPressure = currentVehicle?.telemetry?.pressure || "110 psi";
    const newPressure = driverPressureInput.trim() 
      ? (driverPressureInput.trim().toLowerCase().includes("psi") ? driverPressureInput.trim() : `${driverPressureInput.trim()} psi`) 
      : currentPressure;

    const currentCargo = currentVehicle?.telemetry?.load || "General Freight (12 tons)";
    const newCargo = driverCargoInput.trim() ? driverCargoInput.trim() : currentCargo;

    updatedData.telemetry = {
      ...(currentVehicle?.telemetry || {}),
      pressure: newPressure,
      load: newCargo
    };

    try {
      await api.updateVehicleStatus(selectedVehicleId, updatedData);
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id === selectedVehicleId) {
            return {
              ...v,
              fuel: updatedData.fuel !== undefined ? updatedData.fuel : v.fuel,
              telemetry: {
                ...v.telemetry,
                pressure: newPressure,
                load: newCargo
              }
            };
          }
          return v;
        })
      );
      if (liveTelemetry) {
        setLiveTelemetry((prev) => ({
          ...prev,
          fuel: updatedData.fuel !== undefined ? updatedData.fuel : prev.fuel,
          pressure: newPressure,
          load: newCargo
        }));
      }
      showToast("Fuel, Tire Pressure & Cargo Load saved to database!", "success");
      setDriverFuelInput("");
      setDriverPressureInput("");
      setDriverCargoInput("");
    } catch (err) {
      console.warn("Backend offline, updating telematics locally:", err.message);
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id === selectedVehicleId) {
            return {
              ...v,
              fuel: updatedData.fuel !== undefined ? updatedData.fuel : v.fuel,
              telemetry: {
                ...v.telemetry,
                pressure: newPressure,
                load: newCargo
              }
            };
          }
          return v;
        })
      );
      if (liveTelemetry) {
        setLiveTelemetry((prev) => ({
          ...prev,
          fuel: updatedData.fuel !== undefined ? updatedData.fuel : prev.fuel,
          pressure: newPressure,
          load: newCargo
        }));
      }
      showToast("Fuel, Tire Pressure & Cargo Load updated locally!", "success");
      setDriverFuelInput("");
      setDriverPressureInput("");
      setDriverCargoInput("");
    }
  };

  const [localShifts, setLocalShifts] = useState([]);
  const [localIncidents, setLocalIncidents] = useState([]);

  const [liveTelemetry, setLiveTelemetry] = useState(null);

  const telemetryRef = useRef(null);
  telemetryRef.current = liveTelemetry;

  const vehiclesRef = useRef(vehicles);
  vehiclesRef.current = vehicles;

  const currentVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === selectedVehicleId) || null;
  }, [vehicles, selectedVehicleId]);

  const myAssignedVehicles = useMemo(() => {
    const cleanEmail = driverEmail.toLowerCase();
    const cleanName = driverName.toLowerCase();
    const cleanPrefix = cleanEmail.split("@")[0];
    return vehicles.filter((v) => {
      if (!v.driver) return false;
      const d = v.driver.toLowerCase();
      if (cleanEmail === "driver@fleetops.com" && (d === "rajesh kumar" || d === "driver@fleetops.com")) {
        return true;
      }
      return (
        d === cleanEmail ||
        d === cleanName ||
        d.includes(cleanName) ||
        cleanEmail.includes(d) ||
        (cleanPrefix.length > 2 && d.includes(cleanPrefix))
      );
    });
  }, [vehicles, driverEmail, driverName]);

  const availableVehicles = useMemo(() => {
    return myAssignedVehicles.length > 0
      ? myAssignedVehicles
      : vehicles.filter((v) => v.status === "Idle");
  }, [myAssignedVehicles, vehicles]);

  useEffect(() => {
    if (myAssignedVehicles.length > 0 && !selectedVehicleId) {
      setSelectedVehicleId(myAssignedVehicles[0].id);
    }
  }, [myAssignedVehicles, selectedVehicleId]);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [
      hrs.toString().padStart(2, "0"),
      mins.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":");
  };

  const showToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  useEffect(() => {
    let timer;
    if (activeShift) {
      timer = setInterval(() => {
        setShiftSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setShiftSeconds(0);
    }
    return () => clearInterval(timer);
  }, [activeShift]);

  useEffect(() => {
    if (!activeShift || !selectedVehicleId) {
      setLiveTelemetry(null);
      return;
    }

    const targetVehicle = vehicles.find((v) => v.id === selectedVehicleId);
    if (targetVehicle) {
      setLiveTelemetry({
        speed: targetVehicle.speed || 0,
        fuel: targetVehicle.fuel || 80,
        temp: targetVehicle.telemetry?.temp || 180,
        pressure: targetVehicle.telemetry?.pressure || "110 psi",
        location: targetVehicle.location || "Depot Base",
        load: targetVehicle.telemetry?.load || "General Freight (12 tons)",
      });
    }
  }, [activeShift, selectedVehicleId, vehicles]);

  const handleStartShift = async () => {
    if (!selectedVehicleId) {
      showToast("Please select a vehicle first.", "warning");
      return;
    }

    try {
      const result = await api.startShift(driverName, selectedVehicleId);

      setActiveShift(true);
      setShiftId(result.shift?.id || Date.now().toString());

      showToast(`Shift started on vehicle ${selectedVehicleId}`, "success");
    } catch (err) {
      console.warn("Backend offline, starting shift locally.", err.message);
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id === selectedVehicleId) {
            return { ...v, driver: driverName, status: "En Route", speed: 55 };
          }
          return v;
        }),
      );

      const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const newLog = {
        id: Date.now(),
        timestamp: time,
        vehicleId: selectedVehicleId,
        event: `Driver ${driverName} started shift. Status: En Route.`,
        type: "success",
      };
      setLogs((prev) => [newLog, ...prev.slice(0, 19)]);

      setActiveShift(true);
      setShiftId(Date.now().toString());
      showToast(
        `Shift started locally (Offline) on ${selectedVehicleId}`,
        "success",
      );
    }
  };

  const handleEndShift = async () => {
    if (!activeShift) return;

    const currentVehicleId = selectedVehicleId;
    const durationStr = formatTime(shiftSeconds);

    try {
      await api.endShift(shiftId);

      const completedShift = {
        id: shiftId,
        vehicleId: currentVehicleId,
        date: new Date().toLocaleDateString(),
        duration: durationStr,
        status: "Completed",
      };
      setLocalShifts((prev) => [completedShift, ...prev]);

      setActiveShift(false);
      setShiftId(null);
      setSelectedVehicleId("");
      setLiveTelemetry(null);

      showToast(`Shift completed! Duration: ${durationStr}`, "success");
    } catch (err) {
      console.warn("Backend offline, ending shift locally.", err.message);

      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id === currentVehicleId) {
            return { ...v, driver: "N/A", status: "Idle", speed: 0 };
          }
          return v;
        }),
      );

      const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const newLog = {
        id: Date.now(),
        timestamp: time,
        vehicleId: currentVehicleId,
        event: `Driver ${driverName} ended shift. Status: Idle.`,
        type: "info",
      };
      setLogs((prev) => [newLog, ...prev.slice(0, 19)]);

      const completedShift = {
        id: shiftId || Date.now().toString(),
        vehicleId: currentVehicleId,
        date: new Date().toLocaleDateString(),
        duration: durationStr,
        status: "Completed",
      };
      setLocalShifts((prev) => [completedShift, ...prev]);

      setActiveShift(false);
      setShiftId(null);
      setSelectedVehicleId("");
      setLiveTelemetry(null);

      showToast(
        `Shift completed locally (Offline)! Duration: ${durationStr}`,
        "success",
      );
    }
  };

  const handleSubmitIncident = async (e) => {
    e.preventDefault();
    if (!selectedVehicleId) {
      showToast(
        "You must have an active vehicle to file an incident.",
        "warning",
      );
      return;
    }
    if (!incidentDesc.trim() || !incidentLocation.trim()) {
      showToast("Please fill in location and description.", "warning");
      return;
    }

    setIsSubmittingIncident(true);

    const incidentData = {
      vehicleId: selectedVehicleId,
      driverName: driverName,
      type: incidentType,
      severity: incidentSeverity,
      location: incidentLocation,
      description: incidentDesc,
    };

    try {
      await api.reportIncident(incidentData);

      setLocalIncidents((prev) => [
        {
          id: Date.now().toString(),
          ...incidentData,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...prev,
      ]);

      setIncidentLocation("");
      setIncidentDesc("");
      setIsReporting(false);
      showToast("Incident reported successfully!", "warning");
    } catch (err) {
      console.warn("Backend offline, reporting incident locally.", err.message);

      const newAlert = {
        id: "alert-" + Date.now(),
        severity:
          incidentSeverity === "high"
            ? "high"
            : incidentSeverity === "medium"
              ? "medium"
              : "low",
        type: incidentType,
        message: incidentDesc,
      };

      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id === selectedVehicleId) {
            return {
              ...v,
              alerts: [...v.alerts, newAlert],
            };
          }
          return v;
        }),
      );

      const time = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const newLog = {
        id: Date.now() + Math.random(),
        timestamp: time,
        vehicleId: selectedVehicleId,
        event: `Incident Reported (${incidentType}): ${incidentDesc}`,
        type: incidentSeverity === "high" ? "warning" : "info",
      };
      setLogs((prev) => [newLog, ...prev.slice(0, 19)]);

      setLocalIncidents((prev) => [
        {
          id: Date.now().toString(),
          ...incidentData,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        ...prev,
      ]);

      setIncidentLocation("");
      setIncidentDesc("");
      setIsReporting(false);
      showToast("Incident reported locally (Offline)", "warning");
    } finally {
      setIsSubmittingIncident(false);
    }
  };

  const handleToggleStatus = async (newStatus) => {
    if (!activeShift || !selectedVehicleId) return;

    try {
      const speedVal = newStatus === "En Route" ? 55 : 0;
      await api.updateVehicleStatus(selectedVehicleId, {
        status: newStatus,
        speed: speedVal,
      });

      if (liveTelemetry) {
        setLiveTelemetry((prev) => ({
          ...prev,
          status: newStatus,
          speed: speedVal,
        }));
      }

      showToast(`Status toggled to ${newStatus}`, "info");
    } catch (err) {
      console.warn("Backend offline, toggling status locally:", err.message);
      const speedVal = newStatus === "En Route" ? 55 : 0;
      setVehicles((prev) =>
        prev.map((v) => {
          if (v.id === selectedVehicleId) {
            return { ...v, status: newStatus, speed: speedVal };
          }
          return v;
        }),
      );
      if (liveTelemetry) {
        setLiveTelemetry((prev) => ({
          ...prev,
          speed: speedVal,
        }));
      }
      showToast(`Status toggled to ${newStatus} locally`, "info");
    }
  };

  return (
    <div className="bg-slate-50/50 min-h-screen text-slate-900 flex flex-col font-sans antialiased relative">
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3.5 rounded-xl border shadow-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-3 duration-250 backdrop-blur-md pointer-events-auto ${
              toast.type === "warning"
                ? "bg-red-50/95 border-red-200 text-red-900"
                : toast.type === "success"
                  ? "bg-emerald-50/95 border-emerald-200 text-emerald-950"
                  : "bg-blue-50/95 border-blue-200 text-blue-950"
            }`}
          >
            {toast.type === "warning" && (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            {toast.type === "success" && (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            {toast.type === "info" && (
              <Bell className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide opacity-75">
                {toast.type === "warning"
                  ? "Alert System"
                  : toast.type === "success"
                    ? "System Success"
                    : "Notification"}
              </p>
              <p className="text-sm font-semibold mt-0.5">{toast.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              Driver Operations Terminal
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                  activeShift
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    activeShift ? "bg-emerald-500 animate-ping" : "bg-slate-400"
                  }`}
                ></span>
                {activeShift ? "On Shift" : "Off Duty"}
              </span>
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Select vehicle, toggle operation statuses, check engine
              diagnostics and report incidents on duty.
            </p>
          </div>

          <div className="text-right text-xs font-bold bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-xs self-start md:self-auto">
            <span className="text-slate-400 font-normal">OPERATOR: </span>
            <span className="text-slate-900 font-extrabold mr-2">
              {driverName}
            </span>
            <span className="text-blue-600 font-mono font-normal border-l border-slate-200 pl-2 select-all">
              {driverEmail}
            </span>
          </div>
        </div>



        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Clock className="w-5 h-5 text-blue-600" />
                Shift Controller
              </h2>

              {!activeShift ? (
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="driver-name-input"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2"
                    >
                      Driver Name
                    </label>
                    <input
                      id="driver-name-input"
                      type="text"
                      placeholder="Enter driver name"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full text-sm text-slate-950 border border-slate-300 rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor="vehicle-select"
                        className="block text-xs font-bold text-slate-700 uppercase tracking-wide"
                      >
                        Assigned Fleet Vehicle
                      </label>
                      {myAssignedVehicles.length > 0 ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          ✓ Assigned by Manager
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Unassigned
                        </span>
                      )}
                    </div>

                    <select
                      id="vehicle-select"
                      value={selectedVehicleId}
                      onChange={(e) => setSelectedVehicleId(e.target.value)}
                      className="w-full text-sm text-slate-950 border border-slate-300 rounded-xl px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50/50 cursor-pointer font-semibold"
                    >
                      <option value="">
                        -- Select Assigned Vehicle --
                      </option>
                      {availableVehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.id} - {v.type} ({v.driver ? `Driver: ${v.driver}` : 'Unassigned'})
                        </option>
                      ))}
                    </select>

                    {myAssignedVehicles.length === 0 && (
                      <p className="text-[11px] text-slate-500 font-medium mt-1.5 leading-tight">
                        ℹ️ Manager can assign a vehicle to your account ({driverEmail}) from the Manager Dashboard.
                      </p>
                    )}
                  </div>

                  {currentVehicle && (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 space-y-2.5 text-xs text-slate-600 font-medium">
                      <div className="flex justify-between">
                        <span>Vehicle Class:</span>
                        <strong className="text-slate-800">
                          {currentVehicle.type}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Fuel/Battery Level:</span>
                        <strong className="text-slate-800">
                          {currentVehicle.fuel}%
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Location:</span>
                        <strong className="text-slate-800">
                          {currentVehicle.location}
                        </strong>
                      </div>
                      {currentVehicle.alerts.length > 0 && (
                        <div className="border-t border-blue-200/50 pt-2 flex items-center gap-1.5 text-red-600 font-bold">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>
                            {currentVehicle.alerts.length} Active System
                            Warnings!
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleStartShift}
                    disabled={!selectedVehicleId}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-slate-200 disabled:text-slate-450 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <Play className="w-4.5 h-4.5 fill-white" />
                    Start Shift Session
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-slate-900 border border-slate-950 text-white rounded-2xl p-5 text-center shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block relative z-10">
                      Active Duty Duration
                    </span>
                    <span className="text-3xl font-black font-mono tracking-wider mt-1.5 block text-emerald-400 relative z-10">
                      {formatTime(shiftSeconds)}
                    </span>
                    <span className="text-xs text-slate-400 mt-1 block relative z-10">
                      Assigned Vehicle:{" "}
                      <strong className="text-white">
                        {selectedVehicleId}
                      </strong>
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Operational Status Updates
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleToggleStatus("En Route")}
                        className={`py-2.5 text-xs font-bold border rounded-xl transition-all cursor-pointer text-center ${
                          currentVehicle?.status === "En Route"
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm animate-pulse-subtle"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        En Route
                      </button>
                      <button
                        onClick={() => handleToggleStatus("Idle")}
                        className={`py-2.5 text-xs font-bold border rounded-xl transition-all cursor-pointer text-center ${
                          currentVehicle?.status === "Idle"
                            ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        Idle (At Depot)
                      </button>
                      <button
                        onClick={() => handleToggleStatus("On Break")}
                        className={`py-2.5 text-xs font-bold border rounded-xl transition-all cursor-pointer text-center ${
                          currentVehicle?.status === "On Break"
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        On Break
                      </button>
                      <button
                        onClick={() => handleToggleStatus("Loading")}
                        className={`py-2.5 text-xs font-bold border rounded-xl transition-all cursor-pointer text-center ${
                          currentVehicle?.status === "Loading"
                            ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        Loading / Unloading
                      </button>
                    </div>
                  </div>

                  {/* Driver Location Update Card */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                      <span>Update Current Location</span>
                      <span className="text-[10px] text-blue-600 font-normal">
                        Active: <strong>{currentVehicle?.location || "Depot Base"}</strong>
                      </span>
                    </label>
                    <form onSubmit={handleUpdateLocation} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Sector 4, Downtown Depot, Chicago IL"
                        value={driverLocationInput}
                        onChange={(e) => setDriverLocationInput(e.target.value)}
                        className="flex-grow text-xs text-slate-900 border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        Update Location
                      </button>
                    </form>
                  </div>

                  <div className="flex flex-col gap-2 border-t border-slate-100 pt-5">
                    <button
                      onClick={() => setIsReporting(true)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 border border-red-200 rounded-xl text-sm font-semibold text-red-700 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <AlertTriangle className="w-4.5 h-4.5" />
                      Report Road/Vehicle Incident
                    </button>
                    <button
                      onClick={handleEndShift}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 border border-transparent rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 transition-colors cursor-pointer"
                    >
                      <Square className="w-4.5 h-4.5 fill-white" />
                      End Shift Session
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <History className="w-4.5 h-4.5 text-slate-500" />
                Driver Shift Records (Session)
              </h3>

              <div className="mt-4 space-y-3 max-h-48 overflow-y-auto pr-1">
                {localShifts.length > 0 ? (
                  localShifts.map((shift, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs border-b border-slate-50 pb-2.5"
                    >
                      <div>
                        <strong className="text-slate-900">
                          {shift.vehicleId}
                        </strong>
                        <span className="text-slate-400 block text-[10px] font-semibold mt-0.5">
                          {shift.date}
                        </span>
                      </div>
                      <span className="font-mono bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-slate-700">
                        {shift.duration}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6 font-medium">
                    No shifts completed in this session.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {activeShift && liveTelemetry ? (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-6">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Vehicle Diagnostics & Telematics
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Remaining Fuel */}
                  <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-4 flex items-center gap-4">
                    <div className="bg-emerald-100/60 p-3 rounded-lg text-emerald-600">
                      <Battery className="w-6 h-6" />
                    </div>
                    <div className="flex-grow">
                      <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">
                        Remaining Fuel
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <strong className="text-xl font-black text-slate-900">
                          {liveTelemetry.fuel}%
                        </strong>
                        <div className="flex-grow bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-350/10">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              liveTelemetry.fuel < 25
                                ? "bg-red-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${liveTelemetry.fuel}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tire Pressure */}
                  <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-4 flex items-center gap-4">
                    <div className="bg-blue-100/60 p-3 rounded-lg text-blue-600">
                      <Gauge className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">
                        Tire Pressure
                      </span>
                      <strong className="text-xl font-black text-slate-900">
                        {liveTelemetry.pressure || currentVehicle?.telemetry?.pressure || "110 psi"}
                      </strong>
                    </div>
                  </div>

                  {/* Cargo Load */}
                  <div className="bg-slate-50/50 border border-slate-200/80 rounded-xl p-4 flex items-center gap-4 sm:col-span-2">
                    <div className="bg-slate-100 p-3 rounded-lg text-slate-600">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">
                        Cargo Load Weight
                      </span>
                      <strong className="text-sm font-bold text-slate-800">
                        {currentVehicle?.telemetry?.load || "General Freight (12 tons)"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Driver Update Form for Telematics (Fuel, Tire Pressure, Cargo Load) */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
                    Driver Telematics Update Form
                  </h3>

                  <form onSubmit={handleUpdateFuelAndPressure} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                          Fuel Level (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          placeholder={`Current: ${liveTelemetry.fuel}%`}
                          value={driverFuelInput}
                          onChange={(e) => setDriverFuelInput(e.target.value)}
                          className="w-full text-xs text-slate-900 border border-slate-300 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                          Tire Pressure (psi)
                        </label>
                        <input
                          type="text"
                          placeholder={`Current: ${liveTelemetry.pressure || '110 psi'}`}
                          value={driverPressureInput}
                          onChange={(e) => setDriverPressureInput(e.target.value)}
                          className="w-full text-xs text-slate-900 border border-slate-300 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Cargo Load Weight / Description
                      </label>
                      <input
                        type="text"
                        placeholder={`Current: ${liveTelemetry.load || currentVehicle?.telemetry?.load || 'Produce (22 tons)'}`}
                        value={driverCargoInput}
                        onChange={(e) => setDriverCargoInput(e.target.value)}
                        className="w-full text-xs text-slate-900 border border-slate-300 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Battery className="w-4 h-4" />
                      Save Fuel, Pressure & Cargo Updates
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-full text-slate-400 mb-4">
                  <Truck className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  No Shift Session Active
                </h3>
                <p className="text-xs text-slate-450 mt-1 max-w-xs leading-relaxed font-medium">
                  Please select an available vehicle in the Shift Controller on
                  the left, then click Start Shift to initialize telemetry
                  tracking.
                </p>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-950 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
                My Incident Logs (Session)
              </h3>

              <div className="mt-4 space-y-3.5 max-h-48 overflow-y-auto pr-1">
                {localIncidents.length > 0 ? (
                  localIncidents.map((incident, idx) => (
                    <div
                      key={idx}
                      className="text-xs border-b border-slate-50 pb-3 flex items-start justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                              incident.severity === "high"
                                ? "bg-red-100 text-red-700"
                                : incident.severity === "medium"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {incident.severity}
                          </span>
                          <strong className="text-slate-900">
                            {incident.type}
                          </strong>
                        </div>
                        <p className="text-slate-650 font-semibold">
                          {incident.description}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                        {incident.timestamp}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6 font-medium">
                    No incidents reported in this session.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isReporting && (
        <>
          <div
            onClick={() => setIsReporting(false)}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
          />

          <div className="fixed top-0 right-0 z-50 h-screen w-full sm:w-[420px] bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-950 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-650" />
                  Report Incident
                </h3>
                <p className="text-xs text-slate-405 font-semibold mt-0.5">
                  Asset Warning Dispatcher
                </p>
              </div>
              <button
                onClick={() => setIsReporting(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitIncident}
              className="flex-grow flex flex-col justify-between overflow-hidden"
            >
              <div className="flex-grow overflow-y-auto p-6 space-y-5">
                <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold">
                    Active Fleet Vehicle:
                  </span>
                  <strong className="text-slate-900 font-mono text-sm">
                    {selectedVehicleId}
                  </strong>
                </div>

                <div>
                  <label
                    htmlFor="incident-type"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2"
                  >
                    Incident Type
                  </label>
                  <select
                    id="incident-type"
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="w-full text-sm text-slate-950 border border-slate-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 cursor-pointer"
                  >
                    <option value="Breakdown">
                      Vehicle Breakdown / Engine Fault
                    </option>
                    <option value="Accident">Accident / Collision</option>
                    <option value="Fuel/Refill">
                      Refuel / Critical Recharging
                    </option>
                    <option value="Route Block">
                      Traffic / Road Block / Closure
                    </option>
                    <option value="Weather Delay">Severe Weather Hazard</option>
                    <option value="Medical Alert">
                      Medical / Crew Emergency
                    </option>
                    <option value="Other">Other Operational Issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                    Severity Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["low", "medium", "high"].map((severity) => (
                      <button
                        key={severity}
                        type="button"
                        onClick={() => setIncidentSeverity(severity)}
                        className={`py-2 text-xs font-bold border rounded-xl transition-all cursor-pointer uppercase text-center ${
                          incidentSeverity === severity
                            ? severity === "high"
                              ? "bg-red-50 text-red-700 border-red-300 shadow-3xs"
                              : severity === "medium"
                                ? "bg-amber-50 text-amber-700 border-amber-300 shadow-3xs"
                                : "bg-blue-50 text-blue-700 border-blue-300 shadow-3xs"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {severity}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="incident-location"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2"
                  >
                    Current Location (City, State / Landmark)
                  </label>
                  <input
                    id="incident-location"
                    type="text"
                    required
                    placeholder="e.g. Denver, CO / Hwy 70 East"
                    value={incidentLocation}
                    onChange={(e) => setIncidentLocation(e.target.value)}
                    className="w-full text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50/50"
                  />
                </div>

                <div>
                  <label
                    htmlFor="incident-desc"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2"
                  >
                    Detailed Report / Description
                  </label>
                  <textarea
                    id="incident-desc"
                    required
                    rows="4"
                    placeholder="Provide details about the issue to alert dispatch controllers..."
                    value={incidentDesc}
                    onChange={(e) => setIncidentDesc(e.target.value)}
                    className="w-full text-slate-900 placeholder-slate-400 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsReporting(false)}
                  className="w-1/3 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingIncident}
                  className="w-2/3 py-3 border border-transparent rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors cursor-pointer text-center"
                >
                  {isSubmittingIncident
                    ? "Submitting..."
                    : "Submit Alert Dispatch"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
