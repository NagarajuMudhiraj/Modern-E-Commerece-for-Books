import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notify: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((message: string, type: NotificationType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5000);
  }, []);

  const remove = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              className="pointer-events-auto"
            >
              <div className={`
                flex items-center gap-4 p-4 rounded-2xl shadow-2xl min-w-[300px] border backdrop-blur-md
                ${n.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800' : ''}
                ${n.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-800' : ''}
                ${n.type === 'info' ? 'bg-indigo-50/90 border-indigo-200 text-indigo-800' : ''}
                ${n.type === 'warning' ? 'bg-amber-50/90 border-amber-200 text-amber-800' : ''}
              `}>
                <div className="flex-shrink-0">
                  {n.type === 'success' && <CheckCircle className="w-6 h-6 text-emerald-500" />}
                  {n.type === 'error' && <AlertCircle className="w-6 h-6 text-red-500" />}
                  {n.type === 'info' && <Bell className="w-6 h-6 text-indigo-500" />}
                  {n.type === 'warning' && <AlertCircle className="w-6 h-6 text-amber-500" />}
                </div>
                <div className="flex-grow font-bold text-sm">{n.message}</div>
                <button 
                  onClick={() => remove(n.id)}
                  className="p-1 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 opacity-50" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotify = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotify must be used within NotificationProvider');
  return context;
};
