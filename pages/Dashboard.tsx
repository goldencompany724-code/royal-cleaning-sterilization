
import React, { useState } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  FileText,
  PhoneCall,
  X,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CalendarDays,
  Briefcase,
  AlertTriangle,
  Fuel,
  ShieldAlert,
  ClipboardCheck,
  Check,
  Play
} from 'lucide-react';
import { Role, Inquiry, User, Appointment } from '../types';
import { useApp } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const { workers, reports, inquiries, appointments, addInquiry, addAppointment, inventory, vehicles, assignedTasks, updateTaskStatus } = useApp();
  const role = user.role;
  const navigate = useNavigate();

  // Modals State
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  
  // Forms State
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    phone: '',
    channel: 'Call' as 'Call' | 'WhatsApp',
    type: 'Service' as 'Service' | 'Price' | 'General',
    notes: ''
  });

  const [appointmentForm, setAppointmentForm] = useState({
    clientName: '',
    day: 'الأحد',
    date: '',
    time: '',
    serviceType: '',
    location: ''
  });

  const activeWorkers = workers.filter(w => w.status === 'Active').length;
  const recentReports = reports.length;
  const newInquiriesCount = inquiries.filter(i => i.status === 'New').length;
  const totalTasks = reports.reduce((acc, report) => acc + (report.workDescription ? 1 : 0), 0);

  // Alerts Logic
  const criticalInventory = inventory.filter(i => i.status === 'Critical' || i.status === 'Low');
  const vehicleAlerts = vehicles.filter(v => v.currentMileage >= v.nextOilChangeMileage - 500);
  
  // Supervisor Tasks
  const myTasks = assignedTasks.filter(t => t.assignedToId === user.id && t.status !== 'Completed');

  const chartData = [
    { name: 'السبت', tasks: 12, income: 4000 },
    { name: 'الأحد', tasks: 19, income: 3000 },
    { name: 'الاثنين', tasks: 15, income: 2000 },
    { name: 'الثلاثاء', tasks: 22, income: 2780 },
    { name: 'الأربعاء', tasks: 28, income: 1890 },
    { name: 'الخميس', tasks: 25, income: 2390 },
    { name: 'الجمعة', tasks: 10, income: 3490 },
  ];

  const weekDays = [
    { en: 'Sat', ar: 'سبت', date: '30' },
    { en: 'Sun', ar: 'أحد', date: '1' },
    { en: 'Mon', ar: 'اثنين', date: '2' },
    { en: 'Tue', ar: 'ثلاثاء', date: '3' },
    { en: 'Wed', ar: 'أربعاء', date: '4' },
    { en: 'Thu', ar: 'خميس', date: '5' },
    { en: 'Fri', ar: 'جمعة', date: '6' },
  ];

  const handleSaveInquiry = (e: React.FormEvent) => {
      e.preventDefault();
      const newInquiry: Inquiry = {
          id: `INQ${Date.now()}`,
          customerName: inquiryForm.name,
          phone: inquiryForm.phone,
          channel: inquiryForm.channel,
          type: inquiryForm.type,
          notes: inquiryForm.notes,
          date: new Date().toISOString().split('T')[0],
          status: 'New'
      };
      addInquiry(newInquiry);
      setIsQuickTaskOpen(false);
      setInquiryForm({ name: '', phone: '', channel: 'Call', type: 'Service', notes: '' });
      alert('تم تسجيل الاستفسار بنجاح وسيظهر في لوحة المدير.');
  };

  const handleSaveAppointment = (e: React.FormEvent) => {
      e.preventDefault();
      const newAppt: Appointment = {
          id: `APT${Date.now()}`,
          clientName: appointmentForm.clientName,
          day: appointmentForm.day,
          date: appointmentForm.date || new Date().toISOString().split('T')[0],
          time: appointmentForm.time,
          serviceType: appointmentForm.serviceType,
          location: appointmentForm.location,
          createdBy: user.name, 
          status: 'Scheduled',
          history: [{
              action: 'Created',
              by: user.name,
              timestamp: new Date().toISOString()
          }]
      };
      addAppointment(newAppt);
      setIsAppointmentModalOpen(false);
      setAppointmentForm({ clientName: '', day: 'الأحد', date: '', time: '', serviceType: '', location: '' });
  };

  const StatCard: React.FC<{ 
    title: string; 
    value: string; 
    subValue: string; 
    icon: any; 
    color: string;
    subColor: string;
  }> = ({ title, value, subValue, icon: Icon, color, subColor }) => (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${color} text-white shadow-sm`}>
          <Icon size={24} />
        </div>
        {subValue.includes('+') ? (
            <span className={`${subColor} text-xs font-bold px-2 py-1 rounded-full bg-opacity-10`}>
                {subValue}
            </span>
        ) : (
            <span className="text-red-600 bg-red-50 text-xs font-bold px-2 py-1 rounded-full">
                {subValue}
            </span>
        )}
      </div>
      <div>
        <h3 className="text-2xl font-bold text-slate-800 mb-1">{value}</h3>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
      </div>
    </div>
  );

  // Financial Calculations for Manager
  const totalRevenue = reports.reduce((acc, r) => acc + (parseFloat(r.cost || '0') || 0), 0);
  const totalExpenses = reports.reduce((acc, r) => {
      const labor = r.workerDetails?.reduce((wAcc, w) => wAcc + (w.workerType === 'External' ? w.cost : 0), 0) || 0;
      const materials = r.consumedMaterials?.reduce((mAcc, m) => mAcc + m.costAtTime, 0) || 0;
      const cash = r.cashExpenses?.reduce((cAcc, c) => cAcc + c.amount, 0) || 0;
      return acc + labor + materials + cash;
  }, 0);

  return (
    <div className="p-4 md:p-6 space-y-6 overflow-y-auto h-full pb-24 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
              {role === Role.MANAGER ? 'لوحة القيادة والتحليل' : 'مرحباً، محمد المشرف'}
          </h2>
          <p className="text-slate-500 mt-1">
             {role === Role.MANAGER 
                ? 'ملخص العمليات المالية وأداء الشركة.' 
                : 'إليك نظرة سريعة على أداء اليوم والمهام المكلفة.'}
          </p>
        </div>
        
        {role === Role.MANAGER && (
             <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 self-start md:self-auto">تصدير تقرير مالي</button>
        )}
      </div>

      {role === Role.MANAGER && (criticalInventory.length > 0 || vehicleAlerts.length > 0) && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
              <h3 className="text-red-700 font-bold flex items-center gap-2 mb-3">
                  <ShieldAlert size={20} /> تنبيهات حرجة تتطلب انتباهك
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {criticalInventory.map(item => (
                      <div key={item.id} className="bg-white p-3 rounded-lg border border-red-100 flex items-center justify-between shadow-sm">
                          <span className="text-sm font-medium text-slate-700">مخزون منخفض: {item.name}</span>
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">{item.quantity} {item.unit}</span>
                      </div>
                  ))}
                   {vehicleAlerts.map(v => (
                      <div key={v.id} className="bg-white p-3 rounded-lg border border-orange-100 flex items-center justify-between shadow-sm">
                          <span className="text-sm font-medium text-slate-700">صيانة زيت: {v.make} {v.plateNumber}</span>
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold"><Fuel size={12} className="inline mr-1"/>مطلوب</span>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* --- SECTION 1: STATS --- */}
      {role === Role.MANAGER ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <StatCard title="الإيرادات" value={`${totalRevenue.toLocaleString()} د.إ`} subValue="+8.1%" icon={TrendingUp} color="bg-emerald-500" subColor="text-emerald-600 bg-emerald-50" />
            <StatCard title="المصروفات (التشغيلية)" value={`${totalExpenses.toLocaleString()} د.إ`} subValue="+0%" icon={FileText} color="bg-red-500" subColor="text-red-600 bg-red-50" />
            <StatCard title="استفسارات العملاء" value={inquiries.length.toString()} subValue={`+${newInquiriesCount} جديد`} icon={PhoneCall} color="bg-purple-500" subColor="text-purple-600 bg-purple-50" />
            <StatCard title="إجمالي العمال" value={workers.length.toString()} subValue="+2.5%" icon={Users} color="bg-blue-500" subColor="text-blue-600 bg-blue-50" />
          </div>
      ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="المواعيد" value={appointments.length.toString()} subValue="+10%" icon={CalendarDays} color="bg-indigo-500" subColor="text-emerald-600 bg-emerald-50" />
            <StatCard title="العمال" value={workers.length.toString()} subValue="+2.5%" icon={Users} color="bg-blue-500" subColor="text-emerald-600 bg-emerald-50" />
             <StatCard title="اليوميات" value={recentReports.toString()} subValue="-1.4%" icon={FileText} color="bg-orange-500" subColor="text-red-600 bg-red-50" />
             <StatCard title="المهام" value={totalTasks.toString()} subValue="+5.2%" icon={ClipboardList} color="bg-teal-500" subColor="text-emerald-600 bg-emerald-50" />
          </div>
      )}

      {/* --- SECTION 2: CONTENT --- */}
      {role === Role.MANAGER ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm min-w-0">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-slate-800">التحليل المالي الأسبوعي</h3>
                </div>
                <div className="w-full h-72" dir="ltr" style={{ minWidth: 0 }}>
                    {totalRevenue === 0 ? (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm border-2 border-dashed rounded-xl">
                            لا توجد بيانات مالية للعرض حالياً
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <Tooltip />
                                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
             </div>

             <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[400px]">
                <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center justify-between">
                    استفسارات العملاء
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">{newInquiriesCount} جديد</span>
                </h3>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {inquiries.length > 0 ? inquiries.map((inq) => (
                         <div key={inq.id} className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer relative">
                            {inq.status === 'New' && <div className="absolute top-3 left-3 w-2 h-2 bg-red-500 rounded-full"></div>}
                            <h4 className="font-bold text-slate-800 text-sm">{inq.customerName}</h4>
                            <p className="text-xs text-slate-500 mt-1">{inq.notes}</p>
                            <div className="mt-2 flex items-center gap-2">
                                 <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">{inq.type}</span>
                                 <span className="text-[10px] text-slate-400">{inq.date}</span>
                                 <span className="text-[10px] text-indigo-500 font-bold">{inq.channel === 'Call' ? 'اتصال' : 'واتساب'}</span>
                            </div>
                         </div>
                    )) : <p className="text-center text-slate-400 py-10">لا توجد استفسارات</p>}
                </div>
             </div>
          </div>
      ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                  <h3 className="font-bold text-slate-800 px-1">إجراءات سريعة</h3>
                  <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setIsQuickTaskOpen(true)}
                        className="bg-primary-600 text-white p-4 rounded-xl shadow-md shadow-primary-200 hover:bg-primary-700 transition-all flex flex-col items-center justify-center gap-2"
                      >
                          <PhoneCall size={24} />
                          <span className="text-xs font-bold">تسجيل استفسار</span>
                      </button>

                      <button 
                        onClick={() => setIsAppointmentModalOpen(true)}
                        className="bg-indigo-600 text-white p-4 rounded-xl shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all flex flex-col items-center justify-center gap-2"
                      >
                          <Calendar size={24} />
                          <span className="text-xs font-bold">حجز موعد</span>
                      </button>

                      <button 
                        onClick={() => navigate('/reports/new')}
                        className="bg-white border border-slate-200 text-slate-700 p-4 rounded-xl hover:bg-slate-50 transition-all flex flex-col items-center justify-center gap-2"
                      >
                          <FileText size={24} className="text-slate-400" />
                          <span className="text-xs font-bold">يومية جديدة</span>
                      </button>

                      <button 
                        onClick={() => navigate('/workers')}
                        className="bg-white border border-slate-200 text-slate-700 p-4 rounded-xl hover:bg-slate-50 transition-all flex flex-col items-center justify-center gap-2"
                      >
                          <Briefcase size={24} className="text-slate-400" />
                          <span className="text-xs font-bold">إضافة عامل</span>
                      </button>
                  </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                   {/* Assigned Tasks Widget for Supervisor */}
                   {myTasks.length > 0 && (
                        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4">
                            <h3 className="text-orange-800 font-bold flex items-center gap-2 mb-3">
                                <ClipboardCheck size={20} /> مهام مكلفة من الإدارة
                            </h3>
                            <div className="space-y-3">
                                {myTasks.map(task => (
                                    <div key={task.id} className="bg-white p-3 rounded-xl border border-orange-100 shadow-sm flex flex-col md:flex-row justify-between gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-800 text-sm">{task.title}</h4>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${task.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                                                    {task.priority === 'High' ? 'عاجلة' : 'عادية'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">{task.description}</p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {task.status === 'Pending' && (
                                                <button onClick={() => updateTaskStatus(task.id, 'InProgress')} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
                                                    <Play size={12} /> بدء
                                                </button>
                                            )}
                                            {task.status === 'InProgress' && (
                                                <button onClick={() => updateTaskStatus(task.id, 'Completed')} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
                                                    <Check size={12} /> إنجاز
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                   )}

                   {/* Recent Reports */}
                   <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-slate-800">آخر اليوميات المنجزة</h3>
                            <Link to="/reports" className="text-primary-600 text-sm font-medium hover:underline">عرض الكل</Link>
                        </div>
                        {reports.length > 0 ? (
                            <div className="space-y-4">
                                {reports.slice(0, 3).map(r => (
                                    <div key={r.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary-600 border border-slate-200">
                                                <CheckCircle2 size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm">تم إنجاز العمل في {r.siteLocation}</h4>
                                                <p className="text-xs text-slate-500">بواسطة {r.supervisor} • {r.date}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">مكتمل</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                                <p>لا توجد نشاطات مسجلة اليوم</p>
                            </div>
                        )}
                  </div>
              </div>
          </div>
      )}

      {/* --- WEEKLY SCHEDULE --- */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Calendar size={20} />
                  </div>
                  <div>
                      <h3 className="font-bold text-lg text-slate-800">جدول الأسبوع الحالي</h3>
                      <Link to="/schedule" className="text-xs text-indigo-600 hover:underline">عرض الجدول الكامل</Link>
                  </div>
              </div>
              
              <div className="flex gap-2 self-end">
                   <button 
                        onClick={() => navigate('/schedule')}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"
                      >
                          إدارة المواعيد <ChevronLeft size={16} />
                   </button>
              </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {weekDays.map((day, index) => {
                  const dayAppointments = appointments.filter(a => a.day.includes(day.ar));
                  return (
                    <div key={index} className="flex flex-col gap-3 bg-white">
                        <div className={`text-center p-3 rounded-xl border transition-colors ${index === 3 ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-indigo-200'}`}>
                            <p className={`text-xs font-medium ${index === 3 ? 'opacity-100' : 'opacity-80'}`}>{day.en}</p>
                            <p className="text-lg font-bold">{day.date}</p>
                        </div>
                        <div className="space-y-2 min-h-[40px]">
                            {dayAppointments.length > 0 ? (
                                <div className="bg-indigo-50 border border-indigo-100 p-2 rounded-xl text-center animate-in fade-in zoom-in duration-300">
                                    <span className="text-xs font-bold text-indigo-700">{dayAppointments.length} موعد</span>
                                </div>
                            ) : (
                                <div className="hidden md:block h-full"></div> 
                            )}
                        </div>
                    </div>
                  );
              })}
          </div>
      </div>

      {isQuickTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
                <button onClick={() => setIsQuickTaskOpen(false)} className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-1 rounded-full"><X size={20} /></button>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><PhoneCall className="text-primary-600" /> تسجيل استفسار جديد</h3>
                <p className="text-sm text-slate-500 mb-6">سيتم إرسال بيانات العميل مباشرة إلى لوحة المدير.</p>
                <form onSubmit={handleSaveInquiry} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-slate-700 block mb-1">اسم العميل</label>
                            <input required type="text" value={inquiryForm.name} onChange={(e) => setInquiryForm({...inquiryForm, name: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50" />
                        </div>
                        <div>
                            <label className="text-sm text-slate-700 block mb-1">رقم الهاتف</label>
                            <input required type="tel" value={inquiryForm.phone} onChange={(e) => setInquiryForm({...inquiryForm, phone: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-slate-700 block mb-1">نوع الاستفسار</label>
                            <select value={inquiryForm.type} onChange={(e: any) => setInquiryForm({...inquiryForm, type: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50">
                                <option value="Service">خدمة</option>
                                <option value="Price">سعر</option>
                                <option value="General">عام</option>
                            </select>
                        </div>
                         <div>
                            <label className="text-sm text-slate-700 block mb-1">طريقة التواصل</label>
                            <select value={inquiryForm.channel} onChange={(e: any) => setInquiryForm({...inquiryForm, channel: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50">
                                <option value="Call">اتصال هاتفي</option>
                                <option value="WhatsApp">واتساب</option>
                            </select>
                        </div>
                    </div>
                    <div>
                         <label className="text-sm text-slate-700 block mb-1">ملاحظات</label>
                         <textarea value={inquiryForm.notes} onChange={(e) => setInquiryForm({...inquiryForm, notes: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50 h-24" placeholder="تفاصيل الطلب..."></textarea>
                    </div>
                    <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all">حفظ وإرسال</button>
                </form>
            </div>
        </div>
      )}

      {isAppointmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
                 <button onClick={() => setIsAppointmentModalOpen(false)} className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-1 rounded-full"><X size={20} /></button>
                <h3 className="text-xl font-bold text-slate-800 mb-1">حجز موعد جديد</h3>
                <p className="text-xs text-slate-500 mb-4">سيتم تسجيل الموعد باسمك: <span className="text-indigo-600 font-bold">{user.name}</span></p>
                <form onSubmit={handleSaveAppointment} className="space-y-3">
                    <div>
                        <label className="text-sm text-slate-700 block mb-1">اسم العميل</label>
                        <input required type="text" value={appointmentForm.clientName} onChange={(e) => setAppointmentForm({...appointmentForm, clientName: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50" placeholder="الاسم الكامل" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-sm text-slate-700 block mb-1">اليوم</label>
                            <select value={appointmentForm.day} onChange={(e) => setAppointmentForm({...appointmentForm, day: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50">
                                <option>السبت</option>
                                <option>الأحد</option>
                                <option>الاثنين</option>
                                <option>الثلاثاء</option>
                                <option>الأربعاء</option>
                                <option>الخميس</option>
                                <option>الجمعة</option>
                            </select>
                        </div>
                         <div>
                            <label className="text-sm text-slate-700 block mb-1">الوقت</label>
                            <input required type="time" value={appointmentForm.time} onChange={(e) => setAppointmentForm({...appointmentForm, time: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-slate-700 block mb-1">نوع الخدمة</label>
                         <input required type="text" value={appointmentForm.serviceType} onChange={(e) => setAppointmentForm({...appointmentForm, serviceType: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50" placeholder="مثال: تنظيف فيلا" />
                    </div>
                    <div>
                        <label className="text-sm text-slate-700 block mb-1">الموقع</label>
                         <input required type="text" value={appointmentForm.location} onChange={(e) => setAppointmentForm({...appointmentForm, location: e.target.value})} className="w-full p-2 border rounded-lg bg-slate-50" placeholder="العنوان" />
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 mt-2 shadow-lg shadow-indigo-200">تأكيد الحجز</button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
