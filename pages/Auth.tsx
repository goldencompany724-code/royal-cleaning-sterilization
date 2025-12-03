
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Role } from '../types';
import { ShieldCheck, UserPlus, LogIn, AlertCircle, Lock } from 'lucide-react';

const Auth: React.FC = () => {
  const { login, register, hasManager } = useApp();
  const [view, setView] = useState<'login' | 'register'>('login');
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>(Role.SUPERVISOR);
  
  // Feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      const res = await login(email, password);
      if (!res.success) setError(res.message || 'Error');
  };

  const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setSuccess('');
      
      const roleToRegister = hasManager ? Role.SUPERVISOR : selectedRole; // Force Supervisor if manager exists
      
      const res = await register(name, email, password, roleToRegister);
      if (res.success) {
          if (roleToRegister === Role.SUPERVISOR) {
              setSuccess('تم إرسال طلب التسجيل بنجاح. يرجى انتظار موافقة صاحب الشركة لتفعيل الحساب.');
              setView('login');
          }
      } else {
          setError(res.message || 'Error');
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4" dir="rtl">
        <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-primary-200">
                <ShieldCheck size={40} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">شركة رويال للتنظيف والتعقيم</h1>
            <p className="text-slate-500 mt-2 text-sm">نظام إدارة العمليات - العين، الإمارات العربية المتحدة</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-slate-100">
                <button 
                    onClick={() => { setView('login'); setError(''); setSuccess(''); }}
                    className={`flex-1 py-4 text-sm font-bold transition-colors ${view === 'login' ? 'text-primary-600 bg-primary-50' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    تسجيل دخول
                </button>
                <button 
                    onClick={() => { setView('register'); setError(''); setSuccess(''); }}
                    className={`flex-1 py-4 text-sm font-bold transition-colors ${view === 'register' ? 'text-primary-600 bg-primary-50' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    إنشاء حساب
                </button>
            </div>

            <div className="p-8">
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 flex items-center gap-2">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}
                 {success && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4 flex items-center gap-2">
                        <ShieldCheck size={16} /> {success}
                    </div>
                )}

                {view === 'login' ? (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">البريد الإلكتروني</label>
                            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-100" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">كلمة المرور</label>
                            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-100" />
                        </div>
                        <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2 mt-4">
                            <LogIn size={20} /> تسجيل دخول
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">الاسم الكامل</label>
                            <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-100" />
                        </div>
                         <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">البريد الإلكتروني</label>
                            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-100" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-700 block mb-1">كلمة المرور</label>
                            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-100" />
                        </div>
                        
                        {!hasManager ? (
                            <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" checked={selectedRole === Role.MANAGER} onChange={() => setSelectedRole(Role.MANAGER)} className="w-4 h-4 text-orange-600" />
                                    <span className="text-sm font-bold text-slate-700">تسجيل كصاحب الشركة (المدير)</span>
                                </label>
                                <p className="text-[10px] text-slate-500 mt-1 mr-6">هذا الخيار متاح لمرة واحدة فقط لمالك النظام.</p>
                            </div>
                        ) : (
                            <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 mt-2 flex items-center gap-2">
                                <UserPlus size={18} className="text-blue-600" />
                                <div>
                                    <span className="text-sm font-bold text-slate-700 block">تسجيل كمشرف</span>
                                    <span className="text-[10px] text-slate-500">يتطلب موافقة المدير بعد التسجيل.</span>
                                </div>
                            </div>
                        )}

                        <button type="submit" className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 shadow-lg transition-all flex items-center justify-center gap-2 mt-4">
                            <UserPlus size={20} /> إنشاء حساب
                        </button>
                    </form>
                )}
            </div>
        </div>
        <div className="mt-8 text-slate-400 text-xs flex items-center gap-1">
             <Lock size={12} /> نظام آمن ومحمي
        </div>
    </div>
  );
};

export default Auth;
    