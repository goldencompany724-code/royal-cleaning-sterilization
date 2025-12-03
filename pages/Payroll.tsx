
import React, { useMemo } from 'react';
import { Banknote, Users, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PayrollEntry } from '../types';

const Payroll: React.FC = () => {
  const { workers, reports } = useApp();

  const payrollData = useMemo(() => {
      const payroll: PayrollEntry[] = [];

      workers.forEach(worker => {
          let entry: PayrollEntry = {
              workerId: worker.id,
              workerName: worker.name,
              role: worker.role,
              type: worker.workerType || 'Company',
              baseSalary: worker.baseRate || 0,
              totalDailyWages: 0,
              daysWorked: 0,
              totalDue: 0
          };

          if (worker.workerType === 'External') {
              // Sum wages from reports for external workers
              reports.forEach(report => {
                  const detail = report.workerDetails?.find(d => d.workerId === worker.id);
                  if (detail) {
                      entry.totalDailyWages += detail.cost;
                      entry.daysWorked += 1;
                  }
              });
              entry.totalDue = entry.totalDailyWages;
          } else {
              // Company worker - Fixed Salary
              entry.totalDue = entry.baseSalary;
              // Count days worked just for info
              const days = reports.filter(r => r.workerDetails?.some(d => d.workerId === worker.id)).length;
              entry.daysWorked = days;
          }
          payroll.push(entry);
      });
      return payroll;
  }, [workers, reports]);

  const totalPayroll = payrollData.reduce((acc, p) => acc + p.totalDue, 0);

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Banknote className="text-primary-600" /> مسيرات الرواتب
          </h2>
          <p className="text-slate-500 mt-1">كشف تلقائي للمستحقات المالية للعمال.</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100">
            <span className="block text-xs font-bold opacity-70">إجمالي الرواتب المستحقة</span>
            <span className="block text-xl font-bold dir-ltr">{totalPayroll.toLocaleString()} د.إ</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                        <th className="px-6 py-4">العامل</th>
                        <th className="px-6 py-4">النوع</th>
                        <th className="px-6 py-4">أيام العمل</th>
                        <th className="px-6 py-4">الراتب الأساسي</th>
                        <th className="px-6 py-4">إضافي / يوميات</th>
                        <th className="px-6 py-4">صافي المستحق</th>
                        <th className="px-6 py-4"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {payrollData.map((entry) => (
                        <tr key={entry.workerId} className="hover:bg-slate-50">
                            <td className="px-6 py-4">
                                <div className="font-bold text-slate-800 text-sm">{entry.workerName}</div>
                                <div className="text-xs text-slate-500">{entry.role}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold ${entry.type === 'Company' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                                    {entry.type === 'Company' ? 'شركة' : 'خارجي'}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 font-bold">{entry.daysWorked} يوم</td>
                            <td className="px-6 py-4 text-sm text-slate-400">
                                {entry.type === 'Company' ? entry.baseSalary.toLocaleString() : '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                                {entry.type === 'External' ? entry.totalDailyWages.toLocaleString() : '-'}
                            </td>
                            <td className="px-6 py-4 text-emerald-600 font-bold text-base">
                                {entry.totalDue.toLocaleString()} د.إ
                            </td>
                            <td className="px-6 py-4 text-right">
                                <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                                    <Download size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
      </div>
    </div>
  );
};

export default Payroll;
