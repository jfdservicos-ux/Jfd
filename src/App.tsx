// F4 Partners - CRM & Management System
// Using HashRouter for reliable routing in iframe/shared environments
import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  Briefcase, 
  BookOpen, 
  TrendingUp, 
  User, 
  LogOut, 
  Menu, 
  X,
  Shield,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Pages
import Dashboard from './pages/Dashboard';
import CRM from './pages/CRM';
import Commercial from './pages/Commercial';
import Academy from './pages/Academy';
import Profile from './pages/Profile';
import Activities from './pages/Activities';
import Goals from './pages/Goals';
import ServiceTracking from './pages/ServiceTracking';
import Manager from './pages/Manager';
import Login from './pages/Login';

import { NotificationProvider } from './components/NotificationProvider';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const docRef = doc(db, 'users', firebaseUser.uid);
        
        // Listen for real-time updates to the profile
        unsubscribeProfile = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            // Force manager role for the master email
            if (firebaseUser.email === 'jfdservicos@gmail.com' && data.role !== 'manager') {
              const updatedProfile = { ...data, role: 'manager' };
              setDoc(docRef, updatedProfile, { merge: true });
              setProfile(updatedProfile);
            } else {
              setProfile(data);
            }
          } else {
            const newProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
              role: firebaseUser.email === 'jfdservicos@gmail.com' ? 'manager' : 'banker',
              rating: 'Caa2',
              aum: 0,
              monthlyGoals: { earnings: 0, diagnostics: 0, meetings: 0, leads: 0 }
            };
            setDoc(docRef, newProfile);
            setProfile(newProfile);
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to profile:", error);
          setLoading(false);
        });
      } else {
        setUser(null);
        setProfile(null);
        if (unsubscribeProfile) unsubscribeProfile();
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="w-16 h-16 border-4 border-f4-blue border-t-f4-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <NotificationProvider>
      <Router>
        <AnimatePresence mode="wait">
          {!user ? (
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          ) : (
            <Layout profile={profile}>
              <Routes>
                <Route path="/" element={<Dashboard profile={profile} />} />
                <Route path="/crm" element={<CRM profile={profile} />} />
                <Route path="/commercial" element={<Commercial profile={profile} />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/tracking" element={<ServiceTracking profile={profile} />} />
                <Route path="/academy" element={<Academy />} />
                <Route path="/goals" element={<Goals profile={profile} />} />
                <Route path="/manager" element={<Manager profile={profile} />} />
                <Route path="/profile" element={<Profile profile={profile} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          )}
        </AnimatePresence>
      </Router>
    </NotificationProvider>
  );
}

function Layout({ children, profile }: { children: React.ReactNode, profile: any }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const isManager = profile?.role === 'admin' || profile?.role === 'manager';

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/crm', label: 'CRM / Pipeline', icon: Users },
    { path: '/commercial', label: 'Área Comercial', icon: Briefcase },
    { path: '/goals', label: 'Minhas Metas', icon: Target },
    { path: '/tracking', label: 'Acompanhamento', icon: Target },
    { path: '/activities', label: 'Log de Atividades', icon: TrendingUp },
    { path: '/academy', label: 'F4 Academy', icon: BookOpen },
    ...(isManager ? [{ path: '/manager', label: 'Gestão Escritório', icon: Shield }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className={cn(
        "bg-f4-blue text-white transition-all duration-300 flex flex-col fixed inset-y-0 z-50 lg:relative print:hidden",
        isSidebarOpen ? "w-72" : "w-20",
        !isSidebarOpen && "lg:w-20"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className={cn("font-black italic text-2xl tracking-tighter flex items-center", !isSidebarOpen && "hidden")}>
            F4<span className="text-f4-gold not-italic ml-1">PARTNERS</span>
          </div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all group",
                location.pathname === item.path 
                  ? "bg-f4-gold text-f4-blue shadow-lg shadow-f4-gold/20" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon size={20} className={cn(location.pathname === item.path ? "text-f4-blue" : "text-slate-400 group-hover:text-white")} />
              <span className={cn("transition-opacity duration-300", !isSidebarOpen && "opacity-0 w-0 overflow-hidden")}>
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/10">
          <Link to="/profile" className="flex items-center gap-4 p-2 rounded-2xl hover:bg-white/5 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-f4-gold flex items-center justify-center text-f4-blue font-bold shadow-lg shadow-f4-gold/20">
              {profile?.name?.charAt(0) || 'U'}
            </div>
            <div className={cn("transition-opacity duration-300", !isSidebarOpen && "opacity-0 w-0 overflow-hidden")}>
              <p className="text-sm font-bold truncate">{profile?.name || 'Usuário'}</p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                {isManager ? 'Gestor F4' : 'Banker F4'}
              </p>
            </div>
          </Link>
          <button 
            onClick={() => auth.signOut()}
            className={cn(
              "mt-4 w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-rose-400 hover:bg-rose-400/10 transition-all font-bold text-sm",
              !isSidebarOpen && "justify-center px-0"
            )}
          >
            <LogOut size={20} />
            <span className={cn(!isSidebarOpen && "hidden")}>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 print:bg-white">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40 print:hidden">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-slate-50 rounded-xl">
              <Shield size={20} className="text-f4-blue" />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Acesso Seguro • MOC-F4 Ativo</p>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-f4-blue transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-100"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-bold text-f4-blue">{profile?.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Rating: {profile?.rating}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                    {profile?.name?.charAt(0)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 overflow-y-auto print:p-0 print:overflow-visible">
          {children}
        </div>
      </main>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
