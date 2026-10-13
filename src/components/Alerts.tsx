import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Bell, AlertCircle, Clock, Calendar, Target, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AlertsProps {
  profile: any;
}

export default function Alerts({ profile }: AlertsProps) {
  const [alerts, setAlerts] = useState<any[]>([]);
  const navigate = useNavigate();
  const isManager = profile?.role === 'admin' || profile?.role === 'manager';

  useEffect(() => {
    if (!profile?.uid) return;

    const leadsQuery = isManager 
      ? query(collection(db, 'leads'))
      : query(collection(db, 'leads'), where('bankerUid', '==', profile.uid));

    const unsubscribe = onSnapshot(leadsQuery, (snapshot) => {
      const newAlerts: any[] = [];
      const now = new Date();

      snapshot.docs.forEach(doc => {
        const lead = doc.data();
        const lastContact = lead.lastContact?.toDate() || new Date(0);
        const diffDays = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));

        // Alert: No contact for more than 7 days
        if (diffDays >= 7 && lead.stage !== 'cliente') {
          newAlerts.push({
            id: `contact-${doc.id}`,
            type: 'warning',
            title: 'Falta de Contato',
            message: `O lead ${lead.name} não é contatado há ${diffDays} dias.`,
            icon: Clock,
            action: '/crm'
          });
        }

        // Alert: Forecast date approaching (within 3 days)
        if (lead.forecastDate) {
          const forecast = new Date(lead.forecastDate);
          const diffForecast = Math.floor((forecast.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (diffForecast >= 0 && diffForecast <= 3) {
            newAlerts.push({
              id: `forecast-${doc.id}`,
              type: 'info',
              title: 'Previsão de Fechamento',
              message: `O fechamento de ${lead.name} está previsto para daqui a ${diffForecast} dias.`,
              icon: Calendar,
              action: '/crm'
            });
          }
        }
      });

      // Manager specific alerts: 1-on-1 reminders
      if (isManager) {
        // This could be based on a 'bankers' collection or similar
        // For now, let's add a generic reminder
        newAlerts.push({
          id: 'manager-1on1',
          type: 'success',
          title: 'Gestão de Pessoas',
          message: 'Lembre-se de revisar a performance semanal dos seus bankers.',
          icon: Target,
          action: '/manager'
        });
      }

      setAlerts(newAlerts.slice(0, 5)); // Show top 5 alerts
    });

    return () => unsubscribe();
  }, [profile?.uid, isManager]);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Bell size={14} className="text-f4-gold" /> Notificações de Performance
        </h3>
        <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {alerts.length}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-all group cursor-pointer"
            onClick={() => navigate(alert.action)}
          >
            <div className={`p-3 rounded-xl ${
              alert.type === 'warning' ? 'bg-amber-50 text-amber-600' :
              alert.type === 'info' ? 'bg-blue-50 text-blue-600' :
              'bg-emerald-50 text-emerald-600'
            }`}>
              <alert.icon size={18} />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold text-f4-blue mb-1">{alert.title}</h4>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{alert.message}</p>
            </div>
            <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform self-center" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
