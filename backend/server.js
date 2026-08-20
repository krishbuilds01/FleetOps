import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import User from './models/User.js';
import Vehicle from './models/Vehicle.js';
import Log from './models/Log.js';
import Shift from './models/Shift.js';
import Incident from './models/Incident.js';
import Report from './models/Report.js';
import Query from './models/Query.js';

import { verifyRole, loginUser, MOCK_USERS, addMockUser } from './auth.js';
import { validateLogin, validateRegister } from './validators.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Disable mongoose command buffering globally so queries fail fast on connection errors
mongoose.set('bufferCommands', false);

// Try loading environment variables from process.cwd() first, fallback to backend/.env relative to this file
dotenv.config();
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve(__dirname, '.env') });
}

const app = express();
const PORT = process.env.PORT || 5000;
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fleetops';
if (MONGODB_URI) {
  MONGODB_URI = MONGODB_URI.trim();
  if (MONGODB_URI.toLowerCase().startsWith('mongodb_uri=')) {
    MONGODB_URI = MONGODB_URI.substring('mongodb_uri='.length).trim();
  }
  MONGODB_URI = MONGODB_URI.replace(/^['"=\s]+|['"\s]+$/g, '');

  // Auto-correct missing .mongodb.net suffix in the cluster hostname
  if (MONGODB_URI.includes('@') && !MONGODB_URI.includes('.mongodb.net') && !MONGODB_URI.includes('localhost') && !MONGODB_URI.includes('127.0.0.1')) {
    const parts = MONGODB_URI.split('@');
    const hostAndRest = parts[1];
    const slashIdx = hostAndRest.indexOf('/');
    const questIdx = hostAndRest.indexOf('?');
    let endIdx = hostAndRest.length;
    if (slashIdx !== -1 && questIdx !== -1) endIdx = Math.min(slashIdx, questIdx);
    else if (slashIdx !== -1) endIdx = slashIdx;
    else if (questIdx !== -1) endIdx = questIdx;
    
    const host = hostAndRest.substring(0, endIdx);
    const rest = hostAndRest.substring(endIdx);
    if (!host.endsWith('.mongodb.net')) {
      MONGODB_URI = `${parts[0]}@${host}.mongodb.net${rest}`;
    }
  }
}

app.use(cors());
app.use(express.json());

let dbConnectionError = null;

// Database connection middleware to ensure connection on serverless functions
const connectDbMiddleware = async (req, res, next) => {
  if (MONGODB_URI && mongoose.connection.readyState === 0) {
    console.log(`Connecting to MongoDB (${MONGODB_URI})... Current state: ${mongoose.connection.readyState}`);
    try {
      await mongoose.connect(MONGODB_URI);
      dbConnectionError = null;
    } catch (err) {
      console.error('❌ Database connection middleware error:', err.message);
      dbConnectionError = err.message;
    }
  }

  // If connection is in state 2 (connecting), wait up to 3 seconds for it to establish
  if (mongoose.connection.readyState === 2) {
    let checkCount = 0;
    while (mongoose.connection.readyState === 2 && checkCount < 30) {
      await new Promise(resolve => setTimeout(resolve, 100));
      checkCount++;
    }
  }

  // If database connection is not established, fail fast instead of letting queries hang
  if (MONGODB_URI && mongoose.connection.readyState !== 1) {
    return res.status(500).json({
      error: `Database connection error: Connection state is ${mongoose.connection.readyState}. Details: ${dbConnectionError || 'Unknown connection error.'}`
    });
  }
  next();
};

app.use(connectDbMiddleware);

// Verify MongoDB URI is present and connect
if (!MONGODB_URI) {
  console.warn('⚠️ MONGODB_URI is not defined.');
} else {
  mongoose.connect(MONGODB_URI)
    .then(async () => {
      console.log(`✅ Connected to MongoDB (${MONGODB_URI}) successfully.`);
      dbConnectionError = null;
      await seedDatabase();
    })
    .catch(err => {
      console.error('❌ MongoDB connection error:', err.message);
      dbConnectionError = `${err.message}`;
    });
}

// Format shift time logs helper
const getFormattedTime = () => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// Global Indian Mock Report Data for seeding and fallback
const MOCK_REPORT_DATA = [
  { date: new Date(), vehId: 'TRK-101', driver: 'Rajesh Kumar', status: 'En Route', shift: '08:00 IST', hours: '4.5', note: 'Mumbai to Pune transit active' },
  { date: new Date(), vehId: 'TRK-102', driver: 'Amit Sharma', status: 'En Route', shift: '08:15 IST', hours: '4.2', note: 'Delhi to Jaipur expressway clear' },
  { date: new Date(), vehId: 'TRK-106', driver: 'Anil Yadav', status: 'Maintenance', shift: '07:15 IST', hours: '2.0', note: 'Kolkata dock tire pressure service' },
  { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), vehId: 'TRK-103', driver: 'Suresh Verma', status: 'En Route', shift: '09:00 IST', hours: '6.0', note: 'Bengaluru to Chennai corridor' },
  { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), vehId: 'TRK-105', driver: 'Priya Patel', status: 'En Route', shift: '08:00 IST', hours: '7.5', note: 'Hyderabad to Vijayawada highway' },
  { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), vehId: 'TRK-104', driver: 'Vikram Singh', status: 'Idle', shift: '10:00 IST', hours: '5.0', note: 'Ahmedabad Logistics Yard' }
];

