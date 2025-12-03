
import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Sparkles, 
  Save,
  Car,
  Clock,
  Phone,
  DollarSign,
  CreditCard,
  FileText,
  Image as ImageIcon,
  ArrowLeft,
  Package,
  Trash2,
  Users,
  Utensils
} from 'lucide-react';
import { generateReportSummary } from '../services/geminiService';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Report, User, ConsumedMaterial, WorkerCostDetail, CashExpense } from '../types';

interface NewReportProps {
  user: User;
}

const NewReport: React.FC<NewReportProps> = ({ user }) => {
  const { addReport, inventory, workers } = useApp();
  const navigate = useNavigate();
  
  const [loadingAi, setLoadingAi] = useState(false);
  const [summary, setSummary] = useState('');
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    carNumber: '',
    startTime: '09:00',
    endTime: '17:00',
    clientName: '',
    clientPhone: '',
    clientLocation: '',
    amount: '',
    paymentMethod: 'كاش',
    description: '',
    notes: ''
  });

  // Enhanced Workers Logic
  const [selectedWorkers, setSelectedWorkers] = useState<WorkerCostDetail[]>([
      { workerId: '', workerName: '', workerType: 'Company', cost: 0 }
  ]);
  
  const [materialsList, setMaterialsList] = useState<ConsumedMaterial[]>([]);
  const [expensesList, setExpensesList] = useState<CashExpense[]>([]);

  // Worker Handlers
  const addWorkerRow = () => {
      setSelectedWorkers([...selectedWorkers, { workerId: '', workerName: '', workerType: 'Company', cost: 0 }]);
  };

  const removeWorkerRow = (index: number) => {
      setSelectedWorkers(selectedWorkers.filter((_, i) => i !== index));
  };

  const updateWorkerRow = (index: number, field: keyof WorkerCostDetail, value: any) => {
      const updated = [...selectedWorkers];
      if (field === 'workerId') {
          const worker = workers.find(w => w.id === value);
          if (worker) {
              updated[index].workerId = worker.id;
              updated[index].workerName = worker.name;
              updated[index].workerType = worker.workerType || 'Company';
              // If external, default to baseRate as initial cost estimate, else 0
              updated[index].cost = worker.workerType === 'External' ? (worker.baseRate || 0) : 0;
          }
      } else {
          updated[index] = { ...updated[index], [field]: value };
      }
      setSelectedWorkers(updated);
  };

  // Materials Handlers
  const addMaterialRow = () => {
      setMaterialsList([...materialsList, { itemId: '', itemName: '', quantity: 1, unit: '', costAtTime: 0 }]);
  };

  const removeMaterialRow = (index: number) => {
      setMaterialsList(materialsList.filter((_, i) => i !== index));
  };

  const updateMaterialRow = (index: number, field: keyof ConsumedMaterial, value: any) => {
      const updated = [...materialsList];
      
      if (field === 'itemId') {
          const item = inventory.find(i => i.id === value);
          if (item) {
              updated[index].itemId = item.id;
              updated[index].itemName = item.name;
              updated[index].unit = item.unit;
              updated[index].costAtTime = item.price * updated[index].quantity;
          }
      } else if (field === 'quantity') {
           updated[index].quantity = Number(value);
           // Recalculate cost
           const item = inventory.find(i => i.id === updated[index].itemId);
           if (item) {
               updated[index].costAtTime = item.price * Number(value);
           }
      } else {
          updated[index] = { ...updated[index], [field]: value };
      }
      setMaterialsList(updated);
  };

  // Cash Expenses Handlers
  const addExpenseRow = () => {
    setExpensesList([...expensesList, { description: '', amount: 0 }]);
  };

  const removeExpenseRow = (index: number) => {
    setExpensesList(expensesList.filter((_, i) => i !== index));
  };

  const updateExpenseRow = (index: number, field: keyof CashExpense, value: any) => {
      const updated = [...expensesList];
      updated[index] = { ...updated[index], [field]: value };
      setExpensesList(updated);
  };

  // Calculated Financials
  const totalRevenue = parseFloat(formData.amount || '0');
  const totalExternalCost = selectedWorkers.reduce((acc, curr) => acc + (curr.workerType === 'External' ? Number(curr.cost) : 0), 0);
  const totalMaterialCost = materialsList.reduce((acc, curr) => acc + curr.costAtTime, 0);
  const totalCashExpenses = expensesList.reduce((acc, curr) => acc + Number(curr.amount), 0);
  
  // Note: This net profit in "New Report" is just CASH flow (In - Out). 
  // Real Net Profit (including salaries) is calculated in "Projects" view for the Manager.
  const netCashFlow = totalRevenue - (totalExternalCost + totalMaterialCost + totalCashExpenses);

  const handleGenerateSummary = async () => {
    if (!formData.description) {
        alert('الرجاء إدخال وصف الأعمال أولاً');
        return;
    }
    setLoadingAi(true);
    const result = await generateReportSummary(
        formData.date, 
        formData.clientLocation, 
        [formData.description], 
        formData.notes
    );
    setSummary(result);
    setLoadingAi(false);
  };

  const handleSave = () => {
      if (!formData.clientName) {
          alert('يرجى إدخال اسم العميل');
          return;
      }

      const validWorkers = selectedWorkers.filter(w => w.workerId !== '');

      const newReport: Report = {
          id: `R${Date.now()}`,
          date: formData.date,
          carNumber: formData.carNumber,
          
          clientName: formData.clientName,
          clientPhone: formData.clientPhone,
          siteLocation: formData.clientLocation,
          
          startTime: formData.startTime,
          endTime: formData.endTime,
          workDescription: formData.description,
          
          workerNames: validWorkers.map(w => w.workerName),
          workerDetails: validWorkers,
          
          consumedMaterials: materialsList.filter(m => m.itemId !== ''),
          cashExpenses: expensesList.filter(e => e.description !== ''),

          cost: formData.amount,
          paymentMethod: formData.paymentMethod,
          
          notes: formData.notes,
          aiSummary: summary,
          status: 'Pending',
          supervisor: user.name,
          supervisorId: user.id 
      };

      addReport(newReport);
      navigate('/reports');
  };

  return (
    <div className="p-4 md:p-6 pb-24 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <span className="text-3xl">📝</span> يومية عمل
           </h2>
           <p className="text-slate-500 text-xs mt-1">توثيق العمليات والمصاريف بدقة.</p>
        </div>
        <button onClick={() => navigate(-1)} className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200">
            <ArrowLeft size={20} />
        </button>
      </div>

      <div className="space-y-6">
        
        {/* Date & Car */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 px-1">التاريخ</label>
                <div className="relative">
                    <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-left dir-ltr" />
                    <Calendar className="absolute right-4 top-3.5 text-slate-400 pointer-events-none md:left-4 md:right-auto" size={18} />
                </div>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5 px-1">رقم السيارة</label>
                <div className="relative">
                    <input type="text" placeholder="رقم اللوحة" value={formData.carNumber} onChange={(e) => setFormData({...formData, carNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none" />
                    <Car className="absolute left-4 top-3.5 text-slate-400 pointer-events-none" size={18} />
                </div>
            </div>
        </div>

        <hr className="border-slate-100" />

        {/* Client Details */}
        <div>
            <h3 className="text-sm font-bold text-slate-800 mb-4">بيانات العميل</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1.5">الاسم</label>
                    <input type="text" value={formData.clientName} onChange={(e) => setFormData({...formData, clientName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none" />
                </div>
                 <div>
                    <label className="text-xs font-bold text-slate-500 block mb-1.5">الهاتف</label>
                    <div className="relative">
                        <input type="tel" value={formData.clientPhone} onChange={(e) => setFormData({...formData, clientPhone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none" />
                        <Phone className="absolute left-4 top-3.5 text-slate-400" size={16} />
                    </div>
                </div>
                 <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 block mb-1.5">الموقع</label>
                    <div className="relative">
                        <input type="text" value={formData.clientLocation} onChange={(e) => setFormData({...formData, clientLocation: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none" />
                        <MapPin className="absolute left-4 top-3.5 text-slate-400" size={16} />
                    </div>
                </div>
            </div>
        </div>

        {/* Workers Section */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
             <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Users size={16} className="text-blue-600"/> العمال وتوزيع الأجور
                </label>
            </div>
            <div className="space-y-3">
                {selectedWorkers.map((workerRow, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-2 md:items-center bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                        <div className="flex-1">
                             <select 
                                value={workerRow.workerId} 
                                onChange={(e) => updateWorkerRow(index, 'workerId', e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2 text-sm outline-none"
                             >
                                 <option value="">اختر عامل...</option>
                                 {workers.filter(w => !w.role.includes('مشرف')).map(w => ( // Don't show supervisor in workers list
                                     <option key={w.id} value={w.id}>{w.name} ({w.workerType === 'Company' ? 'شركة' : 'خارجي'})</option>
                                 ))}
                             </select>
                        </div>
                        {/* Only show cost input if External */}
                        {workerRow.workerType === 'External' ? (
                            <div className="w-full md:w-32 flex items-center gap-2">
                                <span className="text-xs text-slate-400">أجر اليوم:</span>
                                <input 
                                    type="number" 
                                    value={workerRow.cost}
                                    onChange={(e) => updateWorkerRow(index, 'cost', parseFloat(e.target.value))}
                                    className="w-full bg-orange-50 border border-orange-200 rounded-lg px-2 py-2 text-sm outline-none text-center font-bold text-orange-700"
                                />
                            </div>
                        ) : (
                            <div className="w-full md:w-32 text-center text-xs text-green-600 bg-green-50 py-2 rounded-lg font-bold">
                                راتب شهري
                            </div>
                        )}
                        
                        <button onClick={() => removeWorkerRow(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg self-end md:self-auto">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
                <button 
                    onClick={addWorkerRow}
                    className="w-full py-2 bg-white border border-blue-200 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors dashed"
                >
                    + إضافة عامل للمهمة
                </button>
            </div>
        </div>

        {/* Consumed Materials */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
             <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Package size={16} className="text-orange-600"/> المواد المستهلكة
                </label>
            </div>
            <div className="space-y-3">
                {materialsList.map((material, index) => (
                    <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                             <select value={material.itemId} onChange={(e) => updateMaterialRow(index, 'itemId', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2.5 text-sm outline-none">
                                 <option value="">اختر مادة...</option>
                                 {inventory.map(item => <option key={item.id} value={item.id} disabled={item.quantity <= 0}>{item.name}</option>)}
                             </select>
                        </div>
                        <div className="w-20">
                             <input type="number" min="1" value={material.quantity} onChange={(e) => updateMaterialRow(index, 'quantity', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2.5 text-sm outline-none text-center" />
                        </div>
                         <div className="w-20 text-center text-xs text-slate-500 pt-3">
                            {material.costAtTime > 0 ? `${material.costAtTime} د.إ` : '-'}
                        </div>
                        <button onClick={() => removeMaterialRow(index)} className="p-2.5 mb-0.5 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                ))}
                <button onClick={addMaterialRow} className="w-full py-2 bg-white border border-orange-200 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors dashed">
                    + إضافة مادة من المخزون
                </button>
            </div>
        </div>

        {/* Cash Expenses / Miscellanous */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
             <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Utensils size={16} className="text-pink-600"/> مصاريف نثرية / عهدة
                </label>
            </div>
            <p className="text-[10px] text-slate-500 mb-3">تسجيل وجبات طعام، بترول، أو مشتريات طارئة للموقع.</p>
            <div className="space-y-3">
                {expensesList.map((expense, index) => (
                    <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                             <input 
                                type="text" 
                                placeholder="الوصف (مثلاً: وجبات غداء)" 
                                value={expense.description} 
                                onChange={(e) => updateExpenseRow(index, 'description', e.target.value)} 
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none"
                             />
                        </div>
                        <div className="w-24">
                             <input 
                                type="number" 
                                min="0" 
                                placeholder="المبلغ"
                                value={expense.amount} 
                                onChange={(e) => updateExpenseRow(index, 'amount', e.target.value)} 
                                className="w-full bg-white border border-slate-200 rounded-lg px-2 py-2.5 text-sm outline-none text-center font-bold text-slate-700" 
                             />
                        </div>
                        <button onClick={() => removeExpenseRow(index)} className="p-2.5 mb-0.5 text-red-500 hover:bg-red-100 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                ))}
                <button onClick={addExpenseRow} className="w-full py-2 bg-white border border-pink-200 text-pink-700 rounded-lg text-sm font-medium hover:bg-pink-50 transition-colors dashed">
                    + إضافة مصروف
                </button>
            </div>
        </div>

        {/* Financials & Live Profit Calculation */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">المبلغ المستلم (الإيراد)</label>
                <div className="relative">
                    <input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 outline-none font-bold text-emerald-800" placeholder="0.00" />
                    <DollarSign className="absolute left-4 top-3.5 text-emerald-600" size={16} />
                </div>
            </div>
            <div>
                <label className="text-xs font-bold text-slate-500 block mb-1.5">طريقة الدفع</label>
                <div className="relative">
                    <input type="text" value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none" />
                    <CreditCard className="absolute left-4 top-3.5 text-slate-400" size={16} />
                </div>
            </div>
        </div>
        
        {/* Cash Flow Summary */}
        {formData.amount && (
            <div className="bg-slate-800 text-white p-4 rounded-xl shadow-lg">
                <h4 className="text-sm font-bold text-slate-300 mb-2 border-b border-slate-600 pb-2">صافي النقدية (الكاش) لهذه العملية</h4>
                <div className="flex justify-between items-center text-xs mb-1">
                    <span>الإيراد المستلم:</span> <span className="text-emerald-400 font-mono">{totalRevenue}</span>
                </div>
                <div className="flex justify-between items-center text-xs mb-1">
                    <span>أجور عمالة خارجية (كاش):</span> <span className="text-red-400 font-mono">-{totalExternalCost}</span>
                </div>
                 <div className="flex justify-between items-center text-xs mb-1">
                    <span>مصروفات نثرية (كاش):</span> <span className="text-red-400 font-mono">-{totalCashExpenses}</span>
                </div>
                <div className="flex justify-between items-center text-xs mb-2 opacity-50">
                    <span>تكلفة مواد (مخزون):</span> <span className="font-mono">-{totalMaterialCost}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-lg pt-2 border-t border-slate-600">
                    <span>المتبقي في الصندوق:</span> <span className={netCashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}>{netCashFlow} د.إ</span>
                </div>
                 <p className="text-[9px] text-slate-400 mt-2 text-center">* ملاحظة: يتم احتساب رواتب عمال الشركة والمشرف تلقائياً في تقارير المدير.</p>
            </div>
        )}

        {/* Work Description */}
        <div>
             <label className="text-sm font-bold text-slate-800 block mb-2 flex items-center gap-2">
                 <FileText size={16} /> وصف العمل
             </label>
             <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 h-24 outline-none resize-none"></textarea>
        </div>

        {/* Photos */}
        <div>
             <h3 className="text-sm font-bold text-slate-800 mb-4">الصور</h3>
             <div className="grid grid-cols-2 gap-4">
                 <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 cursor-pointer text-slate-400">
                     <ImageIcon size={24} className="mb-2" /> <span className="text-xs">قبل</span>
                 </div>
                 <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 cursor-pointer text-slate-400">
                     <ImageIcon size={24} className="mb-2" /> <span className="text-xs">بعد</span>
                 </div>
             </div>
        </div>

        {/* AI Summary */}
        <div>
             <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                     <Sparkles size={16} className="text-primary-600" /> ملخص وملاحظات
                </label>
                <button onClick={handleGenerateSummary} disabled={loadingAi} className="text-xs bg-primary-50 text-primary-600 px-3 py-1 rounded-full font-bold">
                    {loadingAi ? '...' : 'توليد ملخص'}
                </button>
            </div>
            <textarea value={summary || formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 h-24 outline-none resize-none"></textarea>
        </div>

        <button onClick={handleSave} className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-primary-700 transition-all">
            حفظ واعتماد اليومية
        </button>

      </div>
    </div>
  );
};

export default NewReport;
