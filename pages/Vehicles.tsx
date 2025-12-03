
import React, { useState } from 'react';
import { Car, Fuel, Wrench, AlertTriangle, Plus, X, CalendarCheck, ShieldCheck, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Vehicle } from '../types';

const VehiclesPage: React.FC = () => {
  const { vehicles, addVehicle, workers } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'Alerts'>('All');

  // Form State
  const [newCar, setNewCar] = useState<Partial<Vehicle>>({
      make: '', model: '', year: '', plateNumber: '', 
      currentMileage: 0, nextOilChangeMileage: 5000, 
      status: 'Active'
  });

  const handleAddVehicle = (e: React.FormEvent) => {
      e.preventDefault();
      const v: Vehicle = {
          id: `V-${Date.now()}`,
          make: newCar.make!,
          model: newCar.model!,
          year: newCar.year!,
          plateNumber: newCar.plateNumber!,
          currentMileage: Number(newCar.currentMileage),
          lastOilChangeMileage: Number(newCar.currentMileage), // assume changed now if new
          nextOilChangeMileage: Number(newCar.nextOilChangeMileage),
          insuranceExpiryDate: newCar.insuranceExpiryDate || '',
          licenseExpiryDate: newCar.licenseExpiryDate || '',
          status: 'Active',
          assignedDriver: newCar.assignedDriver
      };
      addVehicle(v);
      setIsModalOpen(false);
      setNewCar({ make: '', model: '', year: '', plateNumber: '', currentMileage: 0, status: 'Active' });
  };

  // Logic to check alerts
  const checkAlerts = (v: Vehicle) => {
      const alerts = [];
      if (v.currentMileage >= v.nextOilChangeMileage - 500) alerts.push('تغيير زيت قريب');
      // Simple date check could be added here for insurance
      return alerts;
  };

  const filteredVehicles = activeTab === 'All' 
    ? vehicles 
    : vehicles.filter(v => checkAlerts(v).length > 0);

  return (
    <div className="p-4 md:p-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
              <Car className="text-primary-600" /> أسطول المركبات
          </h2>
          <p className="text-sm text-slate-500 mt-1">متابعة صيانة وتراخيص سيارات الشركة.</p>
        </div>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-slate-800 text-white px-6 py-2.5 rounded-xl hover:bg-slate-900 font-medium shadow-lg transition-all flex items-center justify-center gap-2"
        >
            <Plus size={18} /> إضافة سيارة
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
          <button 
            onClick={() => setActiveTab('All')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'All' ? 'bg-primary-100 text-primary-700' : 'bg-white text-slate-500'}`}
          >
              الكل ({vehicles.length})
          </button>
          <button 
            onClick={() => setActiveTab('Alerts')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'Alerts' ? 'bg-red-100 text-red-700' : 'bg-white text-slate-500'}`}
          >
              تنبيهات الصيانة ({vehicles.filter(v => checkAlerts(v).length > 0).length})
          </button>
      </div>

      {vehicles.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
              <Car size={48} className="text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">لم يتم تسجيل سيارات بعد</p>
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map(car => {
                  const alerts = checkAlerts(car);
                  return (
                    <div key={car.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-slate-200 text-slate-700">
                                    <Car size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-sm">{car.make} {car.model}</h3>
                                    <p className="text-xs text-slate-500">{car.year} • {car.plateNumber}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                car.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {car.status === 'Active' ? 'بالخدمة' : 'خارج الخدمة'}
                            </span>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 p-2 rounded-xl">
                                    <span className="text-[10px] text-slate-400 block mb-1">عداد الكيلومترات</span>
                                    <div className="flex items-center gap-1 font-bold text-slate-700 text-sm">
                                        <MapPin size={14} className="text-primary-500" />
                                        {car.currentMileage.toLocaleString()} كم
                                    </div>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-xl">
                                    <span className="text-[10px] text-slate-400 block mb-1">تغيير الزيت القادم</span>
                                    <div className="flex items-center gap-1 font-bold text-slate-700 text-sm">
                                        <Fuel size={14} className="text-orange-500" />
                                        {car.nextOilChangeMileage.toLocaleString()} كم
                                    </div>
                                </div>
                            </div>

                            {/* Dates */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500 flex items-center gap-1"><ShieldCheck size={12}/> انتهاء التأمين</span>
                                    <span className="font-medium">{car.insuranceExpiryDate || 'غير محدد'}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500 flex items-center gap-1"><CalendarCheck size={12}/> انتهاء الملكية</span>
                                    <span className="font-medium">{car.licenseExpiryDate || 'غير محدد'}</span>
                                </div>
                            </div>

                            {/* Alerts */}
                            {alerts.length > 0 && (
                                <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                    {alerts.map((alert, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-red-600 font-bold">
                                            <AlertTriangle size={14} /> {alert}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Driver */}
                            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                                <div className="text-xs text-slate-400">السائق المسؤول:</div>
                                <div className="text-xs font-bold text-slate-700">{car.assignedDriver || 'غير محدد'}</div>
                            </div>
                        </div>
                    </div>
                  );
              })}
          </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                 <button onClick={() => setIsModalOpen(false)} className="absolute left-4 top-4 text-slate-400 hover:bg-slate-50 p-1 rounded-full"><X size={20} /></button>
                 <h3 className="text-lg font-bold text-slate-800 mb-6">إضافة سيارة جديدة</h3>
                 
                 <form onSubmit={handleAddVehicle} className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label className="text-xs font-bold text-slate-700 mb-1 block">نوع السيارة (الشركة)</label>
                             <input required type="text" placeholder="Toyota" value={newCar.make} onChange={e => setNewCar({...newCar, make: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50 outline-none" />
                         </div>
                         <div>
                             <label className="text-xs font-bold text-slate-700 mb-1 block">الموديل</label>
                             <input required type="text" placeholder="Hiace" value={newCar.model} onChange={e => setNewCar({...newCar, model: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50 outline-none" />
                         </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label className="text-xs font-bold text-slate-700 mb-1 block">سنة الصنع</label>
                             <input required type="text" placeholder="2024" value={newCar.year} onChange={e => setNewCar({...newCar, year: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50 outline-none" />
                         </div>
                         <div>
                             <label className="text-xs font-bold text-slate-700 mb-1 block">رقم اللوحة</label>
                             <input required type="text" placeholder="A 12345" value={newCar.plateNumber} onChange={e => setNewCar({...newCar, plateNumber: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50 outline-none" />
                         </div>
                     </div>

                     <hr className="border-slate-100" />
                     
                     <div>
                         <label className="text-xs font-bold text-slate-700 mb-1 block">عداد الكيلومترات الحالي</label>
                         <input required type="number" value={newCar.currentMileage} onChange={e => setNewCar({...newCar, currentMileage: e.target.value as any})} className="w-full p-2 border rounded-lg bg-slate-50 outline-none" />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label className="text-xs font-bold text-slate-700 mb-1 block">انتهاء التأمين</label>
                             <input type="date" value={newCar.insuranceExpiryDate} onChange={e => setNewCar({...newCar, insuranceExpiryDate: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50 outline-none" />
                         </div>
                         <div>
                             <label className="text-xs font-bold text-slate-700 mb-1 block">انتهاء الملكية</label>
                             <input type="date" value={newCar.licenseExpiryDate} onChange={e => setNewCar({...newCar, licenseExpiryDate: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50 outline-none" />
                         </div>
                     </div>

                     <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">السائق المسؤول</label>
                        <select value={newCar.assignedDriver || ''} onChange={e => setNewCar({...newCar, assignedDriver: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50 outline-none">
                            <option value="">اختر سائق...</option>
                            {workers.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                        </select>
                     </div>

                     <button type="submit" className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-slate-900 mt-2">حفظ السيارة</button>
                 </form>
            </div>
          </div>
      )}
    </div>
  );
};

export default VehiclesPage;
