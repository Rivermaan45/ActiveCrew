import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import useStore from '../store';
import api from '../api';
import GroupEventsScreen from './GroupEventsScreen';

const SPORT_EMOJI = {
  Tennis: '🎾', Padel: '🏓', Running: '🏃', Swimming: '🏊', Bouldering: '🧗',
  'Rock Climbing': '🧗', Cycling: '🚴', Gym: '🏋️', Yoga: '🧘', Basketball: '🏀',
  Soccer: '⚽', Golf: '⛳', Coffee: '☕', Dinner: '🍽️', Sauna: '🧖',
  Surfing: '🏄', Hiking: '🥾', Camping: '🏕️',
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ExploreScreen() {
  const { user, activitySlots, swipeSlot, sportLevels, weeklySelection, setActiveTab } = useStore();
  const [sportFilter, setSportFilter] = useState('all');
  const [dayFilter, setDayFilter] = useState('all');
  const [exploreMode, setExploreMode] = useState('sessions'); // 'sessions' | 'swipe' | 'events'
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);

  const userSports = user?.sports ? Object.keys(user.sports) : [];

  // Load sessions
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const sport = sportFilter === 'all' ? undefined : sportFilter;
    const day = dayFilter === 'all' ? undefined : dayFilter;
    api.getSessions(user.id, sport, day).then(data => {
      setSessions(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user?.id, sportFilter, dayFilter]);

  const handleJoin = async (sessionId) => {
    try {
      const updated = await api.joinSession(sessionId, user.id);
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ...updated } : s));
      if (selectedSession?.id === sessionId) setSelectedSession({ ...selectedSession, ...updated });
    } catch (e) { console.error('Join failed:', e); }
  };

  const handleLeave = async (sessionId) => {
    try {
      const updated = await api.leaveSession(sessionId, user.id);
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, ...updated, joined: false } : s));
      if (selectedSession?.id === sessionId) setSelectedSession({ ...selectedSession, ...updated, joined: false });
    } catch (e) { console.error('Leave failed:', e); }
  };

  // Swipe mode state
  const filteredSlots = activitySlots.filter(s => {
    if (s.alreadySwiped) return false;
    if (sportFilter === 'all') return true;
    return s.sport === sportFilter;
  });
  const currentSlot = filteredSlots[currentIdx];
  const handleSwipe = async (direction) => {
    if (!currentSlot) return;
    await swipeSlot(currentSlot.id, direction);
    setCurrentIdx(prev => prev);
  };

  // Session Detail Overlay
  if (selectedSession) {
    return (
      <div className="h-full bg-gray-50 flex flex-col">
        <div className="relative h-48">
          <img src={selectedSession.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <button onClick={() => setSelectedSession(null)} className="absolute top-12 left-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white text-lg">←</button>
          <div className="absolute bottom-4 left-5 right-5">
            <span className="px-3 py-1 rounded-full bg-active-500 text-white text-xs font-bold">{selectedSession.emoji} {selectedSession.sport}</span>
            <h1 className="text-xl font-extrabold text-white mt-2">{selectedSession.title}</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 pb-28 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <DetailCard icon="📍" label="Location" value={selectedSession.location} />
            <DetailCard icon="📅" label="Day" value={selectedSession.day} />
            <DetailCard icon="🕐" label="Time" value={`${selectedSession.timeStart}–${selectedSession.timeEnd}`} />
            <DetailCard icon="👥" label="Spots" value={`${selectedSession.spotsRemaining} of ${selectedSession.spotsTotal} left`} />
          </div>
          {/* Participants */}
          <div>
            <h3 className="font-bold text-gray-800 mb-2">Who's going</h3>
            {(selectedSession.participantProfiles || []).length === 0 ? (
              <p className="text-gray-400 text-sm">Be the first to join!</p>
            ) : (
              <div className="space-y-2">
                {selectedSession.participantProfiles.map(p => (
                  <div key={p.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
                    <img src={p.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{p.firstName}</p>
                      <p className="text-gray-400 text-xs">{p.neighborhood}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Join/Leave button */}
        <div className="absolute bottom-6 left-5 right-5">
          {selectedSession.joined ? (
            <button onClick={() => handleLeave(selectedSession.id)} className="w-full py-4 rounded-2xl bg-gray-200 text-gray-700 font-bold text-lg">Leave Session</button>
          ) : selectedSession.spotsRemaining > 0 ? (
            <button onClick={() => handleJoin(selectedSession.id)} className="w-full py-4 rounded-2xl bg-active-500 text-white font-bold text-lg shadow-lg shadow-active-500/30">Join Session ⚡</button>
          ) : (
            <button disabled className="w-full py-4 rounded-2xl bg-gray-300 text-gray-500 font-bold text-lg">Session Full</button>
          )}
        </div>
      </div>
    );
  }

  // Group Events mode
  if (exploreMode === 'events') {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <ExploreHeader mode={exploreMode} setMode={setExploreMode} />
        <div className="flex-1 overflow-hidden"><GroupEventsScreen /></div>
      </div>
    );
  }

  // Swipe mode
  if (exploreMode === 'swipe') {
    return (
      <div className="h-full flex flex-col bg-gray-50">
        <ExploreHeader mode={exploreMode} setMode={setExploreMode} />
        <FilterBar sportFilter={sportFilter} setSportFilter={setSportFilter} userSports={userSports} />
        <div className="flex-1 px-5 pb-4 relative">
          <AnimatePresence mode="popLayout">
            {currentSlot ? (
              <SwipeCard key={currentSlot.id} slot={currentSlot} sportLevels={sportLevels} onSwipeLeft={() => handleSwipe('no')} onSwipeRight={() => handleSwipe('yes')} />
            ) : (
              <EmptyState weeklySelection={weeklySelection} setActiveTab={setActiveTab} />
            )}
          </AnimatePresence>
        </div>
        {currentSlot && (
          <div className="flex items-center justify-center gap-4 pb-4 px-5">
            <button onClick={() => handleSwipe('no')} className="w-[72px] h-[72px] rounded-full bg-white shadow-lg border-2 border-gray-200 flex items-center justify-center text-2xl active:scale-90 transition-transform hover:border-red-300"><span className="text-red-400">✕</span></button>
            <button onClick={() => setCurrentIdx(p => p + 1)} className="w-14 h-14 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-lg active:scale-90 transition-transform"><span className="text-active-400">🔖</span></button>
            <button onClick={() => handleSwipe('yes')} className="w-[72px] h-[72px] rounded-full bg-active-500 shadow-lg shadow-active-500/30 flex items-center justify-center text-2xl text-white active:scale-90 transition-transform">✓</button>
          </div>
        )}
      </div>
    );
  }

  // Default: Session Browsing mode
  return (
    <div className="h-full flex flex-col bg-gray-50">
      <ExploreHeader mode={exploreMode} setMode={setExploreMode} />
      <FilterBar sportFilter={sportFilter} setSportFilter={setSportFilter} userSports={userSports} dayFilter={dayFilter} setDayFilter={setDayFilter} showDays />
      <div className="flex-1 overflow-y-auto px-5 pb-28">
        {loading ? (
          <div className="space-y-3 mt-2">{[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl bg-gray-200 animate-pulse" />)}</div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-lg font-bold text-gray-700">No sessions found</h2>
            <p className="text-gray-400 text-sm mt-1">Try a different sport or day filter</p>
          </div>
        ) : (
          <div className="space-y-3 mt-1">
            {sessions.map((s, idx) => (
              <SessionCard key={s.id} session={s} onTap={() => setSelectedSession(s)} onJoin={() => handleJoin(s.id)} delay={idx * 0.05} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExploreHeader({ mode, setMode }) {
  return (
    <div className="px-5 pt-14 pb-2">
      <h1 className="text-2xl font-extrabold text-gray-900"><span className="text-active-500">⚡</span> ActiveCrew</h1>
      <div className="flex gap-2 mt-2">
        {[
          { id: 'sessions', label: '📋 Sessions', },
          { id: 'swipe', label: '🃏 Swipe' },
          { id: 'events', label: '👥 Events' },
        ].map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all ${mode === m.id ? 'bg-active-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function FilterBar({ sportFilter, setSportFilter, userSports, dayFilter, setDayFilter, showDays }) {
  return (
    <div className="px-5 pb-2 space-y-2">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <FilterChip label="All Sports" active={sportFilter === 'all'} onClick={() => setSportFilter('all')} />
        {userSports.map(s => (
          <FilterChip key={s} label={`${SPORT_EMOJI[s] || ''} ${s}`} active={sportFilter === s} onClick={() => setSportFilter(s)} />
        ))}
      </div>
      {showDays && (
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <FilterChip label="Any Day" active={dayFilter === 'all'} onClick={() => setDayFilter('all')} small />
          {DAYS.map(d => (
            <FilterChip key={d} label={d.slice(0, 3)} active={dayFilter === d} onClick={() => setDayFilter(d)} small />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionCard({ session, onTap, onJoin, delay }) {
  const spotsColor = session.spotsRemaining <= 1 ? 'text-red-500' : session.spotsRemaining <= 3 ? 'text-orange-500' : 'text-active-600';
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      <div className="relative h-32 cursor-pointer" onClick={onTap}>
        <img src={session.image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <span className="px-2 py-0.5 rounded-full bg-active-500 text-white text-[10px] font-bold">{session.emoji} {session.sport}</span>
            <h3 className="text-white font-bold text-sm mt-1 leading-tight">{session.title}</h3>
          </div>
          <span className={`text-xs font-bold ${spotsColor} bg-white/90 px-2 py-1 rounded-full`}>
            {session.spotsRemaining} spot{session.spotsRemaining !== 1 ? 's' : ''} left
          </span>
        </div>
      </div>
      <div className="p-3 flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5 text-gray-500 text-xs">
          <span>📍 {session.neighborhood}</span>
          <span>📅 {session.day}</span>
          <span>🕐 {session.timeStart}–{session.timeEnd}</span>
        </div>
        {session.joined ? (
          <span className="px-3 py-1.5 rounded-xl bg-active-100 text-active-700 text-xs font-bold">Joined ✓</span>
        ) : session.spotsRemaining > 0 ? (
          <button onClick={(e) => { e.stopPropagation(); onJoin(); }}
            className="px-3 py-1.5 rounded-xl bg-active-500 text-white text-xs font-bold shadow-sm active:scale-95 transition-transform">
            Join
          </button>
        ) : (
          <span className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-400 text-xs font-bold">Full</span>
        )}
      </div>
      {/* Participant avatars */}
      {(session.participantProfiles || []).length > 0 && (
        <div className="px-3 pb-3 flex items-center gap-1.5">
          <div className="flex -space-x-2">
            {session.participantProfiles.slice(0, 4).map(p => (
              <img key={p.id} src={p.photo} alt="" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
            ))}
          </div>
          <span className="text-gray-400 text-[11px]">{session.participantProfiles.length} going</span>
        </div>
      )}
    </motion.div>
  );
}

function DetailCard({ icon, label, value }) {
  return (
    <div className="bg-white rounded-xl p-3 border border-gray-100">
      <span className="text-lg">{icon}</span>
      <p className="text-gray-400 text-[10px] mt-1">{label}</p>
      <p className="text-gray-800 text-sm font-semibold">{value}</p>
    </div>
  );
}

function FilterChip({ label, active, onClick, small }) {
  return (
    <button onClick={onClick}
      className={`${small ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm'} rounded-full font-semibold whitespace-nowrap transition-all ${active ? 'bg-active-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
    >
      {label}
    </button>
  );
}

function EmptyState({ weeklySelection, setActiveTab }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center px-8">
      {!weeklySelection ? (
        <>
          <div className="text-5xl mb-4">🗓️</div>
          <h2 className="text-xl font-bold text-gray-800">Set up your week first</h2>
          <p className="text-gray-500 mt-2 text-sm">Tell us what sports and times work for you.</p>
          <button onClick={() => setActiveTab('weekly')} className="mt-6 px-6 py-3 rounded-xl bg-active-500 text-white font-bold shadow-lg shadow-active-500/20">Plan My Week →</button>
        </>
      ) : (
        <>
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-xl font-bold text-gray-800">All caught up!</h2>
          <p className="text-gray-500 mt-2 text-sm">No more activities to swipe. Check back later.</p>
        </>
      )}
    </motion.div>
  );
}

function SwipeCard({ slot, sportLevels, onSwipeLeft, onSwipeRight }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const yesOpacity = useTransform(x, [0, 100], [0, 1]);
  const noOpacity = useTransform(x, [-100, 0], [1, 0]);
  const levelLabel = sportLevels[slot.sport]?.levels?.find(l => l.id === slot.level)?.label || slot.level;

  return (
    <motion.div style={{ x, rotate }} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.7}
      onDragEnd={(_, info) => { if (info.offset.x > 100) onSwipeRight(); else if (info.offset.x < -100) onSwipeLeft(); }}
      initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing">
      <div className="h-full rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="absolute inset-0">
          <img src={slot.image} alt={slot.sport} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
        </div>
        <motion.div style={{ opacity: yesOpacity }} className="absolute top-6 left-6 z-10 px-4 py-2 rounded-xl bg-green-500 border-2 border-green-400 -rotate-12">
          <span className="text-white font-extrabold text-xl">I'M IN ⚡</span>
        </motion.div>
        <motion.div style={{ opacity: noOpacity }} className="absolute top-6 right-6 z-10 px-4 py-2 rounded-xl bg-red-500 border-2 border-red-400 rotate-12">
          <span className="text-white font-extrabold text-xl">PASS</span>
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-active-500 text-white text-xs font-bold">{slot.emoji} {slot.sport}</span>
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">{levelLabel}</span>
            {slot.isGroup && <span className="px-3 py-1 rounded-full bg-crew-500 text-white text-xs font-bold">👥 {slot.groupSize} spots</span>}
            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold">{slot.spotsRemaining ?? '?'} left</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white leading-tight">{slot.title}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <InfoPill icon="📍" text={slot.neighborhood} />
            <InfoPill icon="📅" text={slot.day} />
            <InfoPill icon="🕐" text={`${slot.timeStart}–${slot.timeEnd}`} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InfoPill({ icon, text }) {
  return (
    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-medium">
      <span>{icon}</span> {text}
    </span>
  );
}
