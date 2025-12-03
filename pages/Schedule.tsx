
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Plus, X, UserCheck, MapPin, Trash2, Info, History, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Appointment, Role, User as UserType } from '../types';

interface ScheduleProps {
  user: UserType;
}

const Schedule: React.FC<ScheduleProps> = ({ user }) => {
  const { appointments, addAppointment, updateAppointmentStatus } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateForAdd, setSelectedDateForAdd] = useState<{date: string, day: string} | null>(null);

  // Form State
  const [newAppt, setNewAppt] = useState({
    clientName: '',
    time: '',
    serviceType: '',
    location: ''
  });

  const nextWeek = () => {
    const next = new Date(currentDate);
    next.setDate(currentDate.getDate() + 7);
    setCurrentDate(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentDate);
    prev.setDate(currentDate.getDate() - 7);
    setCurrentDate(prev);
  };

  // Generate 7 days for current view
  const days = [];
  const startOfWeek = new Date(currentDate); 
  // Simple week generation starting from current view date
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    days.push(d);
  }

  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const formatDayName = (date: Date) => {
    const daysAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return daysAr[date.getDay()];
  };

  const openAddModal = (dateStr: string, dayStr: string) => {
    setSelectedDateForAdd({ date: dateStr, day: dayStr });
    setIsModalOpen(true);
  };

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDateForAdd) return;

    // Validation Step 1: Check for conflicts
    const isConflict = appointments.some(appt => 
        appt.date === selectedDateForAdd.date && 
        appt.time === newAppt.time &&
        appt.status !== 'Cancelled'
    );

    if (isConflict) {
        alert('⚠️ تنبيه: يوجد موعد محجوز مسبقاً في هذا التوقيت (نفس اليوم والساعة). يرجى اختيار توقيت آخر لتجنب التعارض.');
        return;
    }

    const appt: Appointment = {
      id: `APT-${Date.now()}`,
      clientName: newAppt.clientName,
      time: newAppt.time,
      serviceType: newAppt.serviceType,
      location: newAppt.location,
      date: selectedDateForAdd.date,
      day: selectedDateForAdd.day,
      createdBy: user.name,
      status: 'Scheduled',
      history: [
          { action: 'Created', by: user.name, timestamp: new Date().toLocaleString('en-US') }
      ]
    };
    addAppointment(appt);
    setIsModalOpen(false);
    setNewAppt({ clientName: '', time: '', serviceType: '', location: '' });
  };

  const handleStatusChange = (id: string, newStatus: 'Cancelled' | 'Completed') => {
      if(window.confirm(`هل أنت متأكد من ${newStatus === 'Cancelled' ? 'إلغاء' : 'إكمال'} هذا الموعد؟`)) {
          updateAppointmentStatus(id, newStatus, user.name);
      }
  };

  return (
    <div className="p-4 md:p-6 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 sticky top-0 bg-slate-50 z-10 py-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="text-primary-600" /> جدول المواعيد
          </h2>
          <p className="text-slate-500">إدارة حجوزات العملاء وتنظيم الوقت.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          <button onClick={prevWeek} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
            <ChevronRight />
          </button>
          <span className="font-bold text-slate-700 min-w-[150px] text-center dir-ltr">
            {formatDate(days[0])} - {formatDate(days[6])}
          </span>
          <button onClick={nextWeek} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
            <ChevronLeft />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {days.map((dayDate) => {
          const dateStr = formatDate(dayDate);
          const dayName = formatDayName(dayDate);
          const dayAppts = appointments.filter(a => a.date === dateStr || (a.day === dayName && !a.date));

          const isToday = formatDate(new Date()) === dateStr;

          return (
            <div key={dateStr} className={`bg-white rounded-2xl border ${isToday ? 'border-primary-200 shadow-md ring-1 ring-primary-100' : 'border-slate-200 shadow-sm'} overflow-hidden`}>
              {/* Day Header */}
              <div className={`p-4 flex justify-between items-center ${isToday ? 'bg-primary-50' : 'bg-slate-50'} border-b border-slate-100`}>
                <div className="flex items-center gap-3">
                  <div className={`text-center px-3 py-1 rounded-lg ${isToday ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                    <span className="block text-xs font-medium opacity-80">{dayName}</span>
                    <span className="block text-lg font-bold leading-none mt-1">{dayDate.getDate()}</span>
                  </div>
                  {isToday && <span className="text-xs font-bold text-primary-600 bg-white px-2 py-1 rounded-full">اليوم</span>}
                </div>
                
                <button 
                  onClick={() => openAddModal(dateStr, dayName)}
                  className="flex items-center gap-1 text-sm bg-white border border-slate-200 hover:border-primary-300 hover:text-primary-600 px-3 py-1.5 rounded-lg transition-all"
                >
                  <Plus size={16} /> <span className="hidden md:inline">إضافة موعد</span>
                </button>
              </div>

              {/* Appointments List */}
              <div className="p-4">
                {dayAppts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dayAppts.map((appt) => (
                      <div key={appt.id} className={`group relative border rounded-xl p-3 transition-all ${
                          appt.status === 'Cancelled' ? 'bg-slate-50 border-slate-100 opacity-70' : 'bg-white border-slate-100 hover:shadow-md hover:border-primary-200'
                      }`}>
                        {/* Header: Time & ID */}
                        <div className="flex justify-between items-start mb-2">
                           <div className={`flex items-center gap-2 font-bold px-2 py-1 rounded-md text-xs ${
                               appt.status === 'Cancelled' ? 'bg-slate-200 text-slate-500 line-through' : 'bg-primary-50 text-primary-700'
                           }`}>
                              <Clock size={12} /> {appt.time}
                           </div>
                           <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    appt.status === 'Scheduled' ? 'bg-blue-50 text-blue-600' :
                                    appt.status === 'Completed' ? 'bg-green-50 text-green-600' :
                                    'bg-red-50 text-red-600'
                                }`}>
                                    {appt.status === 'Scheduled' ? 'نشط' : appt.status === 'Completed' ? 'مكتمل' : 'ملغي'}
                                </span>
                                {appt.status === 'Scheduled' && (
                                    <button 
                                        onClick={() => handleStatusChange(appt.id, 'Cancelled')}
                                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                                        title="إلغاء الموعد"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                           </div>
                        </div>
                        
                        {/* Body: Client & Service */}
                        <h4 className={`font-bold text-slate-800 text-sm mb-1 ${appt.status === 'Cancelled' ? 'line-through text-slate-400' : ''}`}>
                            {appt.clientName}
                        </h4>
                        <p className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                            {appt.serviceType}
                        </p>
                         <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                            <MapPin size={12} /> {appt.location || 'لم يحدد الموقع'}
                        </p>
                        
                        {/* Footer: Creator info */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                           <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[10px]">
                              <UserCheck size={10} />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[9px] text-slate-400 leading-none">بواسطة</span>
                              <span className="text-[10px] font-bold text-indigo-600">{appt.createdBy}</span>
                           </div>
                        </div>

                        {/* Manager Audit Trail */}
                        {user.role === Role.MANAGER && (
                            <div className="mt-3 pt-2 border-t border-dashed border-slate-200">
                                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mb-1">
                                    <History size={10} /> سجل النشاط (للمدير فقط)
                                </p>
                                <div className="space-y-1 max-h-20 overflow-y-auto">
                                    {appt.history.map((log, idx) => (
                                        <div key={idx} className="text-[10px] text-slate-500 flex justify-between">
                                            <span>
                                                {log.action === 'Created' && 'تم الإنشاء'}
                                                {log.action === 'Cancelled' && <span className="text-red-500">تم الإلغاء</span>}
                                                {log.action === 'Completed' && <span className="text-green-500">تم الإكمال</span>}
                                                 : {log.by}
                                            </span>
                                            <span className="text-[9px] text-slate-300">{log.timestamp.split(',')[1]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-400 text-sm italic">
                    لا توجد مواعيد مسجلة لهذا اليوم
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
              <button 
                  onClick={() => setIsModalOpen(false)}
                  className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-1 rounded-full"
              >
                  <X size={20} />
              </button>
              
              <h3 className="text-xl font-bold text-slate-800 mb-1">حجز موعد جديد</h3>
              <p className="text-sm text-slate-500 mb-4">
                تاريخ: <span className="font-bold text-primary-600 dir-ltr">{selectedDateForAdd?.date}</span> ({selectedDateForAdd?.day})
              </p>
              
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 mb-4 flex gap-2 items-start">
                  <AlertCircle size={16} className="text-orange-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-orange-700">تأكد من اختيار توقيت متاح. النظام سيمنع الحجز المكرر في نفس الدقيقة.</p>
              </div>

              <form onSubmit={handleAddAppointment} className="space-y-3">
                  <div>
                      <label className="text-sm text-slate-700 block mb-1">اسم العميل</label>
                      <input 
                        required 
                        type="text" 
                        value={newAppt.clientName} 
                        onChange={(e) => setNewAppt({...newAppt, clientName: e.target.value})} 
                        className="w-full p-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-primary-200 outline-none" 
                        placeholder="الاسم الكامل"
                      />
                  </div>
                   <div>
                       <label className="text-sm text-slate-700 block mb-1">الموقع / العنوان</label>
                       <div className="relative">
                            <input 
                                required 
                                type="text" 
                                value={newAppt.location} 
                                onChange={(e) => setNewAppt({...newAppt, location: e.target.value})} 
                                className="w-full p-2 pl-8 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-primary-200 outline-none" 
                                placeholder="دبي، شارع..."
                            />
                            <MapPin size={16} className="absolute left-2 top-2.5 text-slate-400" />
                       </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-sm text-slate-700 block mb-1">الوقت</label>
                        <input 
                            required 
                            type="time" 
                            value={newAppt.time} 
                            onChange={(e) => setNewAppt({...newAppt, time: e.target.value})} 
                            className="w-full p-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-primary-200 outline-none" 
                        />
                    </div>
                    <div>
                        <label className="text-sm text-slate-700 block mb-1">نوع الخدمة</label>
                        <input 
                            required 
                            type="text" 
                            value={newAppt.serviceType} 
                            onChange={(e) => setNewAppt({...newAppt, serviceType: e.target.value})} 
                            className="w-full p-2 border rounded-lg bg-slate-50 focus:ring-2 focus:ring-primary-200 outline-none" 
                            placeholder="تنظيف، صيانة..."
                        />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all">
                      تأكيد الحجز
                    </button>
                  </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
