export const INITIAL_VEHICLES = [
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

export const INITIAL_LOGS = [
  { id: 1, timestamp: '02:30 PM', vehicleId: 'TRK-101', event: 'Driver Rajesh Kumar updated location to Mumbai Central Logistics Hub', type: 'info' },
  { id: 2, timestamp: '02:15 PM', vehicleId: 'TRK-105', event: 'Driver Priya Patel departed Hyderabad Outer Ring Highway', type: 'success' },
  { id: 3, timestamp: '01:50 PM', vehicleId: 'TRK-106', event: 'Low tire pressure warning detected at Kolkata Dock Complex', type: 'warning' },
  { id: 4, timestamp: '01:20 PM', vehicleId: 'TRK-103', event: 'Arrived at Bengaluru Electronic City Gate', type: 'success' }
];
