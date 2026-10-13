import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
}

interface NotificationContextType {
  notify: (type: NotificationType, message: string) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const notify = (type: NotificationType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  };

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        resolve,
      });
    });
  };

  const handleConfirm = (value: boolean) => {
    if (confirmState) {
      confirmState.resolve(value);
      setConfirmState(null);
    }
  };

  return (
    <NotificationContext.Provider value={{ notify, confirm }}>
      {children}
      
      {/* Notifications Overlay */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className={`pointer-events-auto flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border min-w-[300px] max-w-md ${
                n.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                n.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' :
                n.type === 'warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                'bg-f4-blue/5 border-f4-blue/10 text-f4-blue'
              }`}
            >
              {n.type === 'success' && <CheckCircle2 size={20} className="text-emerald-500 shrink-0" />}
              {n.type === 'error' && <AlertCircle size={20} className="text-rose-500 shrink-0" />}
              {n.type === 'warning' && <AlertTriangle size={20} className="text-amber-500 shrink-0" />}
              {n.type === 'info' && <Info size={20} className="text-f4-blue shrink-0" />}
              
              <p className="text-sm font-bold flex-1">{n.message}</p>
              
              <button 
                onClick={() => setNotifications((prev) => prev.filter((notif) => notif.id !== n.id))}
                className="p-1 hover:bg-black/5 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmState?.isOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleConfirm(false)}
              className="absolute inset-0 bg-f4-blue/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${confirmState.options.type === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-f4-blue/10 text-f4-blue'}`}>
                    {confirmState.options.type === 'danger' ? <AlertTriangle size={32} /> : <Info size={32} />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-f4-blue">{confirmState.options.title}</h3>
                    <p className="text-slate-500 font-medium mt-1">{confirmState.options.message}</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => handleConfirm(false)}
                    className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all border border-slate-100"
                  >
                    {confirmState.options.cancelText || 'Cancelar'}
                  </button>
                  <button
                    onClick={() => handleConfirm(true)}
                    className={`flex-1 py-4 rounded-2xl font-bold text-white transition-all shadow-lg ${
                      confirmState.options.type === 'danger' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-f4-blue hover:bg-f4-accent shadow-f4-blue/20'
                    }`}
                  >
                    {confirmState.options.confirmText || 'Confirmar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
