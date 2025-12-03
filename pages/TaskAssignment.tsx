
import React, { useState } from 'react';
import { ClipboardCheck, User, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AssignedTask } from '../types';

const TaskAssignment: React.FC = () => {
  const { workers, assignedTasks, addAssignedTask, currentUser } = useApp();
  
  // Filter workers to show only Supervisors (based on logic in AppContext approveSupervisor)
  // In AppContext, supervisors are added as workers with role 'مشرف عام'
  const supervisors = workers.filter(w => w.role.includes('مشرف'));

  const [formData, setFormData] = useState({
      title: '',
      description: '',
      supervisorId: '',
      priority: 'Medium',
      dueDate: ''
  });

  const handleAssign = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.supervisorId) {
          alert('يرجى اختيار مشرف لتكليفه بالمهمة');
          return;
      }
      
      const selectedSupervisor = workers.find(w => w.id === formData.supervisorId);

      const newTask: AssignedTask = {
          id: `TASK-${Date.now()}`,
          title: formData.title,
          description: formData.description,
          assignedToId: formData.supervisorId,
          assignedToName: selectedSupervisor?.name || 'Unknown',
          assignedBy: currentUser?.name || 'الإدارة',
          priority: formData.priority as any,
          status: 'Pending',
          dueDate: formData.dueDate,
          createdAt: new Date().toISOString()
      };

      addAssignedTask(newTask);
      setFormData({ title: '', description: '', supervisorId: '', priority: 'Medium', dueDate: '' });
      alert('تم تكليف المهمة للمشرف بنجاح');
  };

  return (
    <div className="p-4 md:p-6 pb-20">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <ClipboardCheck className="text-primary-600" /> تكليف وتوزيع المهام
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assignment Form */}
          <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h3 className="font-bold text-slate-800 mb-4">إسناد مهمة جديدة</h3>
                  <form onSubmit={handleAssign} className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">عنوان المهمة</label>
                          <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none" placeholder="مثال: زيارة تفتيشية لموقع..." />
                      </div>
                      
                      <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">المشرف المسؤول</label>
                          <select required value={formData.supervisorId} onChange={e => setFormData({...formData, supervisorId: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none">
                              <option value="">اختر مشرف...</option>
                              {supervisors.map(s => (
                                  <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                          </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                           <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">الأولوية</label>
                              <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none">
                                  <option value="Low">عادية</option>
                                  <option value="Medium">متوسطة</option>
                                  <option value="High">عاجلة</option>
                              </select>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-slate-700 block mb-1">آخر موعد</label>
                              <input required type="date" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none" />
                          </div>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">التفاصيل</label>
                          <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border border-slate-200 rounded-lg outline-none h-24 resize-none"></textarea>
                      </div>

                      <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all">
                          إرسال التكليف
                      </button>
                  </form>
              </div>
          </div>

          {/* Tasks List */}
          <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-800">سجل المهام المرسلة</h3>
              {assignedTasks.length === 0 ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-slate-500">لا توجد مهام مكلفة حتى الآن</p>
                  </div>
              ) : (
                  assignedTasks.map(task => (
                      <div key={task.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                          <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bold text-slate-800">{task.title}</h4>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                      task.priority === 'High' ? 'bg-red-100 text-red-700' :
                                      task.priority === 'Medium' ? 'bg-orange-100 text-orange-700' :
                                      'bg-blue-100 text-blue-700'
                                  }`}>
                                      {task.priority === 'High' ? 'عاجلة' : task.priority === 'Medium' ? 'متوسطة' : 'عادية'}
                                  </span>
                              </div>
                              <p className="text-sm text-slate-500 mb-2">{task.description}</p>
                              <div className="flex gap-4 text-xs text-slate-400">
                                  <span className="flex items-center gap-1"><User size={12}/> {task.assignedToName}</span>
                                  <span className="flex items-center gap-1"><Calendar size={12}/> حتى: {task.dueDate}</span>
                              </div>
                          </div>
                          
                          <div className="shrink-0">
                               <span className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${
                                   task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                   task.status === 'InProgress' ? 'bg-blue-100 text-blue-700' :
                                   'bg-slate-100 text-slate-600'
                               }`}>
                                   {task.status === 'Completed' && <CheckCircle2 size={14} />}
                                   {task.status === 'InProgress' && <Clock size={14} />}
                                   {task.status === 'Pending' && <AlertCircle size={14} />}
                                   {task.status === 'Completed' ? 'تم الإنجاز' : task.status === 'InProgress' ? 'جاري التنفيذ' : 'قيد الانتظار'}
                               </span>
                          </div>
                      </div>
                  ))
              )}
          </div>
      </div>
    </div>
  );
};

export default TaskAssignment;
