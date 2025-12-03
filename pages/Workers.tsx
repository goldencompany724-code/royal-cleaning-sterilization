
import React, { useState } from 'react';
import { Search, Filter, Phone, BadgeCheck, X, UserPlus, Trash2, Edit } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Worker } from '../types';

const Workers: React.FC = () => {
  const { workers, addWorker, deleteWorker } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [workerType, setWorkerType] = useState<'Company' | 'External'>('Company');
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerPhone, setNewWorkerPhone] = useState('');
  const [newWorkerId, setNewWorkerId] = useState('');
  const [newWorkerRole, setNewWorkerRole] = useState('عامل نظافة');
  const [newWorkerStatus, setNewWorkerStatus] = useState<'Active' | 'Inactive' | 'OnLeave'>('Active');
  const [newWorkerRate, setNewWorkerRate] = useState<number>(0);

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    const newWorker: Worker = {
      id: `W${Math.floor(Math.random() * 1000)}`,
      name: newWorkerName,
      role: newWorkerRole,
      status: newWorkerStatus,
      phone: newWorkerPhone,
      identityNumber: newWorkerId,
      workerType: workerType,
      joinDate: new Date().toISOString().split('T')[0],
      wageType: workerType === 'Company' ? 'Monthly' : 'Daily',
      baseRate: Number(newWorkerRate)
    };
    addWorker(newWorker);
    resetForm();
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setNewWorkerName('');
    setNewWorkerPhone('');
    setNewWorkerId('');
    setNewWorkerRole('عامل نظافة');
    setNewWorkerStatus('Active');
    setWorkerType('Company');
    setNewWorkerRate(0);
  }

  // Mobile Card Component
  const WorkerCard = ({ worker }: { worker: Worker }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-3">
        <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
                    {worker.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1">
                        {worker.name}
                         {worker.workerType === 'External' && <span className="text-[9px] bg-slate-100 px-1.5 rounded text-slate-500">خارجي</span>}
                    </h4>
                    <p className="text-xs text-slate-500">{worker.role}</p>
                </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                worker.status === 'Active' ? 'bg-green-100 text-green-700' :
                worker.status === 'OnLeave' ? 'bg-orange-100 text-orange-700' :
                'bg-slate-100 text-slate-600'
            }`}>
                {worker.status === 'Active' ? 'نشط' : worker.status === 'OnLeave' ? 'إجازة' : 'غير نشط'}
            </span>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
            <div className="text-xs text-slate-400 font-mono">{worker.phone}</div>
            <div className="flex gap-2">
                <button className="p-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100">
                    <Phone size={16} />
                </button>
                <button onClick={() => deleteWorker(worker.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">إدارة العمال</h2>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-primary-600 text-white px-4 py-2.5 rounded-xl hover:bg-primary-700 font-medium shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2"
        >
          <UserPlus size={18} /> إضافة عامل
        </button>
      </div>

      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                <th className="px-6 py-4">الاسم</th>
                <th className="px-6 py-4">الدور</th>
                <th className="px-6 py-4">الأجر</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {workers.map((worker) => (
                <tr key={worker.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs">
                                {worker.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <div className="font-medium text-slate-800 text-sm flex items-center gap-2">
                                    {worker.name}
                                    {worker.workerType === 'External' && <span className="text-[10px] bg-slate-100 px-1.5 rounded text-slate-500">خارجي</span>}
                                </div>
                                <span className="text-xs text-slate-400 block font-mono">{worker.phone}</span>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                        {worker.role}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">
                        {worker.baseRate?.toLocaleString()} {worker.wageType === 'Monthly' ? 'شهري' : 'يومي'}
                    </td>
                    <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        worker.status === 'Active' ? 'bg-green-100 text-green-700' :
                        worker.status === 'OnLeave' ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-600'
                    }`}>
                        {worker.status === 'Active' ? 'نشط' : worker.status === 'OnLeave' ? 'إجازة' : 'غير نشط'}
                    </span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                                <Edit size={16} />
                            </button>
                            <button 
                                onClick={() => deleteWorker(worker.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-3 pb-20">
            {workers.map((worker) => (
                <WorkerCard key={worker.id} worker={worker} />
            ))}
        </div>

      {/* Add Worker Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                <button 
                    onClick={resetForm} 
                    className="absolute left-4 top-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-1 rounded-full"
                >
                    <X size={20} />
                </button>
                
                <h3 className="text-xl font-bold text-slate-800 mb-6">إضافة عامل جديد</h3>
                
                {/* Custom Toggle */}
                <div className="bg-slate-100 p-1.5 rounded-xl flex mb-6 relative">
                    <button 
                        onClick={() => setWorkerType('Company')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                            workerType === 'Company' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                         عامل شركة
                    </button>
                    <button 
                         onClick={() => setWorkerType('External')}
                        className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                            workerType === 'External' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                         عامل خارجي
                    </button>
                </div>

                <form onSubmit={handleAddWorker} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-500 mb-1.5 px-1">الاسم</label>
                        <input required value={newWorkerName} onChange={e => setNewWorkerName(e.target.value)} type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                    </div>
                    
                    <div>
                        <label className="block text-sm text-slate-500 mb-1.5 px-1">رقم الهاتف</label>
                        <input required value={newWorkerPhone} onChange={e => setNewWorkerPhone(e.target.value)} type="tel" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                    </div>

                     <div>
                        <label className="block text-sm text-slate-500 mb-1.5 px-1">رقم الهوية</label>
                        <input required value={newWorkerId} onChange={e => setNewWorkerId(e.target.value)} type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-500 mb-1.5 px-1">الدور</label>
                            <input required value={newWorkerRole} onChange={e => setNewWorkerRole(e.target.value)} type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" />
                        </div>
                        <div>
                             <label className="block text-sm text-slate-500 mb-1.5 px-1">{workerType === 'Company' ? 'الراتب الشهري' : 'اليومية المعتادة'}</label>
                             <input required type="number" value={newWorkerRate} onChange={e => setNewWorkerRate(Number(e.target.value))} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" />
                        </div>
                    </div>

                     <div>
                        <label className="block text-sm text-slate-500 mb-1.5 px-1">الحالة</label>
                        <select value={newWorkerStatus} onChange={e => setNewWorkerStatus(e.target.value as any)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none">
                            <option value="Active">نشط</option>
                            <option value="Inactive">غير نشط</option>
                            <option value="OnLeave">إجازة</option>
                        </select>
                    </div>

                    <div className="flex gap-3 mt-6 pt-2 sticky bottom-0 bg-white pb-2">
                        <button type="submit" className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 shadow-lg shadow-primary-200 transition-colors">
                            حفظ
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Workers;
