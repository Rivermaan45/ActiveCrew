import React, { useState, useRef, useEffect } from 'react';
import useStore from '../store';
import api from '../api';

const QUICK_REPLIES = [
  'On my way! 🏃',
  'Running 10 min late',
  'See you there!',
  'Need to reschedule',
  'Cancel — sorry!',
];

// Simulated reply messages from the other person
const AUTO_REPLIES = [
  'Sounds good! 🙌',
  'See you there!',
  'Can\'t wait! 💪',
  'Perfect, see you soon',
  'Awesome!',
  'Let\'s gooo 🔥',
];

function useCountdown(targetDateStr) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (!targetDateStr) return;
    const tick = () => {
      const now = new Date();
      // Parse day + time into a future date this week
      const dayMap = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 0 };
      const parts = targetDateStr.split(' ');
      const dayName = parts[0];
      const time = parts[1] || '12:00';
      const [h, m] = time.split(':').map(Number);
      const target = new Date();
      const targetDay = dayMap[dayName];
      if (targetDay !== undefined) {
        const diff = (targetDay - target.getDay() + 7) % 7;
        target.setDate(target.getDate() + (diff === 0 && target.getHours() >= h ? 7 : diff));
      }
      target.setHours(h, m, 0, 0);
      const ms = target - now;
      if (ms <= 0) { setTimeLeft('Now!'); return; }
      const hours = Math.floor(ms / (1000 * 60 * 60));
      const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      if (hours >= 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d ${hours % 24}h`);
      } else {
        setTimeLeft(`${hours}h ${mins}m`);
      }
    };
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [targetDateStr]);
  return timeLeft;
}

export default function ChatView() {
  const { currentMatch, user, sendMessage, setScreen, setCurrentMatch, submitReport } = useStore();
  const [text, setText] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [typing, setTyping] = useState(false);
  const [locationSharing, setLocationSharing] = useState(false);
  const [nearbySpots, setNearbySpots] = useState([]);
  const [showNearby, setShowNearby] = useState(false);
  const bottomRef = useRef(null);

  const messages = currentMatch?.messages || [];
  const otherUser = currentMatch?.otherUser;
  const slot = currentMatch?.activitySlot;
  const plan = currentMatch?.plan;

  const countdown = useCountdown(slot ? `${slot.day} ${slot.timeStart}` : null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, typing]);

  // Fetch nearby spots when plan is confirmed
  useEffect(() => {
    if (plan?.status === 'confirmed' && slot?.neighborhood) {
      api.getNearbySpots(slot.neighborhood).then(setNearbySpots).catch(() => {});
    }
  }, [plan?.status, slot?.neighborhood]);

  const handleSend = async (msg, isQuickReply = false) => {
    if (!msg?.trim()) return;
    await sendMessage(currentMatch.id, isQuickReply ? '' : msg, isQuickReply ? msg : '');
    setText('');

    // Simulate typing + reply from the other person (demo)
    if (user.id === 'demo-user' && otherUser?.id) {
      const delay = 1500 + Math.random() * 3000;
      setTimeout(() => setTyping(true), 800);
      setTimeout(async () => {
        setTyping(false);
        const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
        // Send as the OTHER user, not as demo-user
        try {
          const store = useStore.getState();
          await import('../api').then(mod =>
            mod.default.sendMessage(currentMatch.id, otherUser.id, reply, '')
          );
          const matches = await import('../api').then(mod =>
            mod.default.getMatches(store.user.id)
          );
          const updated = matches.find(m => m.id === currentMatch.id);
          useStore.setState({ matches, currentMatch: updated || store.currentMatch });
        } catch (e) { console.error('Auto-reply failed:', e); }
      }, delay);
    }
  };

  return (
    <div className="absolute inset-0 bg-gray-50 flex flex-col z-40">
      {/* Header */}
      <div className="px-5 pt-14 pb-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen(null)} className="text-gray-500 text-sm font-semibold">←</button>
          <button onClick={() => setScreen('profile-view')} className="flex items-center gap-3 flex-1 min-w-0 text-left">
            <img src={otherUser?.photos?.[0]} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100" />
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm">{otherUser?.firstName} <span className="text-gray-400 text-xs font-normal">›</span></p>
              <p className="text-gray-500 text-xs truncate">{slot?.emoji} {slot?.sport} — {slot?.day} {slot?.timeStart}</p>
            </div>
          </button>
          {locationSharing && (
            <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-[9px] font-bold animate-pulse">📍 Live</span>
          )}
          <button onClick={() => setShowReport(!showReport)} className="text-gray-400 text-xl">⋯</button>
        </div>
      </div>

      {/* Plan info banner + countdown */}
      {plan && (
        <div className="mx-5 mt-3 p-3 bg-active-50 rounded-xl border border-active-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-active-700 text-xs font-bold">📍 {plan.place}</p>
              <p className="text-active-600 text-xs">{slot?.day} {slot?.timeStart}–{slot?.timeEnd}</p>
            </div>
            {countdown && (
              <div className="text-right">
                <p className="text-active-700 text-lg font-extrabold leading-tight">{countdown}</p>
                <p className="text-active-500 text-[9px] font-semibold uppercase">until plan</p>
              </div>
            )}
          </div>
          {plan.note && <p className="text-active-500 text-xs mt-1.5 italic">"{plan.note}"</p>}
        </div>
      )}

      {/* Nearby Spots — coffee & food after the activity */}
      {nearbySpots.length > 0 && plan && (
        <div className="mx-5 mt-2">
          <button onClick={() => setShowNearby(!showNearby)}
            className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">☕🍕</span>
              <span className="text-gray-700 text-xs font-bold">Nearby Spots — grab something after?</span>
            </div>
            <span className="text-gray-400 text-sm">{showNearby ? '▲' : '▼'}</span>
          </button>
          {showNearby && (
            <div className="mt-2 space-y-1.5">
              {nearbySpots.map((spot, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
                  <span className="text-xl">{spot.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 text-sm font-semibold truncate">{spot.name}</p>
                    <p className="text-gray-400 text-xs">{spot.distance} · ⭐ {spot.rating}</p>
                  </div>
                  <button onClick={() => handleSend(`Want to grab something at ${spot.name} after? ${spot.emoji}`)}
                    className="px-3 py-1.5 rounded-full bg-active-50 text-active-600 text-[10px] font-bold whitespace-nowrap">
                    Suggest
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Safety & Report dropdown (Bumble-inspired) */}
      {showReport && (
        <div className="mx-5 mt-2 p-4 bg-white rounded-xl border border-gray-200 shadow-lg space-y-2">
          <p className="text-gray-800 text-sm font-bold mb-1">Safety Center</p>

          {/* Location sharing toggle */}
          <button onClick={() => {
            setLocationSharing(!locationSharing);
            setShowReport(false);
          }} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${locationSharing ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
            <span className="text-xl">{locationSharing ? '📍' : '📌'}</span>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${locationSharing ? 'text-green-700' : 'text-gray-700'}`}>
                {locationSharing ? 'Location Sharing ON' : 'Share Live Location'}
              </p>
              <p className="text-gray-400 text-xs">Share your real-time location with your activity partner</p>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors flex items-center ${locationSharing ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'}`}>
              <div className="w-5 h-5 rounded-full bg-white shadow mx-0.5" />
            </div>
          </button>

          {/* SOS Emergency */}
          <button onClick={() => {
            alert('🚨 Emergency services would be contacted.\n📍 Your location would be shared.\n👤 A trusted contact would be notified.\n\n(Demo mode — no real action taken)');
            setShowReport(false);
          }} className="w-full flex items-center gap-3 p-3 rounded-xl border border-red-200 bg-red-50 text-left">
            <span className="text-xl">🚨</span>
            <div>
              <p className="text-red-700 text-sm font-semibold">Emergency SOS</p>
              <p className="text-red-400 text-xs">Contact emergency services & share location</p>
            </div>
          </button>

          <div className="border-t border-gray-100 pt-2 mt-1">
            <button onClick={() => {
              submitReport({ reporterId: user.id, reportedId: otherUser?.id, reason: 'inappropriate', matchId: currentMatch.id });
              setShowReport(false);
            }} className="w-full py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold">
              Report User
            </button>
          </div>

          <button onClick={() => setShowReport(false)} className="w-full py-2 rounded-lg text-gray-400 text-sm font-semibold">
            Close
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {messages.length === 0 && !typing && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Plan confirmed! Say hello 👋</p>
          </div>
        )}
        {messages.map(msg => {
          const isMine = msg.userId === user.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              {!isMine && (
                <img src={otherUser?.photos?.[0]} alt="" className="w-6 h-6 rounded-full object-cover mr-2 mt-1 shrink-0" />
              )}
              <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${isMine
                ? 'bg-active-500 text-white rounded-br-md'
                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
              }`}>
                <p className="text-sm">{msg.text}</p>
                <p className={`text-[9px] mt-1 ${isMine ? 'text-white/50' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typing && (
          <div className="flex items-center gap-2">
            <img src={otherUser?.photos?.[0]} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <div className="px-5 pb-2">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {QUICK_REPLIES.map(qr => (
            <button key={qr} onClick={() => handleSend(qr, true)}
              className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 text-xs font-medium whitespace-nowrap hover:bg-active-50 hover:border-active-200 transition-colors">
              {qr}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-5 pb-5 pt-2 bg-white border-t border-gray-100 safe-bottom">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend(text)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-active-500/30"
          />
          <button onClick={() => handleSend(text)}
            disabled={!text.trim()}
            className="px-4 py-3 rounded-xl bg-active-500 text-white font-bold disabled:opacity-40">
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}
