import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store';
import api from '../api';

const SPORT_EMOJI = {
  Tennis: '🎾', Padel: '🏓', Running: '🏃', Swimming: '🏊', Bouldering: '🧗',
  'Rock Climbing': '🧗', Cycling: '🚴', Gym: '🏋️', Yoga: '🧘', Basketball: '🏀',
  Soccer: '⚽', Golf: '⛳', Coffee: '☕', Dinner: '🍽️', Sauna: '🧖',
  Surfing: '🏄', Hiking: '🥾', Camping: '🏕️',
};

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function MyWeekScreen() {
  const { user, setActiveTab } = useStore();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('calendar'); // 'calendar' | 'setup'

  useEffect(() => {
    if (!user) return;
    api.getSessions(user.id).then(data => {
      const joined = data.filter(s => s.joined);
      setSessions(joined);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user?.id]);

  const handleLeave = async (sessionId) => {
    try {
      await api.leaveSession(sessionId, user.id);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
    } catch (e) { console.error('Leave failed:', e); }
  };

  // Group sessions by day
  const byDay = {};
  DAYS_ORDER.forEach(d => { byDay[d] = []; });
  sessions.forEach(s => {
    if (byDay[s.day]) byDay[s.day].push(s);
  });

  const totalJoined = sessions.length;

  if (loading) {
    return (
      <div className="h-full bg-gray-50 overflow-y-auto">
        <div className="px-5 pt-14 pb-4">
          <h1 className="text-2xl font-extrabold text-gray-900">🗓️ My Week</h1>
        </div>
        <div className="px-5 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 rounded-2xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      <div className="px-5 pt-14 pb-2">
        <h1 className="text-2xl font-extrabold text-gray-900">🗓️ My Week</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          {totalJoined > 0 ? `${totalJoined} session${totalJoined !== 1 ? 's' : ''} this week` : 'No sessions yet'}
        </p>
      </div>

      {totalJoined === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-lg font-bold text-gray-700">Your week is empty</h2>
          <p className="text-gray-400 text-sm mt-2">
            Browse sessions and join ones that fit your schedule.
          </p>
          <button onClick={() => setActiveTab('explore')}
            className="mt-6 px-6 py-3 rounded-xl bg-active-500 text-white font-bold shadow-lg shadow-active-500/20">
            Explore Sessions ⚡
          </button>
        </div>
      ) : (
        <div className="px-5 pb-28 mt-2 space-y-1">
          {DAYS_ORDER.map(day => {
            const daySessions = byDay[day];
            if (daySessions.length === 0) return null;
            return (
              <div key={day} className="mb-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{day}</h3>
                <div className="space-y-2">
                  {daySessions.map((s, idx) => (
                    <motion.div key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white rounded-xl p-3.5 border border-gray-100 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-active-50 flex items-center justify-center text-xl flex-shrink-0">
                            {SPORT_EMOJI[s.sport] || '🏃'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800 text-sm truncate">{s.title}</p>
                            <p className="text-gray-400 text-xs mt-0.5">
                              {s.timeStart}–{s.timeEnd} · {s.location}
                            </p>
                          </div>
                        </div>
                        <button onClick={() => handleLeave(s.id)}
                          className="text-gray-300 hover:text-red-400 text-xs ml-2 flex-shrink-0 transition-colors">
                          ✕
                        </button>
                      </div>
                      {/* Participants */}
                      {(s.participantProfiles || []).length > 0 && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <div className="flex -space-x-1.5">
                            {s.participantProfiles.slice(0, 3).map(p => (
                              <img key={p.id} src={p.photo} alt="" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                            ))}
                          </div>
                          <span className="text-gray-400 text-[10px]">
                            {s.participantProfiles.length} going · {s.spotsRemaining} spot{s.spotsRemaining !== 1 ? 's' : ''} left
                          </span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Quick add button */}
          <div className="pt-4">
            <button onClick={() => setActiveTab('explore')}
              className="w-full py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 text-sm font-semibold hover:border-active-400 hover:text-active-500 transition-colors">
              + Add more sessions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
