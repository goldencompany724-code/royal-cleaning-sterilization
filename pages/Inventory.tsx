
import React from 'react';
import { Package, AlertTriangle, Search, Filter, Plus, Edit } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InventoryItem } from '../types';

const Inventory: React.FC = () => {
  const { inventory } = useApp();

  const InventoryCard = ({ item }: { item: InventoryItem }) => (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-3">
        <div className="flex justify-between items-start">
             <div className="flex items-center gap-3">
                <div className="p-2.5 bg-slate-50 rounded-lg text-slate-500">
                    <Package size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                    <p className="text-xs text-slate-500">آخر تحديث: {item.lastUpdated}</p>
                </div>
             </div>
             <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                item.status === 'Good' ? 'bg-green-100 text-green-700' :
                item.status === 'Low' ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
            }`}>
                {item.status === 'Good' ? 'متوفر' : item.status === 'Low' ? 'منخفض' : 'حرج'}
            </span>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
             <div className="text-sm font-bold text-slate-800">{item.quantity} <span className="text-xs font-normal text-slate-500">{item.unit}</span></div>
             <button className="text-primary-600 bg-primary-50 p-2 rounded-lg hover:bg-primary-100"><Edit size={16} /></button>
        </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">المخزون</h2>
        <button className="w-full md:w-auto bg-primary-600 text-white px-4 py-2.5 rounded-xl hover:bg-primary-700 font-medium shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2">
          <Plus size={18} /> إضافة صنف
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Statistics */}
        <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-3 md:gap-4">
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Package size={18} /></div>
                    <span className="text-slate-500 text-xs font-bold">الإجمالي</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800">{inventory.length}</h3>
             </div>
             <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertTriangle size={18} /></div>
                    <span className="text-slate-500 text-xs font-bold">نواقص</span>
                </div>
                <h3 className="text-xl font-bold text-slate-800">{inventory.filter(i => i.status === 'Critical' || i.status === 'Low').length}</h3>
             </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
             {/* Search */}
            <div className="bg-white p-2 md:p-4 rounded-xl border border-slate-200 shadow-sm mb-4 flex gap-2">
                <div className="relative flex-1">
                    <input type="text" placeholder="بحث..." className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none" />
                    <Search className="absolute right-3 top-2.5 text-slate-400" size={16} />
                </div>
                <button className="p-2 border border-slate-200 rounded-lg text-slate-500"><Filter size={18}/></button>
            </div>
            
            {/* Desktop View */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                 <table className="w-full text-right">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4">اسم الصنف</th>
                            <th className="px-6 py-4">الكمية</th>
                            <th className="px-6 py-4">التكلفة</th>
                            <th className="px-6 py-4">الحالة</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {inventory.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-800">{item.name}</td>
                                <td className="px-6 py-4 text-slate-600">{item.quantity} {item.unit}</td>
                                <td className="px-6 py-4 text-slate-600 font-mono">{item.price}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                        item.status === 'Good' ? 'bg-green-100 text-green-700' :
                                        item.status === 'Low' ? 'bg-orange-100 text-orange-700' :
                                        'bg-red-100 text-red-700'
                                    }`}>
                                        {item.status === 'Good' ? 'متوفر' : item.status === 'Low' ? 'منخفض' : 'حرج'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-left">
                                    <button className="text-primary-600 hover:bg-primary-50 p-2 rounded-lg"><Edit size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-3 pb-20">
                {inventory.map(item => (
                    <InventoryCard key={item.id} item={item} />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
