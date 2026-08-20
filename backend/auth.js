import mongoose from 'mongoose';
import User from './models/User.js';

export let MOCK_USERS = [
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

export function addMockUser(email, password, role) {
  const emailLower = email.toLowerCase();
  const exists = MOCK_USERS.some(u => u.email.toLowerCase() === emailLower);
  if (exists) return false;
  MOCK_USERS.push({ email: emailLower, password, role });
  return true;
}

// Middleware to verify authorization role
export function verifyRole(allowedRoles) {
  return (req, res, next) => {
    console.log('Incoming headers for verification:', req.headers);
    console.log('Incoming query params:', req.query);
    const userRole = req.headers['x-user-role'] || req.query.role;
    
    if (!userRole) {
      console.log('No x-user-role header or query parameter found in request.');
      return res.status(401).json({ message: 'Unauthorized: No operational role provided.' });
    }
    
    // Normalize roles for comparison (case-insensitive)
    const normalizedUserRole = userRole.toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());
    
    // Map common role aliases
    let finalRole = normalizedUserRole;
    if (normalizedUserRole === 'fleetmanager') finalRole = 'manager';
    
    if (!normalizedAllowedRoles.includes(finalRole)) {
      return res.status(403).json({ 
        message: 'Security Guardrail: Access Denied. Role strictly unauthorized for Export Hub operations.' 
      });
    }
    next();
  };
}

// Strict authentication handler
export async function loginUser(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password.' });
  }

  const cleanEmail = email.toLowerCase().trim();

  // 1. Try checking MongoDB if connected
  if (process.env.MONGODB_URI && mongoose.connection.readyState === 1) {
    try {
      const user = await User.findOne({ email: cleanEmail });
      if (user && user.password === password) {
        return res.json({
          success: true,
          user: {
            email: user.email,
            role: user.role
          }
        });
      }
      
      // If user exists in DB but password is wrong, return 401
      if (user && user.password !== password) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
    } catch (err) {
      console.warn('MongoDB user lookup error:', err.message);
    }
  }

  // 2. Check against strictly allowed registered MOCK_USERS
  const mockUser = MOCK_USERS.find(
    u => u.email.toLowerCase() === cleanEmail && u.password === password
  );

  if (mockUser) {
    return res.json({
      success: true,
      user: {
        email: mockUser.email,
        role: mockUser.role
      }
    });
  }

  // Reject all unauthorized / fake emails
  return res.status(401).json({ error: 'Invalid email or password.' });
}
