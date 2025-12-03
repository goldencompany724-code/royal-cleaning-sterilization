
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Worker, Report, Site, InventoryItem, Inquiry, Appointment, Equipment, Vehicle, MaintenanceRequest, User, Role, AssignedTask } from '../types';
import { db, auth } from '../services/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  where,
  setDoc,
  getDocs
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

interface AppContextType {
  // Auth State
  currentUser: User | null;
  pendingUsers: User[];
  hasManager: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, role: Role) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  approveSupervisor: (userId: string, salary: number) => void;
  rejectSupervisor: (userId: string) => void;

  // Data
  workers: Worker[];
  reports: Report[];
  sites: Site[];
  inventory: InventoryItem[];
  equipment: Equipment[];
  vehicles: Vehicle[];
  maintenanceRequests: MaintenanceRequest[];
  inquiries: Inquiry[];
  appointments: Appointment[];
  assignedTasks: AssignedTask[];
  
  // Data Actions
  addWorker: (worker: Worker) => void;
  addReport: (report: Report) => void;
  deleteWorker: (id: string) => void;
  updateInventory: (id: string, qty: number) => void;
  addInquiry: (inquiry: Inquiry) => void;
  addAppointment: (appointment: Appointment) => void;
  updateAppointmentStatus: (id: string, status: 'Scheduled' | 'Completed' | 'Cancelled', byUser: string) => void;
  addEquipment: (equip: Equipment) => void;
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (id: string, data: Partial<Vehicle>) => void; 
  addMaintenanceRequest: (req: MaintenanceRequest) => void;
  addAssignedTask: (task: AssignedTask) => void;
  updateTaskStatus: (taskId: string, status: AssignedTask['status']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasManager, setHasManager] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  
  // Data State
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [reports, setReports] = useState<Report[]>([]); 
  const [sites, setSites] = useState<Site[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>([]);

  // 1. Auth Listener
  useEffect(() => {
      if(!auth) return;
      const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (!user) {
              setCurrentUser(null);
          }
          // Note: Full user details are set in the 'users' listener below
          setLoading(false);
      });
      return () => unsubscribe();
  }, []);

  // 2. Users Listener (Global - needed for Auth Logic like hasManager)
  // Requires Firestore Rules to allow read access to 'users' collection
  useEffect(() => {
    if (!db) return;

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setHasManager(usersList.some(u => u.role === Role.MANAGER));
        setPendingUsers(usersList.filter(u => u.status === 'Pending'));
        
        // Update current user details live from DB
        if (auth.currentUser) {
            const me = usersList.find(u => u.id === auth.currentUser?.uid);
            if (me) setCurrentUser(me);
        }
    }, (error) => {
        // Silently handle permission errors on login screen if rules aren't public
        console.log("Firestore Access:", error.code);
    });

    return () => unsubUsers();
  }, []);

  // 3. App Data Listeners (Only when Logged In)
  useEffect(() => {
    if (!db || !currentUser) {
        // Clear sensitive data when logged out
        setWorkers([]); setReports([]); setSites([]); setInventory([]);
        setEquipment([]); setVehicles([]); setMaintenanceRequests([]);
        setInquiries([]); setAppointments([]); setAssignedTasks([]);
        return;
    }

    // Subscribe to Collections
    const unsubWorkers = onSnapshot(collection(db, 'workers'), (snap) => setWorkers(snap.docs.map(d => ({id: d.id, ...d.data()} as Worker))));
    const unsubReports = onSnapshot(collection(db, 'reports'), (snap) => setReports(snap.docs.map(d => ({id: d.id, ...d.data()} as Report)).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())));
    const unsubSites = onSnapshot(collection(db, 'sites'), (snap) => setSites(snap.docs.map(d => ({id: d.id, ...d.data()} as Site))));
    const unsubInventory = onSnapshot(collection(db, 'inventory'), (snap) => setInventory(snap.docs.map(d => ({id: d.id, ...d.data()} as InventoryItem))));
    const unsubEquip = onSnapshot(collection(db, 'equipment'), (snap) => setEquipment(snap.docs.map(d => ({id: d.id, ...d.data()} as Equipment))));
    const unsubVehicles = onSnapshot(collection(db, 'vehicles'), (snap) => setVehicles(snap.docs.map(d => ({id: d.id, ...d.data()} as Vehicle))));
    const unsubReqs = onSnapshot(collection(db, 'maintenanceRequests'), (snap) => setMaintenanceRequests(snap.docs.map(d => ({id: d.id, ...d.data()} as MaintenanceRequest)).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())));
    const unsubInq = onSnapshot(collection(db, 'inquiries'), (snap) => setInquiries(snap.docs.map(d => ({id: d.id, ...d.data()} as Inquiry)).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())));
    const unsubAppt = onSnapshot(collection(db, 'appointments'), (snap) => setAppointments(snap.docs.map(d => ({id: d.id, ...d.data()} as Appointment))));
    const unsubTasks = onSnapshot(collection(db, 'assignedTasks'), (snap) => setAssignedTasks(snap.docs.map(d => ({id: d.id, ...d.data()} as AssignedTask)).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())));

    return () => {
        unsubWorkers(); unsubReports(); unsubSites(); unsubInventory(); 
        unsubEquip(); unsubVehicles(); unsubReqs(); unsubInq(); unsubAppt(); unsubTasks();
    };
  }, [currentUser]); // Re-run when currentUser changes


  // AUTH ACTIONS
  const login = async (email: string, password: string) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true };
    } catch (error: any) {
        return { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }
  };

  const register = async (name: string, email: string, password: string, role: Role) => {
      try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const uid = userCredential.user.uid;
          
          const newUser: User = {
              id: uid,
              name,
              email,
              role,
              avatar: `https://ui-avatars.com/api/?name=${name}&background=random`,
              status: role === Role.MANAGER ? 'Active' : 'Pending'
          };
          
          // Save extended profile to Firestore
          await setDoc(doc(db, 'users', uid), newUser);

          return { success: true };
      } catch (error: any) {
          return { success: false, message: error.message };
      }
  };

  const logout = async () => {
      await signOut(auth);
  };

  const approveSupervisor = async (userId: string, salary: number) => {
      // 1. Activate User
      await updateDoc(doc(db, 'users', userId), { status: 'Active' });
      
      const user = pendingUsers.find(u => u.id === userId);
      if (user) {
          // 2. Add to Workers List
          const newWorker: Worker = {
              id: user.id,
              name: user.name,
              role: 'مشرف عام',
              status: 'Active',
              phone: '-',
              joinDate: new Date().toISOString().split('T')[0],
              workerType: 'Company',
              wageType: 'Monthly',
              baseRate: salary
          };
          await setDoc(doc(db, 'workers', user.id), newWorker);
      }
  };

  const rejectSupervisor = async (userId: string) => {
      // In a real app, you might want to delete the auth user too using Cloud Functions
      await deleteDoc(doc(db, 'users', userId));
  };

  // DATA ACTIONS (Converted to Firestore)
  const addWorker = async (worker: Worker) => await setDoc(doc(db, 'workers', worker.id), worker);
  const deleteWorker = async (id: string) => await deleteDoc(doc(db, 'workers', id));
  
  const addReport = async (report: Report) => {
    await setDoc(doc(db, 'reports', report.id), report);
    
    if (report.consumedMaterials) {
        report.consumedMaterials.forEach(async (consumed) => {
            const item = inventory.find(i => i.id === consumed.itemId);
            if (item) {
                const newQty = Math.max(0, item.quantity - consumed.quantity);
                let newStatus: 'Good' | 'Low' | 'Critical' = item.status;
                if (newQty === 0) newStatus = 'Critical';
                else if (newQty < 5) newStatus = 'Low';
                
                await updateDoc(doc(db, 'inventory', item.id), { 
                    quantity: newQty, 
                    status: newStatus 
                });
            }
        });
    }
  };

  const updateInventory = async (id: string, qty: number) => await updateDoc(doc(db, 'inventory', id), { quantity: qty });
  const addInquiry = async (inquiry: Inquiry) => await setDoc(doc(db, 'inquiries', inquiry.id), inquiry);
  const addAppointment = async (appointment: Appointment) => await setDoc(doc(db, 'appointments', appointment.id), appointment);
  
  const updateAppointmentStatus = async (id: string, status: any, byUser: string) => {
     const appt = appointments.find(a => a.id === id);
     if(appt) {
         const newHistory = [...appt.history, { action: status, by: byUser, timestamp: new Date().toLocaleString() }];
         await updateDoc(doc(db, 'appointments', id), { status, history: newHistory });
     }
  };
  
  const addEquipment = async (equip: Equipment) => await setDoc(doc(db, 'equipment', equip.id), equip);
  const addVehicle = async (vehicle: Vehicle) => await setDoc(doc(db, 'vehicles', vehicle.id), vehicle);
  const updateVehicle = async (id: string, data: Partial<Vehicle>) => await updateDoc(doc(db, 'vehicles', id), data);
  const addMaintenanceRequest = async (req: MaintenanceRequest) => await setDoc(doc(db, 'maintenanceRequests', req.id), req);
  const addAssignedTask = async (task: AssignedTask) => await setDoc(doc(db, 'assignedTasks', task.id), task);
  const updateTaskStatus = async (taskId: string, status: AssignedTask['status']) => await updateDoc(doc(db, 'assignedTasks', taskId), { status });

  return (
    <AppContext.Provider value={{ 
      currentUser, pendingUsers, hasManager,
      login, register, logout, approveSupervisor, rejectSupervisor,
      workers, reports, sites, inventory, equipment, vehicles, maintenanceRequests, inquiries, appointments, assignedTasks,
      addWorker, addReport, deleteWorker, updateInventory, addInquiry, addAppointment, updateAppointmentStatus, 
      addEquipment, addVehicle, updateVehicle, addMaintenanceRequest, addAssignedTask, updateTaskStatus
    }}>
      {!loading && children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
