
export enum Role {
  SUPERVISOR = 'Supervisor',
  MANAGER = 'Manager'
}

export interface User {
  id: string;
  name: string;
  role: Role;
  avatar: string;
  email: string;
  password?: string; // Mock password
  status?: 'Active' | 'Pending'; // For approval flow
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'Inactive' | 'OnLeave';
  phone: string;
  joinDate: string;
  identityNumber?: string;
  workerType?: 'Company' | 'External';
  wageType?: 'Monthly' | 'Daily'; 
  baseRate?: number; // Salary or Daily Rate
}

export interface Site {
  id: string;
  name: string;
  address: string;
  clientName: string;
  status: 'Active' | 'Completed' | 'Pending';
  assignedWorkers: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number; // Cost per unit
  status: 'Good' | 'Low' | 'Critical';
  lastUpdated: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string; 
  serialNumber?: string;
  status: 'Available' | 'InUse' | 'Maintenance' | 'Broken';
  condition: 'New' | 'Good' | 'Fair' | 'Poor';
  assignedTo?: string; 
  purchaseDate: string;
  notes?: string;
  addedBy?: string; 
}

export interface Vehicle {
  id: string;
  plateNumber: string;
  make: string; 
  model: string; 
  year: string;
  status: 'Active' | 'Maintenance' | 'OutOfService';
  currentMileage: number;
  lastOilChangeMileage: number;
  nextOilChangeMileage: number;
  insuranceExpiryDate: string;
  licenseExpiryDate: string;
  assignedDriver?: string;
  image?: string;
}

export interface MaintenanceRequest {
  id: string;
  type: 'Repair' | 'Purchase' | 'SparePart';
  itemId?: string; 
  itemName: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  requesterName: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Completed';
}

export interface AssignedTask {
  id: string;
  title: string;
  description: string;
  assignedToId: string;
  assignedToName: string;
  assignedBy: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'InProgress' | 'Completed';
  dueDate: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface ConsumedMaterial {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  costAtTime: number; // Total cost for this consumption
}

export interface WorkerCostDetail {
  workerId: string;
  workerName: string;
  workerType: 'Company' | 'External';
  cost: number; // For External: Daily Wage. For Company: 0 (Calculated in Projects view)
}

export interface CashExpense {
  description: string; // e.g., "Lunch", "Fuel", "Spare Part"
  amount: number;
}

export interface Report {
  id: string;
  date: string;
  carNumber?: string; 
  
  // Client Details
  clientName: string;
  clientPhone?: string;
  siteLocation: string; 

  // Work Details
  startTime?: string;
  endTime?: string;
  workDescription: string; 
  
  // Workers & Costs
  workerNames: string[]; // Keep for display compatibility
  workerDetails: WorkerCostDetail[]; // New: Detailed costing

  // Inventory
  consumedMaterials?: ConsumedMaterial[]; 
  
  // Cash Expenses (New)
  cashExpenses?: CashExpense[];

  // Financials
  cost?: string; // Revenue from client
  paymentMethod?: string;

  // Images
  imageBefore?: string; 
  imageAfter?: string;

  notes?: string;
  aiSummary?: string;
  status: 'Pending' | 'Approved';
  supervisor: string;
  supervisorId?: string; // To link to supervisor salary
}

export interface Inquiry {
  id: string;
  customerName: string;
  phone: string;
  channel: 'WhatsApp' | 'Call' | 'Other';
  type: 'Price' | 'Service' | 'Complaint' | 'General';
  notes: string;
  date: string;
  status: 'New' | 'FollowedUp';
}

export interface AppointmentLog {
  action: 'Created' | 'Updated' | 'Cancelled' | 'Completed';
  by: string; 
  timestamp: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  time: string;
  day: string; 
  date: string; 
  serviceType: string;
  location: string;
  createdBy: string; 
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  history: AppointmentLog[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  location: string;
  type: 'Active' | 'Lead'; 
  lastInteraction: string;
  totalVisits: number;
  totalSpent?: number;
}

export interface Project {
  id: string;
  siteName: string;
  clientName: string;
  revenue: number;
  expenses: {
    directLabor: number; // External workers (Paid Cash/Daily)
    allocatedLabor: number; // Company workers (Pro-rated Salary)
    supervisorCost: number; // Supervisor (Pro-rated Salary)
    materials: number;
    cashExpenses: number; // Food, Fuel, etc.
    total: number;
  };
  netProfit: number;
  status: 'Active' | 'Completed';
  lastActivity: string;
}

export interface PayrollEntry {
  workerId: string;
  workerName: string;
  role: string;
  type: 'Company' | 'External';
  baseSalary: number; // For company
  totalDailyWages: number; // For external (sum from reports)
  daysWorked: number;
  totalDue: number;
}

export interface NavItem {
  label: string;
  icon: any;
  path: string;
}
