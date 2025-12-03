
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { UserCheck, UserX, Shield, DollarSign, Check } from 'lucide-react';

const Settings: React.FC = () => {
  const { currentUser, pendingUsers, approveSupervisor, rejectSupervisor } = useApp();
  const [salaryInput, setSalaryInput] = useState<{ [key: string]: string }>({});

  const handleSalaryChange = (userId: string, value: string) => {
      setSalaryInput({ ...salaryInput, [userId]: value });
  };

  const handleApprove = (userId: string) => {
      const salary = parseFloat(salaryInput[userId]);
      if (!salary || salary <= 0) {
          alert('يرجى تحديد راتب شهري صالح للمشرف قبل التفعيل');
          return;
      }
      if (window.confirm('هل أنت متأكد من تفعيل هذا المشرف واعتماد الراتب؟')) {
          approveSupervisor(userId, salary);
          // clear input
          const newInputs = { ...salaryInput };
          delete newInputs[userId];
          setSalaryInput(newInputs);
      }
  };

  if (!currentUser) return null;

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Shield className="text-primary-600" /> الإعدادات والصلاحيات
      </h2>

      {currentUser.role === Role.MANAGER ? (
          <div className="space-y-6">
              {/* --- Pending Requests --- */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <UserCheck size={20} className="text-orange-500" /> طلبات انضمام المشرفين
                      </h3>
                      {pendingUsers.length > 0 && (
                          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">{pendingUsers.length} طلب</span>
                      )}
                  </div>
                  
                  {pendingUsers.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-sm">
                          لا توجد طلبات معلقة حالياً.
                      </div>
                  ) : (
                      <div className="divide-y divide-slate-100">
                          {pendingUsers.map(user => (
                              <div key={user.id} className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                                  <div className="flex items-center gap-3 w-full md:w-auto">
                                      <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border border-slate-200" />
                                      <div>
                                          <h4 className="font-bold text-slate-800">{user.name}</h4>
                                          <p className="text-xs text-slate-500">{user.email}</p>
                                          <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full mt-1 inline-block">بانتظار الموافقة</span>
                                      </div>
                                  </div>

                                  <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto bg-slate-50 p-3 rounded-xl">
                                      <div className="w-full md:w-auto">
                                          <label className="text-[10px] font-bold text-slate-500 block mb-1">الراتب الشهري (للمشاريع)</label>
                                          <div className="relative">
                                              <input 
                                                type="number" 
                                                placeholder="مثال: 4000"
                                                value={salaryInput[user.id] || ''}
                                                onChange={(e) => handleSalaryChange(user.id, e.target.value)}
                                                className="w-full md:w-32 p-2 pl-6 border border-slate-200 rounded-lg text-sm outline-none focus:border-green-400"
                                              />
                                              <span className="absolute left-2 top-2 text-xs text-slate-400">د.إ</span>
                                          </div>
                                      </div>
                                      <button 
                                        onClick={() => handleApprove(user.id)}
                                        className="w-full md:w-auto bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                      >
                                          <Check size={16} /> موافقة وتعيين
                                      </button>
                                      <button 
                                        onClick={() => rejectSupervisor(user.id)}
                                        className="w-full md:w-auto bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                                      >
                                          <UserX size={16} /> رفض
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>

              {/* --- Company Settings Placeholder --- */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-bold text-slate-800 mb-4">بيانات الشركة الأساسية</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50 pointer-events-none">
                      <input type="text" value="شركة رويال للتنظيف والتعقيم" className="bg-slate-50 p-3 rounded-xl border border-slate-200" readOnly />
                      <input type="text" value="العين، الإمارات العربية المتحدة" className="bg-slate-50 p-3 rounded-xl border border-slate-200" readOnly />
                  </div>
              </div>
          </div>
      ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <UserCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">الملف الشخصي</h3>
              <p className="text-slate-500 mt-2">يمكنك تعديل كلمة المرور أو الصورة الشخصية من هنا.</p>
              <div className="mt-6 p-4 bg-blue-50 text-blue-700 rounded-xl text-sm border border-blue-100 inline-block">
                  حسابك نشط ومفعل بواسطة الإدارة.
              </div>
          </div>
      )}
    </div>
  );
};

export default Settings;
