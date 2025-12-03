
import React from 'react';
import { FileText, Calendar, User, MapPin, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';

const ReportsList: React.FC = () => {
  const { reports } = useApp();

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="bg-slate-100 p-6 rounded-full mb-4">
            <FileText size={48} className="text-slate-300" />
        </div>
        <h2 className="text-xl font-bold text-slate-700">لا توجد تقارير حتى الآن</h2>
        <p className="text-slate-500 max-w-sm mt-2 mb-6">لم يتم رفع أي يوميات عمل بعد. يمكنك البدء بإضافة تقرير جديد الآن.</p>
        <Link to="/reports/new" className="bg-primary-600 text-white px-6 py-2.5 rounded-xl hover:bg-primary-700 transition-colors">
            + إضافة يومية جديدة
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">سجل اليوميات</h2>
          <p className="text-slate-500 mt-1">عرض أرشيف جميع التقارير اليومية المنجزة.</p>
        </div>
        <Link to="/reports/new" className="bg-primary-600 text-white px-6 py-2.5 rounded-xl hover:bg-primary-700 font-medium shadow-sm transition-colors">
          + تقرير جديد
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reports.map((report) => (
          <div key={report.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 shrink-0">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                             تقرير {report.siteLocation}
                             {report.status === 'Pending' && <span className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full">قيد المراجعة</span>}
                             {report.status === 'Approved' && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">معتمد</span>}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-2">
                            <span className="flex items-center gap-1"><Calendar size={14}/> {report.date}</span>
                            <span className="flex items-center gap-1"><User size={14}/> {report.supervisor}</span>
                            <span className="flex items-center gap-1"><MapPin size={14}/> {report.workerNames.length} عمال</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                     <div className="text-left pl-4 border-l border-slate-100 hidden md:block">
                        <p className="text-xs text-slate-400">ملخص الذكاء الاصطناعي</p>
                        <p className="text-xs text-slate-600 max-w-xs truncate">{report.aiSummary || 'لا يوجد ملخص'}</p>
                     </div>
                     <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">
                        <Eye size={16} /> عرض التفاصيل
                     </button>
                </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsList;
