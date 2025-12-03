
import React, { useMemo } from 'react';
import { PieChart, TrendingUp, TrendingDown, MapPin, DollarSign, Calendar, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Project } from '../types';

const Projects: React.FC = () => {
  const { reports, sites, workers } = useApp();

  const projects = useMemo(() => {
      // Group reports by siteLocation to form "Projects"
      const projectMap = new Map<string, Project>();

      // Initialize with existing sites
      sites.forEach(site => {
          projectMap.set(site.name, {
              id: site.id,
              siteName: site.name,
              clientName: site.clientName,
              revenue: 0,
              expenses: { 
                  directLabor: 0, // External
                  allocatedLabor: 0, // Company Workers Salary Allocation
                  supervisorCost: 0, // Supervisor Salary Allocation
                  materials: 0, 
                  cashExpenses: 0,
                  total: 0 
              },
              netProfit: 0,
              status: site.status === 'Active' ? 'Active' : 'Completed',
              lastActivity: '-'
          });
      });

      // Process reports
      reports.forEach(report => {
          const siteName = report.siteLocation;
          const current = projectMap.get(siteName) || {
              id: `PROJ-${Math.random()}`,
              siteName: siteName,
              clientName: report.clientName,
              revenue: 0,
              expenses: { directLabor: 0, allocatedLabor: 0, supervisorCost: 0, materials: 0, cashExpenses: 0, total: 0 },
              netProfit: 0,
              status: 'Active',
              lastActivity: report.date
          };

          const revenue = parseFloat(report.cost || '0');
          
          // 1. Calculate External Workers Cost (Direct Cash)
          const directLabor = report.workerDetails?.reduce((acc, w) => acc + (w.workerType === 'External' ? w.cost : 0), 0) || 0;

          // 2. Calculate Company Workers Allocation (Monthly Salary / 30)
          let allocatedLabor = 0;
          report.workerDetails?.forEach(w => {
              if (w.workerType === 'Company') {
                  const workerData = workers.find(existing => existing.id === w.workerId);
                  if (workerData && workerData.baseRate) {
                      allocatedLabor += (workerData.baseRate / 30); // Assuming 30 days month
                  }
              }
          });

          // 3. Calculate Supervisor Allocation
          let supervisorCost = 0;
          if (report.supervisorId) {
              const supervisorData = workers.find(w => w.id === report.supervisorId);
              if (supervisorData && supervisorData.baseRate) {
                  supervisorCost = (supervisorData.baseRate / 30);
              }
          }

          // 4. Materials
          const materialCost = report.consumedMaterials?.reduce((acc, m) => acc + m.costAtTime, 0) || 0;

          // 5. Cash Expenses
          const cashExpenses = report.cashExpenses?.reduce((acc, e) => acc + e.amount, 0) || 0;

          current.revenue += revenue;
          current.expenses.directLabor += directLabor;
          current.expenses.allocatedLabor += allocatedLabor;
          current.expenses.supervisorCost += supervisorCost;
          current.expenses.materials += materialCost;
          current.expenses.cashExpenses += cashExpenses;

          current.expenses.total += (directLabor + allocatedLabor + supervisorCost + materialCost + cashExpenses);
          current.netProfit = current.revenue - current.expenses.total;
          
          if (report.date > current.lastActivity) current.lastActivity = report.date;

          projectMap.set(siteName, current);
      });

      return Array.from(projectMap.values());
  }, [reports, sites, workers]);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <PieChart className="text-primary-600" /> تحليل ربحية المشاريع
        </h2>
        <p className="text-slate-500 mt-1">متابعة الأداء المالي الدقيق (شامل الرواتب والمصاريف التشغيلية).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(proj => (
              <div key={proj.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                      <div>
                          <h3 className="font-bold text-lg text-slate-800">{proj.siteName}</h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <MapPin size={12} /> {proj.clientName}
                          </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${proj.netProfit >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {proj.netProfit >= 0 ? 'رابح' : 'خاسر'}
                      </span>
                  </div>
                  
                  <div className="p-5 space-y-4">
                      <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">إجمالي الإيراد</span>
                          <span className="text-base font-bold text-slate-800 dir-ltr">{proj.revenue.toLocaleString()} د.إ</span>
                      </div>
                      
                      <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                           <div className="flex justify-between text-xs items-center">
                              <span className="text-slate-500">أجور خارجية + مصروفات</span>
                              <span className="text-red-500 font-medium">-{Math.round(proj.expenses.directLabor + proj.expenses.cashExpenses).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs items-center">
                              <span className="text-slate-500">مواد مستهلكة</span>
                              <span className="text-red-500 font-medium">-{Math.round(proj.expenses.materials).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs items-center pt-1 border-t border-slate-200 border-dashed">
                              <span className="text-slate-500 flex items-center gap-1"><Info size={10}/> رواتب شركة + إشراف</span>
                              <span className="text-orange-500 font-medium">-{Math.round(proj.expenses.allocatedLabor + proj.expenses.supervisorCost).toLocaleString()}</span>
                          </div>
                          
                          <div className="border-t border-slate-200 my-1"></div>
                          <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-700">التكلفة الكلية</span>
                              <span className="text-red-600">-{Math.round(proj.expenses.total).toLocaleString()}</span>
                          </div>
                      </div>

                      <div className="pt-2 flex justify-between items-center">
                          <span className="text-sm font-bold text-slate-700">صافي الربح</span>
                          <div className={`flex items-center gap-1 font-bold text-xl ${proj.netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {proj.netProfit >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                              <span className="dir-ltr">{Math.round(proj.netProfit).toLocaleString()} د.إ</span>
                          </div>
                      </div>
                  </div>
                  <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                      <span className="flex items-center gap-1"><Calendar size={12}/> آخر نشاط: {proj.lastActivity}</span>
                      <span>{proj.status}</span>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};

export default Projects;
