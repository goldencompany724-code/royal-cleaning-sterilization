
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  FilePlus2, 
  ClipboardList, 
  Users, 
  MapPin, 
  Package, 
  Settings, 
  LogOut,
  ShieldCheck,
  X,
  UserCheck,
  HardHat,
  Car,
  PieChart,
  Banknote,
  ClipboardCheck
} from 'lucide-react';
import { Role } from '../types';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  currentRole: Role;
  onLogout: () => void;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentRole, onLogout, onClose }) => {
  const { pendingUsers } = useApp();
  
  const navItems = [
    { label: 'لوحة التحكم', icon: LayoutDashboard, path: '/' },
    { label: 'المواعيد', icon: CalendarDays, path: '/schedule' },
    
    // Logic Split: Manager sees Task Assignment, Supervisor sees New Report
    ...(currentRole === Role.MANAGER 
        ? [{ label: 'تكليف مهام', icon: ClipboardCheck, path: '/tasks/assign' }] 
        : [{ label: 'يومية جديدة', icon: FilePlus2, path: '/reports/new' }]
    ),

    { label: 'سجل اليوميات', icon: ClipboardList, path: '/reports' },
    // Manager Specific
    ...(currentRole === Role.MANAGER ? [
      { label: 'تحليل المشاريع', icon: PieChart, path: '/projects' },
      { label: 'مسيرات الرواتب', icon: Banknote, path: '/payroll' },
      { label: 'العملاء', icon: UserCheck, path: '/customers' },
      { label: 'المركبات', icon: Car, path: '/vehicles' }
    ] : []),
    { label: 'العمال', icon: Users, path: '/workers' },
    { label: 'المعدات والعهدة', icon: HardHat, path: '/equipment' },
    { label: 'المواقع', icon: MapPin, path: '/sites' },
    { label: 'المخزون', icon: Package, path: '/inventory' },
  ];

  return (
    <aside className="h-full flex flex-col justify-between border-l border-slate-200 bg-white">
      <div>
        {/* Logo Area */}
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                    <ShieldCheck size={24} strokeWidth={2.5} />
                </div>
                <div>
                    <h1 className="text-sm font-bold text-primary-700 leading-tight">رويال للتنظيف والتعقيم</h1>
                    <p className="text-[10px] text-slate-500 mt-1">
                        {currentRole === Role.MANAGER ? 'لوحة تحكم صاحب الشركة' : 'لوحة تحكم المشرف'}
                    </p>
                </div>
            </div>
            {/* Mobile Close Button */}
            <button onClick={onClose} className="md:hidden p-1 text-slate-400 hover:bg-slate-50 rounded-lg">
                <X size={24} />
            </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)]">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose} // Close sidebar on mobile when clicked
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-bold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={22} className={isActive ? 'text-primary-600' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <NavLink
          to="/settings"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative ${
              isActive
                ? 'bg-primary-50 text-primary-700 font-semibold'
                : 'text-slate-600 hover:bg-white'
            }`
          }
        >
          <Settings size={20} />
          <span>الإعدادات</span>
          {currentRole === Role.MANAGER && pendingUsers.length > 0 && (
              <span className="absolute top-3 left-4 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
          )}
        </NavLink>
        
        <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 mt-1 transition-colors"
        >
          <LogOut size={20} />
          <span>تسجيل خروج</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
