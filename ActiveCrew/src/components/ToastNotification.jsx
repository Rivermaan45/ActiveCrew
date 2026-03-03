import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store';

export default function ToastNotification() {
  const { toasts, removeToast, setActiveTab, setCurrentMatch, setScreen, matches } = useStore();

  return (
    <div className="absolute top-12 left-3 right-3 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {(toasts || []).map(toast => (
          <Toast
            key={toast.id}
            toast={toast}
            onDismiss={() => removeToast(toast.id)}
            onTap={() => {
              removeToast(toast.id);
              if (toast.action === 'go-matches') {
                setActiveTab('matches');
              } else if (toast.action === 'go-chat' && toast.matchId) {
                const match = matches.find(m => m.id === toast.matchId);
                if (match) {
                  setCurrentMatch(match);
                  setScreen('chat');
                }
              }
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Toast({ toast, onDismiss, onTap }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, []);

  const bgMap = {
    match: 'bg-active-500',
    plan: 'bg-green-500',
    message: 'bg-blue-500',
    info: 'bg-gray-800',
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: -40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      onClick={onTap}
      className={`pointer-events-auto w-full flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl ${bgMap[toast.type] || 'bg-gray-800'}`}
    >
      <span className="text-2xl shrink-0">{toast.icon || '⚡'}</span>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-white text-sm font-bold leading-tight">{toast.title}</p>
        {toast.body && <p className="text-white/70 text-xs leading-tight mt-0.5">{toast.body}</p>}
      </div>
      <span className="text-white/50 text-xs shrink-0">Tap to view</span>
    </motion.button>
  );
}
