
import React from 'react';
import { MapPin, User, Building2, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Sites: React.FC = () => {
  const { sites } = useApp();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">إدارة المواقع</h2>
          <p className="text-slate-500 mt-1">قائمة المواقع والمشاريع الحالية.</p>
        </div>
        <button className="bg-primary-600 text-white px-6 py-2.5 rounded-xl hover:bg-primary-700 font-medium shadow-lg shadow-primary-200 transition-all">
          + موقع جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sites.map((site) => (
          <div key={site.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-32 bg-gradient-to-r from-slate-200 to-slate-100 relative">
                 <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1 shadow-sm">
                    <span className={`w-2 h-2 rounded-full ${site.status === 'Active' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                    {site.status === 'Active' ? 'نشط' : 'قيد الانتظار'}
                 </div>
            </div>
            <div className="p-6 -mt-10 relative z-10">
                <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-primary-600 mb-4">
                    <Building2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">{site.name}</h3>
                <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                    <MapPin size={14} /> {site.address}
                </p>

                <div className="mt-6 space-y-3">
                    <div className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                        <span className="text-slate-500">العميل</span>
                        <span className="font-medium text-slate-800">{site.clientName}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">العمال المعينين</span>
                        <div className="flex -space-x-2 space-x-reverse">
                             {Array.from({length: Math.min(3, site.assignedWorkers)}).map((_, i) => (
                                 <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                             ))}
                             {site.assignedWorkers > 3 && (
                                 <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-600">+{site.assignedWorkers - 3}</div>
                             )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 mt-6">
                    <button className="flex-1 py-2 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors">التفاصيل</button>
                    <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50">
                        <Phone size={18} />
                    </button>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sites;