// Database seeding helper for Indian Fleet Data
async function seedDatabase() {
  try {
    // 1. Seed Users
    await User.deleteMany({});
    console.log('🌱 Seeding Indian Fleet users...');
    const seedUsers = [
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
    await User.insertMany(seedUsers);
    console.log('✅ Seeding users completed.');

    // 2. Seed Vehicles with Indian Drivers, Models, & Locations
    await Vehicle.deleteMany({});
    console.log('🌱 Seeding Indian Fleet vehicles in MongoDB...');
    const seedVehicles = [
      {
        id: 'TRK-101',
        driver: 'Rajesh Kumar',
        type: 'Tata Prima 4928.S (Heavy Hauler)',
        status: 'En Route',
        fuel: 85,
        speed: 55,
        location: 'Mumbai Central Logistics Hub (MH)',
        destination: 'Pune Industrial Corridor',
        telemetry: { temp: 185, load: 'Cotton Bales (24 tons)', pressure: '115 psi' },
        alerts: []
      },
      {
        id: 'TRK-102',
        driver: 'Amit Sharma',
        type: 'Ashok Leyland Captain 4019',
        status: 'En Route',
        fuel: 92,
        speed: 48,
        location: 'Delhi-NCR Freight Expressway (DL)',
        destination: 'Jaipur Transport Hub',
        telemetry: { temp: 180, load: 'Auto Spare Parts (14 tons)', pressure: '110 psi' },
        alerts: []
      },
      {
        id: 'TRK-103',
        driver: 'Suresh Verma',
        type: 'BharatBenz 2823C Tipper',
        status: 'En Route',
        fuel: 76,
        speed: 52,
        location: 'Bengaluru Electronic City Gate (KA)',
        destination: 'Chennai Sea Port Terminal',
        telemetry: { temp: 190, load: 'Electronics & Chips (8.5 tons)', pressure: '108 psi' },
        alerts: []
      },
      {
        id: 'TRK-104',
        driver: 'Vikram Singh',
        type: 'Eicher Pro 6028 Cargo',
        status: 'Idle',
        fuel: 68,
        speed: 0,
        location: 'Ahmedabad Logistics Park (GJ)',
        destination: 'Surat Textile Hub',
        telemetry: { temp: 82, load: 'Textile Fabric Rolls (10 tons)', pressure: '105 psi' },
        alerts: []
      },
      {
        id: 'TRK-105',
        driver: 'Priya Patel',
        type: 'Mahindra Blazo X 49',
        status: 'En Route',
        fuel: 88,
        speed: 60,
        location: 'Hyderabad Outer Ring Highway (TS)',
        destination: 'Vijayawada Freight Terminal',
        telemetry: { temp: 188, load: 'Pharmaceutical Supplies (5 tons)', pressure: '112 psi' },
        alerts: []
      },
      {
        id: 'TRK-106',
        driver: 'Anil Yadav',
        type: 'Tata Signa 4825.T Multi-Axle',
        status: 'Maintenance',
        fuel: 25,
        speed: 0,
        location: 'Kolkata Haldia Dock Complex (WB)',
        destination: 'Maintenance Workshop Yard 4',
        telemetry: { temp: 220, load: 'Iron Ore (28 tons)', pressure: '95 psi' },
        alerts: [{ id: 'a1', severity: 'high', type: 'Tire Pressure Warning', message: 'Low tire pressure on rear tandem axle (95 psi)' }]
      },
      {
        id: 'TRK-107',
        driver: 'Ramesh Gupta',
        type: 'Eicher Pro 3019 Intercity Truck',
        status: 'Idle',
        fuel: 95,
        speed: 0,
        location: 'Indore Transport Yard (MP)',
        destination: 'Bhopal Central Depot',
        telemetry: { temp: 78, load: 'Agricultural Produce (16 tons)', pressure: '110 psi' },
        alerts: []
      },
      {
        id: 'TRK-108',
        driver: 'Deepak Reddy',
        type: 'BharatBenz 1617R Reefer Truck',
        status: 'En Route',
        fuel: 82,
        speed: 50,
        location: 'Kochi Container Terminal (KL)',
        destination: 'Coimbatore Cold Storage Yard',
        telemetry: { temp: 175, load: 'Refrigerated Dairy (12 tons)', pressure: '108 psi' },
        alerts: []
      }
    ];
    await Vehicle.insertMany(seedVehicles);
    console.log('✅ Seeding Indian vehicles completed.');

    // 3. Seed Logs
    await Log.deleteMany({});
    console.log('🌱 Seeding Indian Fleet logs...');
    const seedLogs = [
      { timestamp: '02:30 PM', vehicleId: 'TRK-101', event: 'Driver Rajesh Kumar updated location to Mumbai Central Logistics Hub', type: 'info' },
      { timestamp: '02:15 PM', vehicleId: 'TRK-105', event: 'Driver Priya Patel departed Hyderabad Outer Ring Highway', type: 'success' },
      { timestamp: '01:50 PM', vehicleId: 'TRK-106', event: 'Low tire pressure warning detected at Kolkata Dock Complex', type: 'warning' },
      { timestamp: '01:20 PM', vehicleId: 'TRK-103', event: 'Arrived at Bengaluru Electronic City Gate', type: 'success' }
    ];
    await Log.insertMany(seedLogs);
    console.log('✅ Seeding logs completed.');

    // 4. Seed Reports
    await Report.deleteMany({});
    console.log('🌱 Seeding Indian Fleet report data...');
    await Report.insertMany(MOCK_REPORT_DATA);
    console.log('✅ Seeding reports completed.');
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  }
}



// Server Health Endpoints
app.get('/', (req, res) => {
  res.json({ message: 'FleetOps REST API with MongoDB is running.' });
});

app.get('/api/health', (req, res) => {
  const uriSnippet = MONGODB_URI ? `${MONGODB_URI.substring(0, 15)}... [length: ${MONGODB_URI.length}]` : null;
  let hostPart = null;
  let sanitizedUri = null;
  if (MONGODB_URI) {
    const parts = MONGODB_URI.split('@');
    if (parts.length > 1) {
      hostPart = parts[1].split('/')[0].split('?')[0];
    }
    // Replace password with asterisks: mongodb+srv://username:password@host/db -> mongodb+srv://username:****@host/db
    sanitizedUri = MONGODB_URI.replace(/:([^:@]+)@/, ':****@');
  }
  res.json({
    status: 'healthy',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    databaseState: mongoose.connection.readyState,
    hasMongoUri: !!MONGODB_URI,
    mongoUriSnippet: uriSnippet,
    mongoUriHost: hostPart,
    mongoUriSanitized: sanitizedUri,
    connectionError: dbConnectionError,
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// Authentication Endpoint
app.post('/api/auth/login', validateLogin, loginUser);

// Driver Registration Endpoint (Admin only)
app.post('/api/auth/register-driver', verifyRole(['admin']), validateRegister, async (req, res) => {
  const { email, password } = req.body;
  const emailLower = email.toLowerCase();

  // Handle in-memory fallback if MongoDB is not configured
  if (!MONGODB_URI) {
    console.log('MongoDB not configured. Using in-memory fallback for driver registration.');
    const added = addMockUser(emailLower, password, 'driver');
    if (!added) {
      return res.status(400).json({ error: 'A user with this email is already registered.' });
    }
    return res.status(201).json({
      success: true,
      user: {
        email: emailLower,
        role: 'driver'
      }
    });
  }

  try {
    const newUser = new User({
      email: emailLower,
      password,
      role: 'driver'
    });
    await newUser.save();

    // Create system log for registration
    const newLog = new Log({
      timestamp: getFormattedTime(),
      vehicleId: 'SYSTEM',
      event: `Admin registered new driver: ${emailLower}`,
      type: 'success'
    });
    await newLog.save();

    res.status(201).json({
      success: true,
      user: {
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Drivers List Endpoint (Admin & Manager)
app.get('/api/drivers', verifyRole(['admin', 'manager']), async (req, res) => {
  // Handle in-memory fallback if MongoDB is not configured
  if (!MONGODB_URI) {
    const drivers = MOCK_USERS.filter(u => u.role === 'driver').map(u => ({
      email: u.email,
      role: u.role,
      createdAt: new Date()
    }));
    return res.json(drivers);
  }

  try {
    const drivers = await User.find({ role: 'driver' }).select('-password').sort({ createdAt: -1 });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Vehicle Endpoints
app.get('/api/vehicles', async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/vehicles/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, speed, fuel, location, telemetry, alerts, driver } = req.body;

  try {
    const vehicle = await Vehicle.findOne({ id });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    if (status !== undefined) vehicle.status = status;
    if (speed !== undefined) vehicle.speed = speed;
    if (fuel !== undefined) vehicle.fuel = fuel;
    if (location !== undefined) vehicle.location = location;
    if (driver !== undefined) vehicle.driver = driver;
    if (telemetry !== undefined) {
      vehicle.telemetry = {
        ...vehicle.telemetry,
        ...telemetry
      };
    }
    if (alerts !== undefined) vehicle.alerts = alerts;

    await vehicle.save();
    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vehicles/:id/select', async (req, res) => {
  const { id } = req.params;
  const { driverName } = req.body;

  try {
    const vehicle = await Vehicle.findOne({ id });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    vehicle.driver = driverName;
    await vehicle.save();
    
    const newLog = new Log({
      timestamp: getFormattedTime(),
      vehicleId: id,
      event: `Assigned to driver: ${driverName}`,
      type: 'info'
    });
    await newLog.save();

    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vehicles/:id/deselect', async (req, res) => {
  const { id } = req.params;

  try {
    const vehicle = await Vehicle.findOne({ id });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    const driverName = vehicle.driver;
    vehicle.driver = 'N/A';
    await vehicle.save();
    
    const newLog = new Log({
      timestamp: getFormattedTime(),
      vehicleId: id,
      event: `Unassigned driver: ${driverName}`,
      type: 'info'
    });
    await newLog.save();

    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Shift Endpoints
app.get('/api/shifts', async (req, res) => {
  try {
    const shifts = await Shift.find();
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shifts/start', async (req, res) => {
  const { driverName, vehicleId } = req.body;
  if (!driverName || !vehicleId) {
    return res.status(400).json({ error: 'Please provide driverName and vehicleId.' });
  }

  try {
    const vehicle = await Vehicle.findOne({ id: vehicleId });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    vehicle.driver = driverName;
    vehicle.status = 'En Route';
    vehicle.speed = 55; 
    await vehicle.save();

    const newShift = new Shift({
      driverName,
      vehicleId,
      startTime: new Date(),
      endTime: null,
      status: 'Active'
    });
    await newShift.save();

    const newLog = new Log({
      timestamp: getFormattedTime(),
      vehicleId,
      event: `Driver ${driverName} started shift. Status: En Route.`,
      type: 'success'
    });
    await newLog.save();

    res.json({ shift: newShift, vehicle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shifts/end', async (req, res) => {
  const { shiftId } = req.body;

  try {
    let shift;
    if (shiftId) {
      shift = await Shift.findOne({ id: shiftId });
    } else {
      shift = await Shift.findOne({ status: 'Active' }).sort({ createdAt: -1 });
    }

    if (!shift) {
      return res.status(404).json({ error: 'No active shift found.' });
    }

    shift.endTime = new Date();
    shift.status = 'Completed';
    await shift.save();

    const vehicle = await Vehicle.findOne({ id: shift.vehicleId });
    if (vehicle) {
      vehicle.status = 'Idle';
      vehicle.speed = 0;
      vehicle.driver = 'N/A';
      await vehicle.save();
    }

    const newLog = new Log({
      timestamp: getFormattedTime(),
      vehicleId: shift.vehicleId,
      event: `Driver ${shift.driverName} ended shift. Status: Idle.`,
      type: 'info'
    });
    await newLog.save();

    res.json({ shift, vehicle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Incident Endpoints
app.get('/api/incidents', async (req, res) => {
  try {
    const incidents = await Incident.find();
    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/incidents', async (req, res) => {
  const { vehicleId, driverName, type, severity, location, description } = req.body;
  if (!vehicleId || !type || !severity) {
    return res.status(400).json({ error: 'Missing required incident fields.' });
  }

  try {
    const vehicle = await Vehicle.findOne({ id: vehicleId });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found.' });
    }

    const newIncident = new Incident({
      vehicleId,
      driverName: driverName || 'Unknown',
      type,
      severity,
      location: location || 'Unknown',
      description,
      timestamp: new Date()
    });
    await newIncident.save();

    const newAlert = {
      id: 'alert-' + Date.now(),
      severity: severity.toLowerCase() === 'high' ? 'high' : severity.toLowerCase() === 'medium' ? 'medium' : 'low',
      type,
      message: description
    };
    vehicle.alerts.push(newAlert);
    await vehicle.save();

    const newLog = new Log({
      timestamp: getFormattedTime(),
      vehicleId,
      event: `Incident Reported (${type}): ${description}`,
      type: severity.toLowerCase() === 'high' ? 'warning' : 'info'
    });
    await newLog.save();

    res.json({ incident: newIncident, vehicle });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Log Endpoints
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(20);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/logs', async (req, res) => {
  const { vehicleId, event, type } = req.body;
  if (!vehicleId || !event) {
    return res.status(400).json({ error: 'Please provide vehicleId and event description.' });
  }

  try {
    const newLog = new Log({
      timestamp: getFormattedTime(),
      vehicleId,
      event,
      type: type || 'info'
    });
    await newLog.save();

    const logs = await Log.find().sort({ createdAt: -1 }).limit(20);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public Contact Inquiry Endpoint (Landing Page Contact Form)
app.post('/api/queries', async (req, res) => {
  const { name, email, fleetSize, message } = req.body;
  if (!name || !email || !fleetSize || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    if (!MONGODB_URI) {
      console.log('MongoDB not connected. Handling landing page query in mock mode.');
      return res.status(201).json({ success: true, message: 'Mock query received.' });
    }

    const newQuery = new Query({ name, email, fleetSize, message });
    await newQuery.save();

    res.status(201).json({ success: true, query: newQuery });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Queries Endpoint (Admin & Manager)
app.get('/api/queries', verifyRole(['admin', 'manager']), async (req, res) => {
  try {
    if (!MONGODB_URI) {
      return res.json([
        { _id: 'mock-1', name: 'John Doe', email: 'john@gmail.com', fleetSize: '51-200', message: 'Hi there, we would love a custom TMS integration audit for our 80 delivery trucks.', createdAt: new Date() },
        { _id: 'mock-2', name: 'Sarah Jenkins', email: 'sjenkins@depot.com', fleetSize: '500+', message: 'Looking for bulk pricing details for enterprise active route dispatching.', createdAt: new Date(Date.now() - 3600000) }
      ]);
    }

    const queries = await Query.find().sort({ createdAt: -1 });
    res.json(queries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Query / Mark as Resolved Endpoint (Admin & Manager)
app.delete('/api/queries/:id', verifyRole(['admin', 'manager']), async (req, res) => {
  const { id } = req.params;
  try {
    if (!MONGODB_URI) {
      return res.json({ success: true, message: 'Mock query deleted.' });
    }

    const deleted = await Query.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Query not found.' });
    }

    res.json({ success: true, message: 'Query deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Report Export Endpoint
app.get('/api/reports/export-csv', verifyRole(['admin', 'manager']), async (req, res) => {
  const { range } = req.query;
  
  try {
    let reports = [];
    
    if (!MONGODB_URI) {
      console.log('MongoDB not configured. Using MOCK_REPORT_DATA in-memory fallback for CSV export.');
      const now = new Date();
      if (range === 'today') {
        reports = MOCK_REPORT_DATA.filter(item => {
          return item.date.toDateString() === now.toDateString();
        });
      } else if (range === 'last_30_days') {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        reports = MOCK_REPORT_DATA.filter(item => item.date >= thirtyDaysAgo);
      } else {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        reports = MOCK_REPORT_DATA.filter(item => item.date >= oneWeekAgo);
      }
    } else {
      let query = {};
      if (range === 'today') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        query.date = { $gte: startOfDay, $lte: endOfDay };
      } else if (range === 'last_30_days') {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        query.date = { $gte: thirtyDaysAgo };
      } else {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        query.date = { $gte: oneWeekAgo };
      }
      reports = await Report.find(query);
    }
    
    let csv = 'VEH ID,ASSIGNED DRIVER,STATUS,SHIFT (UTC),HOURS WORKED,NOTES,DATE\n';
    reports.forEach(item => {
      const formattedDate = item.date.toISOString().split('T')[0];
      csv += `"${item.vehId}","${item.driver}","${item.status}","${item.shift}","${item.hours}","${item.note.replace(/"/g, '""')}","${formattedDate}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="fleet-report.csv"');
    res.status(200).send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
