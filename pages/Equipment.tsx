
import React, { useState } from 'react';
import { HardHat, PenTool, Wrench, AlertTriangle, Plus, X, BadgeAlert, ShoppingCart, UserCheck, Calendar, Clock, Car, Fuel, Activity, Gauge, CheckSquare, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Equipment, MaintenanceRequest, Role, User, Vehicle } from '../types';

interface EquipmentPageProps {
  user: User;
}

const EquipmentPage: React.FC<EquipmentPageProps> = ({ user }) => {
  const { equipment, addEquipment, addMaintenanceRequest, maintenanceRequests, workers, vehicles, updateVehicle } = useApp();
  
  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  
  // Vehicle Update Modal
  const [isVehicleUpdateOpen, setIsVehicleUpdateOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleForm, setVehicleForm] = useState({
      currentMileage: 0,
      nextOilChangeMileage: 0,
      notes: ''
  });

  // Forms
  const [newEquip, setNewEquip] = useState<Partial<Equipment>>({
      type: 'Machine',
      status: 'Available',
      condition: 'New',
      purchaseDate: new Date().toISOString().split('T')[0]
  });

  const [request, setRequest] = useState<Partial<MaintenanceRequest>>({
      type: 'Repair',
      priority: 'Medium'
  });

  const handleAddEquipment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newEquip.name) return;
      
      const equip: Equipment = {
          id: `EQ-${Date.now()}`,
          name: newEquip.name!,
          type: newEquip.type || 'Tool',
          status: newEquip.status as any || 'Available',
          condition: newEquip.condition as any || 'New',
          serialNumber: newEquip.serialNumber,
          assignedTo: newEquip.assignedTo,
          purchaseDate: newEquip.purchaseDate || new Date().toISOString().split('T')[0],
          notes: newEquip.notes,
          addedBy: user.name 
      };
      addEquipment(equip);
      setIsAddOpen(false);
      setNewEquip({ type: 'Machine', status: 'Available', condition: 'New', purchaseDate: new Date().toISOString().split('T')[0] });
  };

  const handleSendRequest = (e: React.FormEvent) => {
      e.preventDefault();
      if(!request.description || !request.itemName) return;

      const newReq: MaintenanceRequest = {
          id: `REQ-${Date.now()}`,
          itemName: request.itemName!,
          type: request.type as any,
          description: request.description!,
          priority: request.priority as any || 'Medium',
          requesterName: user.name, 
          date: new Date().toISOString().split('T')[0],
          status: 'Pending'
      };
      addMaintenanceRequest(newReq);
      setIsRequestOpen(false);
      setRequest({ type: 'Repair', priority: 'Medium' });
      alert('تم إرسال الطلب إلى الإدارة بنجاح.');
  };

  const openVehicleUpdate = (v: Vehicle) => {
      setSelectedVehicle(v);
      setVehicleForm({
          currentMileage: v.currentMileage,
          nextOilChangeMileage: v.nextOilChangeMileage,
          notes: ''
      });
      setIsVehicleUpdateOpen(true);
  };

  const handleUpdateVehicle = (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedVehicle) {
          updateVehicle(selectedVehicle.id, {
              currentMileage: Number(vehicleForm.currentMileage),
              nextOilChangeMileage: Number(vehicleForm.nextOilChangeMileage),
          });
          setIsVehicleUpdateOpen(false);
          alert('تم تحديث بيانات السيارة بنجاح.');
      }
  };

  const EquipmentCard = ({ item }: { item: Equipment }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-3 group hover:border-primary-100 transition-colors">
        <div className="flex justify-between items-start">
             <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${
                    item.type === 'Machine' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
                }`}>
                    {item.type === 'Machine' ? <HardHat size={20} /> : <PenTool size={20} />}
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                    <p className="text-xs text-slate-500 font-mono">{item.serialNumber || 'بدون رقم تسلسلي'}</p>
                </div>
             </div>
             <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                item.status === 'Available' ? 'bg-green-100 text-green-700' :
                item.status === 'InUse' ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
            }`}>
                {item.status === 'Available' ? 'متاح' : item.status === 'InUse' ? 'عهدة' : 'صيانة'}
            </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="bg-slate-50 p-2 rounded-lg">
                <span className="block text-[10px] text-slate-400">الحالة</span>
                <span className="block text-xs font-bold text-slate-700">{
                    item.condition === 'New' ? 'جديدة' :
                    item.condition === 'Good' ? 'جيدة' : 
                    item.condition === 'Fair' ? 'متوسطة' : 'متهالكة'
                }</span>
            </div>
             <div className="bg-slate-50 p-2 rounded-lg">
                <span className="block text-[10px] text-slate-400">العهدة</span>
                <span className="block text-xs font-bold text-slate-700 truncate">{item.assignedTo || 'المخزن'}</span>
            </div>
        </div>

        {item.addedBy && user.role === Role.MANAGER && (
            <div className="pt-2 border-t border-slate-50 flex items-center gap-1.5 text-[10px] text-slate-400">
                <UserCheck size={12} className="text-primary-500" />
                <span>تمت الإضافة بواسطة: <span className="text-primary-600 font-bold">{item.addedBy}</span></span>
            </div>
        )}
    </div>
  );

  return (
    <div className="p-4 md:p-6 pb-20 space-y-8">
      
      {/* --- MANAGER VIEW: Maintenance Requests --- */}
      {user.role === Role.MANAGER && maintenanceRequests.length > 0 && (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
              <div className="bg-red-50/50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <BadgeAlert className="text-red-500" /> طلبات الصيانة والشراء
                  </h3>
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{maintenanceRequests.length} طلب</span>
              </div>
              <div className="divide-y divide-slate-100">
                  {maintenanceRequests.map(req => (
                      <div key={req.id} className="p-4 flex flex-col md:flex-row gap-4 md:items-center justify-between hover:bg-slate-50">
                          <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg shrink-0 ${req.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                  <AlertTriangle size={20} />
                              </div>
                              <div>
                                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                      {req.itemName}
                                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                                          {req.type === 'Repair' ? 'تصليح' : req.type === 'Purchase' ? 'شراء' : 'قطع غيار'}
                                      </span>
                                  </h4>
                                  <p className="text-xs text-slate-500 mt-1">{req.description}</p>
                                  <div className="flex gap-3 mt-2 text-[10px] text-slate-400">
                                      <span className="flex items-center gap-1"><UserCheck size={10} /> {req.requesterName}</span>
                                      <span className="flex items-center gap-1"><Calendar size={10} /> {req.date}</span>
                                  </div>
                              </div>
                          </div>
                          <div className="flex items-center gap-2 self-end md:self-auto">
                              <button className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-bold hover:bg-green-100">موافقة</button>
                              <button className="text-xs bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-100">تجاهل</button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* --- Equipment Header --- */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">المعدات والعهدة</h2>
          <p className="text-sm text-slate-500 mt-1">إدارة الأصول الثابتة ومتابعة حالتها.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
            <button 
                onClick={() => setIsRequestOpen(true)}
                className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 font-medium transition-all flex items-center justify-center gap-2"
            >
                <Wrench size={18} className="text-orange-500" /> طلب صيانة/شراء
            </button>
            <button 
                onClick={() => setIsAddOpen(true)}
                className="bg-primary-600 text-white px-6 py-2.5 rounded-xl hover:bg-primary-700 font-medium shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2"
            >
                <Plus size={18} /> إضافة معدة
            </button>
        </div>
      </div>

      {equipment.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
                  <PenTool size={32} />
              </div>
              <p className="text-slate-500 font-medium text-sm">لا توجد معدات مسجلة حالياً</p>
              <button onClick={() => setIsAddOpen(true)} className="mt-2 text-primary-600 font-bold hover:underline text-sm">إضافة معدة جديدة</button>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {equipment.map(item => (
                <EquipmentCard key={item.id} item={item} />
            ))}
        </div>
      )}

      {/* --- Vehicle Section (For Supervisors) --- */}
      <div className="mt-8 pt-8 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <Car size={24} />
              </div>
              <div>
                  <h3 className="text-lg font-bold text-slate-800">المركبات المستخدمة</h3>
                  <p className="text-xs text-slate-500">سجل استخدام السيارات وتحديث العداد.</p>
              </div>
          </div>
          
          {vehicles.length === 0 ? (
               <div className="bg-slate-50 rounded-xl p-6 text-center text-slate-500 text-sm">
                   لا توجد مركبات مسجلة في النظام. (يتم إضافتها من لوحة المدير)
               </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vehicles.map(v => (
                      <div key={v.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                          <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                                        <Car size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{v.make} {v.model}</h4>
                                        <p className="text-xs text-slate-500">{v.plateNumber}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                    v.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {v.status === 'Active' ? 'بالخدمة' : 'خارج الخدمة'}
                                </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 mb-4">
                              <div className="bg-slate-50 p-2 rounded-xl">
                                  <span className="text-[10px] text-slate-400 block mb-1">عداد الكيلومترات</span>
                                  <div className="flex items-center gap-1 font-bold text-slate-700 text-sm">
                                      <MapPin size={14} className="text-primary-500" />
                                      {v.currentMileage.toLocaleString()} كم
                                  </div>
                              </div>
                              <div className="bg-slate-50 p-2 rounded-xl">
                                  <span className="text-[10px] text-slate-400 block mb-1">تغيير الزيت القادم</span>
                                  <div className="flex items-center gap-1 font-bold text-slate-700 text-sm">
                                      <Fuel size={14} className="text-orange-500" />
                                      {v.nextOilChangeMileage.toLocaleString()} كم
                                  </div>
                              </div>
                          </div>

                          <button 
                            onClick={() => openVehicleUpdate(v)}
                            className="w-full py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                          >
                              <CheckSquare size={16} /> تأكيد استلام / تحديث
                          </button>
                      </div>
                  ))}
              </div>
          )}
      </div>

      {/* --- ADD EQUIPMENT MODAL --- */}
      {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
                <button onClick={() => setIsAddOpen(false)} className="absolute left-4 top-4 text-slate-400 hover:bg-slate-50 p-1 rounded-full"><X size={20} /></button>
                <h3 className="text-lg font-bold text-slate-800 mb-6">إضافة معدة جديدة</h3>
                <form onSubmit={handleAddEquipment} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">اسم المعدة</label>
                        <input required type="text" value={newEquip.name || ''} onChange={e => setNewEquip({...newEquip, name: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-100" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-xs font-bold text-slate-700 mb-1 block">النوع</label>
                            <select value={newEquip.type} onChange={e => setNewEquip({...newEquip, type: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none">
                                <option value="Machine">ماكينة</option>
                                <option value="Tool">أداة يدوية</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-700 mb-1 block">الرقم التسلسلي</label>
                            <input type="text" value={newEquip.serialNumber || ''} onChange={e => setNewEquip({...newEquip, serialNumber: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none" />
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="text-xs font-bold text-slate-700 mb-1 block">الحالة</label>
                            <select value={newEquip.status} onChange={e => setNewEquip({...newEquip, status: e.target.value as any})} className="w-full p-2 border border-slate-200 rounded-lg outline-none">
                                <option value="Available">متاح</option>
                                <option value="InUse">عهدة (قيد الاستخدام)</option>
                                <option value="Maintenance">في الصيانة</option>
                                <option value="Broken">تالف</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-700 mb-1 block">جودة المعدة</label>
                            <select value={newEquip.condition} onChange={e => setNewEquip({...newEquip, condition: e.target.value as any})} className="w-full p-2 border border-slate-200 rounded-lg outline-none">
                                <option value="New">جديدة</option>
                                <option value="Good">جيدة</option>
                                <option value="Fair">متوسطة</option>
                                <option value="Poor">متهالكة</option>
                            </select>
                        </div>
                    </div>
                    {newEquip.status === 'InUse' && (
                         <div>
                            <label className="text-xs font-bold text-slate-700 mb-1 block">العهدة مع من؟</label>
                             <select value={newEquip.assignedTo || ''} onChange={e => setNewEquip({...newEquip, assignedTo: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none">
                                <option value="">اختر عامل...</option>
                                {workers.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                            </select>
                        </div>
                    )}
                    <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold mt-2">حفظ</button>
                </form>
            </div>
          </div>
      )}

      {/* --- VEHICLE UPDATE MODAL --- */}
      {isVehicleUpdateOpen && selectedVehicle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
             <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                <button onClick={() => setIsVehicleUpdateOpen(false)} className="absolute left-4 top-4 text-slate-400 hover:bg-slate-50 p-1 rounded-full"><X size={20} /></button>
                <h3 className="text-lg font-bold text-slate-800 mb-1">تحديث / استلام السيارة</h3>
                <p className="text-sm text-slate-500 mb-6">{selectedVehicle.make} {selectedVehicle.model} - {selectedVehicle.plateNumber}</p>
                
                <form onSubmit={handleUpdateVehicle} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block flex items-center gap-1">
                            <Gauge size={14} /> قراءة العداد الحالية (كم)
                        </label>
                        <input 
                            required 
                            type="number" 
                            min={selectedVehicle.currentMileage}
                            value={vehicleForm.currentMileage} 
                            onChange={e => setVehicleForm({...vehicleForm, currentMileage: Number(e.target.value)})} 
                            className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-100 font-bold text-lg text-center dir-ltr" 
                        />
                        <p className="text-[10px] text-slate-400 mt-1 mr-1">القراءة السابقة: {selectedVehicle.currentMileage} كم</p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block flex items-center gap-1">
                             <Fuel size={14} /> موعد تغيير الزيت القادم (كم)
                        </label>
                        <input 
                            required 
                            type="number" 
                            value={vehicleForm.nextOilChangeMileage} 
                            onChange={e => setVehicleForm({...vehicleForm, nextOilChangeMileage: Number(e.target.value)})} 
                            className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-100 font-bold text-lg text-center dir-ltr text-orange-600" 
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">ملاحظات الاستلام</label>
                        <textarea 
                            value={vehicleForm.notes} 
                            onChange={e => setVehicleForm({...vehicleForm, notes: e.target.value})} 
                            className="w-full p-3 border border-slate-200 rounded-xl outline-none h-20 resize-none"
                            placeholder="حالة السيارة عند الاستلام، أي ملاحظات..."
                        ></textarea>
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 mt-2">
                        تأكيد التحديث
                    </button>
                </form>
             </div>
          </div>
      )}

      {/* --- REQUEST MAINTENANCE MODAL --- */}
      {isRequestOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                <button onClick={() => setIsRequestOpen(false)} className="absolute left-4 top-4 text-slate-400 hover:bg-slate-50 p-1 rounded-full"><X size={20} /></button>
                <div className="flex items-center gap-2 mb-6 text-orange-600">
                    <BadgeAlert size={24} />
                    <h3 className="text-lg font-bold">طلب صيانة / شراء</h3>
                </div>
                
                <form onSubmit={handleSendRequest} className="space-y-4">
                    <div>
                         <label className="text-xs font-bold text-slate-700 mb-1 block">نوع الطلب</label>
                         <div className="flex gap-2">
                             {['Repair', 'Purchase', 'SparePart'].map(type => (
                                 <button
                                    key={type}
                                    type="button"
                                    onClick={() => setRequest({...request, type: type as any})}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold border ${
                                        request.type === type ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-slate-200 text-slate-500'
                                    }`}
                                 >
                                     {type === 'Repair' ? 'تصليح' : type === 'Purchase' ? 'شراء جديد' : 'قطع غيار'}
                                 </button>
                             ))}
                         </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">اسم المعدة / الغرض</label>
                        <input required type="text" value={request.itemName || ''} onChange={e => setRequest({...request, itemName: e.target.value})} placeholder="مثال: ماكينة الجلي #1" className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-100" />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">التفاصيل / المشكلة</label>
                        <textarea required value={request.description || ''} onChange={e => setRequest({...request, description: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg h-24 outline-none resize-none" placeholder="اشرح العطل أو المواصفات المطلوبة..."></textarea>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 mb-1 block">الأولوية</label>
                        <select value={request.priority} onChange={e => setRequest({...request, priority: e.target.value as any})} className="w-full p-2 border border-slate-200 rounded-lg outline-none">
                            <option value="Low">عادية</option>
                            <option value="Medium">متوسطة</option>
                            <option value="High">عاجلة جداً</option>
                        </select>
                    </div>

                    <button type="submit" className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold mt-2 shadow-lg shadow-orange-200">إرسال الطلب للمدير</button>
                </form>
            </div>
          </div>
      )}

    </div>
  );
};

export default EquipmentPage;
