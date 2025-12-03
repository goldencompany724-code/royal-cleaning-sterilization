
import React, { useMemo } from 'react';
import { UserCheck, Phone, MapPin, Search, MessageCircle, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';

const Customers: React.FC = () => {
  const { reports, inquiries } = useApp();

  // Logic to aggregate customers from Reports and Inquiries
  const customers = useMemo(() => {
    const customerMap = new Map<string, Customer>();

    // 1. Process Reports (Active Customers)
    reports.forEach(report => {
      // Use phone as key if available, else name
      const key = report.clientPhone || report.clientName;
      
      if (customerMap.has(key)) {
        const existing = customerMap.get(key)!;
        customerMap.set(key, {
          ...existing,
          totalVisits: existing.totalVisits + 1,
          totalSpent: (existing.totalSpent || 0) + (parseFloat(report.cost || '0') || 0),
          lastInteraction: report.date > existing.lastInteraction ? report.date : existing.lastInteraction,
          location: report.siteLocation || existing.location, // Update location to latest
          type: 'Active' // Ensure status is Active if they have a report
        });
      } else {
        customerMap.set(key, {
          id: `C-${key}`,
          name: report.clientName,
          phone: report.clientPhone || 'غير مسجل',
          location: report.siteLocation,
          type: 'Active',
          lastInteraction: report.date,
          totalVisits: 1,
          totalSpent: parseFloat(report.cost || '0') || 0
        });
      }
    });

    // 2. Process Inquiries (Leads)
    inquiries.forEach(inq => {
      const key = inq.phone || inq.customerName;

      if (!customerMap.has(key)) {
        // Only add if not already in list (meaning they haven't converted to active yet)
        customerMap.set(key, {
            id: `L-${inq.id}`,
            name: inq.customerName,
            phone: inq.phone,
            location: 'غير محدد', // Inquiries might not have location
            type: 'Lead',
            lastInteraction: inq.date,
            totalVisits: 0,
            totalSpent: 0
        });
      }
    });

    return Array.from(customerMap.values()).sort((a, b) => 
        new Date(b.lastInteraction).getTime() - new Date(a.lastInteraction).getTime()
    );
  }, [reports, inquiries]);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <UserCheck className="text-primary-600" /> إدارة العملاء
          </h2>
          <p className="text-slate-500 mt-1">قاعدة بيانات العملاء المجمعة من اليوميات والاستفسارات.</p>
        </div>
        
        {/* Stats */}
        <div className="flex gap-3">
             <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                <span className="block text-xs text-slate-500 font-bold">إجمالي العملاء</span>
                <span className="block text-lg font-bold text-primary-600">{customers.length}</span>
             </div>
             <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                <span className="block text-xs text-slate-500 font-bold">عملاء نشطين</span>
                <span className="block text-lg font-bold text-green-600">
                    {customers.filter(c => c.type === 'Active').length}
                </span>
             </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm mb-6 flex gap-2 max-w-md">
            <div className="relative flex-1">
                <input type="text" placeholder="بحث باسم العميل أو الهاتف..." className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none" />
                <Search className="absolute right-3 top-2.5 text-slate-400" size={16} />
            </div>
      </div>

      {/* Customers List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-right">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                    <th className="px-6 py-4">العميل</th>
                    <th className="px-6 py-4">الحالة</th>
                    <th className="px-6 py-4 hidden md:table-cell">الموقع</th>
                    <th className="px-6 py-4 hidden md:table-cell">آخر تفاعل</th>
                    <th className="px-6 py-4">تواصل</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                                    customer.type === 'Active' ? 'bg-primary-100 text-primary-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                    {customer.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-800">{customer.name}</div>
                                    <div className="text-xs text-slate-500 dir-ltr text-right">{customer.phone}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            {customer.type === 'Active' ? (
                                <div className="flex flex-col gap-1">
                                    <span className="w-fit bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                        عميل حالي
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                        {customer.totalVisits} زيارات
                                    </span>
                                </div>
                            ) : (
                                <span className="w-fit bg-orange-100 text-orange-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                    استفسار جديد
                                </span>
                            )}
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                            <div className="flex items-center gap-1 text-slate-600 text-sm">
                                <MapPin size={14} className="text-slate-400" />
                                {customer.location || '-'}
                            </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                             <div className="flex items-center gap-1 text-slate-500 text-xs">
                                <Clock size={14} />
                                {customer.lastInteraction}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex gap-2">
                                <a 
                                    href={`tel:${customer.phone}`} 
                                    className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 hover:text-slate-800 transition-colors"
                                    title="اتصال"
                                >
                                    <Phone size={16} />
                                </a>
                                <a 
                                    href={`https://wa.me/${customer.phone.replace(/\s+/g, '')}`} 
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                    title="واتساب"
                                >
                                    <MessageCircle size={16} />
                                </a>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        
        {customers.length === 0 && (
            <div className="text-center py-10 text-slate-400">
                لا توجد بيانات عملاء حالياً
            </div>
        )}
      </div>
    </div>
  );
};

export default Customers;