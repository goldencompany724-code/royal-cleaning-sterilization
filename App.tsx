
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import NewReport from './pages/NewReport';
import Workers from './pages/Workers';
import ReportsList from './pages/ReportsList';
import Sites from './pages/Sites';
import Inventory from './pages/Inventory';
import Schedule from './pages/Schedule';
import Customers from './pages/Customers';
import EquipmentPage from './pages/Equipment'; 
import VehiclesPage from './pages/Vehicles';
import Projects from './pages/Projects'; 
import Payroll from './pages/Payroll'; 
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import TaskAssignment from './pages/TaskAssignment';
import { AppProvider, useApp } from './context/AppContext';
import { Role } from './types';

// Auth Guard Wrapper
const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
    const { currentUser } = useApp();
    if (!currentUser) {
        return <Auth />;
    }
    return children;
};

// Manager Route Wrapper
const ManagerRoute = ({ children }: { children: React.ReactElement }) => {
    const { currentUser } = useApp();
    if (currentUser?.role !== Role.MANAGER) {
        return <Navigate to="/" replace />;
    }
    return children;
};

const AppContent: React.FC = () => {
    const { currentUser, logout } = useApp();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (!currentUser) return <Auth />;

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden" dir="rtl">
          {/* Mobile Overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div className={`
            fixed inset-y-0 right-0 z-30 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
            md:relative md:translate-x-0 md:shadow-none md:w-64
            ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          `}>
            <Sidebar 
                currentRole={currentUser.role} 
                onLogout={logout} 
                onClose={() => setIsSidebarOpen(false)}
            />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col h-full w-full">
            <Header 
              user={currentUser} 
              onToggleRole={() => {}} // Disabled role toggle in prod mode
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            
            <main className="flex-1 overflow-y-auto bg-slate-50 scroll-smooth">
              <div className="min-h-full pb-20 md:pb-0"> 
                <Routes>
                  <Route path="/" element={<Dashboard user={currentUser} />} />
                  <Route path="/reports/new" element={<NewReport user={currentUser} />} />
                  <Route path="/reports" element={<ReportsList />} />
                  <Route path="/workers" element={<Workers />} />
                  <Route path="/sites" element={<Sites />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/equipment" element={<EquipmentPage user={currentUser} />} />
                  
                  <Route path="/vehicles" element={<ManagerRoute><VehiclesPage /></ManagerRoute>} />
                  <Route path="/projects" element={<ManagerRoute><Projects /></ManagerRoute>} />
                  <Route path="/payroll" element={<ManagerRoute><Payroll /></ManagerRoute>} />
                  <Route path="/customers" element={<ManagerRoute><Customers /></ManagerRoute>} />
                  <Route path="/tasks/assign" element={<ManagerRoute><TaskAssignment /></ManagerRoute>} />

                  <Route path="/schedule" element={<Schedule user={currentUser} />} />
                  <Route path="/settings" element={<Settings />} />
                  
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
    );
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppProvider>
  );
};

export default App;
