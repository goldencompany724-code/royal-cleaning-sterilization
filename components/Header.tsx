
import React, { useState } from 'react';
import { Bell, Search, Menu, MessageCircle, X, ExternalLink, AlertTriangle, ShieldAlert, Wrench } from 'lucide-react';
import { User, Role } from '../types';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  user: User;
  onToggleRole: () => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onToggleRole, onToggleSidebar }) => {
  const { workers, inventory, vehicles, maintenanceRequests } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // --- DATA PREPARATION ---
  
  // 1. Messages: Get supervisors list (if manager) or show Manager contact (if supervisor)
  const contactList = user.role === Role.MANAGER 
      ? workers.filter(w => w.role.includes('مشرف') || w.workerType === 'Company') // Show staff to manager
      : [{ id: 'OWNER', name: 'صاحب الشركة', phone: '971500000000' }]; // Mock owner number for supervisor

  // 2. Notifications: Aggregate alerts
  const alerts = [
      ...inventory.filter(i => i.status === 'Critical' || i.status === 'Low').map(i => ({ 
          id: `INV-${i.id}`,
          title: `مخزون منخفض: ${i.name}`, 
          desc: `المتبقي: ${i.quantity} ${i.unit}`,
          type: 'alert',
          time: 'الآن' 
      })),
      ...vehicles.filter(v => v.currentMileage >= v.nextOilChangeMileage - 500).map(v => ({ 
          id: `VEH-${v.id}`,
          title: `صيانة مركبة: ${v.plateNumber}`, 
          desc: `موعد تغيير الزيت قريب`,
          type: 'warning',
          time: 'اليوم' 
      })),
      ...maintenanceRequests.filter(r => r.status === 'Pending').map(r => ({ 
          id: `REQ-${r.id}`,
          title: `طلب جديد: ${r.itemName}`, 
          desc: r.description,
          type: 'info',
          time: r.date 
      }))
  ];

  const handleSearch = (e?: React.FormEvent) => {
      e?.preventDefault();
      if(searchQuery.trim()) {
          alert(`جاري البحث في النظام عن: "${searchQuery}"...`);
      }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shrink-0 z-40 sticky top-0 shadow-sm md:shadow-none">
      
      {/* Mobile Menu Button & Search */}
      <div className="flex items-center gap-3 flex-1">
        <button 
            onClick={onToggleSidebar}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg"
        >
            <Menu size={24} />
        </button>
        
        <form onSubmit={handleSearch} className="relative w-full max-w-xs md:max-w-md hidden md:block group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في النظام..."
            className="w-full h-10 pr-10 pl-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 transition-all placeholder:text-slate-400"
          />
          <button type="submit" className="absolute right-2 top-2 text-slate-400 hover:text-primary-600 p-1 rounded-md transition-colors">
             <Search size={18} />
          </button>
        </form>

        <button onClick={() => handleSearch()} className="md:hidden p-2 text-slate-500 bg-slate-50 rounded-full">
            <Search size={20} />
        </button>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* Role Badge */}
         <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-[10px] text-slate-400 font-medium">الحساب الحالي</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                user.role === Role.MANAGER ? 'bg-primary-50 text-primary-700' : 'bg-orange-50 text-orange-700'
            }`}>
              {user.role === Role.MANAGER ? 'صاحب الشركة' : 'مشرف'}
            </span>
        </div>

        {/* Messages Dropdown */}
        <div className="relative">
          <button 
            onClick={() => { setShowMessages(!showMessages); setShowNotifications(false); }}
            className={`p-2 rounded-full transition-colors relative ${showMessages ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
            title="المراسلات"
          >
            <MessageCircle size={20} />
          </button>

          {showMessages && (
              <div className="absolute top-12 left-0 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-left">
                  <div className="p-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                      <h3 className="font-bold text-sm text-slate-800">فريق العمل</h3>
                      <button onClick={() => setShowMessages(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2">
                      {contactList.length > 0 ? contactList.map((contact, idx) => (
                          <a 
                            key={idx} 
                            href={`https://wa.me/${contact.phone?.replace(/\s+/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors group"
                          >
                              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">
                                  {contact.name.charAt(0)}
                              </div>
                              <div className="flex-1">
                                  <p className="text-xs font-bold text-slate-700">{contact.name}</p>
                                  <p className="text-[10px] text-slate-400 flex items-center gap-1 group-hover:text-green-600">
                                      <MessageCircle size={10} /> محادثة واتساب
                                  </p>
                              </div>
                              <ExternalLink size={12} className="text-slate-300 group-hover:text-green-500" />
                          </a>
                      )) : (
                          <p className="text-center text-xs text-slate-400 py-4">لا توجد جهات اتصال متاحة</p>
                      )}
                  </div>
              </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowMessages(false); }}
            className={`p-2 rounded-full transition-colors relative ${showNotifications ? 'bg-red-50 text-red-600' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Bell size={20} />
            {alerts.length > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
              <div className="absolute top-12 left-0 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-left z-50">
                  <div className="p-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                      <h3 className="font-bold text-sm text-slate-800">التنبيهات</h3>
                      <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600"><X size={16}/></button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                      {alerts.length > 0 ? alerts.map((alert) => (
                          <div key={alert.id} className="p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3">
                              <div className={`mt-1 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                  alert.type === 'alert' ? 'bg-red-100 text-red-600' : 
                                  alert.type === 'warning' ? 'bg-orange-100 text-orange-600' : 
                                  'bg-blue-100 text-blue-600'
                              }`}>
                                  {alert.type === 'alert' ? <ShieldAlert size={14} /> : 
                                   alert.type === 'warning' ? <AlertTriangle size={14} /> : 
                                   <Wrench size={14} />}
                              </div>
                              <div>
                                  <h4 className="text-xs font-bold text-slate-800">{alert.title}</h4>
                                  <p className="text-[10px] text-slate-500 mt-0.5">{alert.desc}</p>
                                  <span className="text-[9px] text-slate-400 mt-1 block">{alert.time}</span>
                              </div>
                          </div>
                      )) : (
                          <div className="text-center py-8">
                              <Bell size={24} className="mx-auto text-slate-200 mb-2" />
                              <p className="text-xs text-slate-400">لا توجد تنبيهات جديدة</p>
                          </div>
                      )}
                  </div>
                  {alerts.length > 0 && (
                      <div className="p-2 bg-slate-50 text-center">
                          <button className="text-[10px] font-bold text-primary-600 hover:text-primary-700">عرض الكل</button>
                      </div>
                  )}
              </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 md:gap-3 mr-1 pl-2">
            <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-slate-100 shadow-sm object-cover"
            />
             <div className="text-left hidden md:block">
                <p className="text-sm font-bold text-slate-800 leading-tight">{user.name}</p>
                <p className="text-[10px] text-green-500 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> متصل الآن
                </p>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
