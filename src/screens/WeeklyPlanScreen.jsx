import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store';

const DAYS = [
  { id: 'Monday', short: 'Mon' }, { id: 'Tuesday', short: 'Tue' },
  { id: 'Wednesday', short: 'Wed' }, { id: 'Thursday', short: 'Thu' },
  { id: 'Friday', short: 'Fri' }, { id: 'Saturday', short: 'Sat' },
  { id: 'Sunday', short: 'Sun' },
];
const TIME_SLOTS = [
  { id: 'morning', label: 'AM', time: '6–12', icon: '☀️' },
  { id: 'afternoon', label: 'PM', time: '12–17', icon: '🌤️' },
  { id: 'evening', label: 'Eve', time: '17–22', icon: '🌙' },
];

const SPORT_EMOJI = {
  Tennis: '🎾', Padel: '🏓', Running: '🏃', Swimming: '🏊', Bouldering: '🧗',
  'Rock Climbing': '🧗', Cycling: '🚴', Gym: '🏋️', Yoga: '🧘', Basketball: '🏀',
  Soccer: '⚽', Golf: '⛳', Coffee: '☕', Dinner: '🍽️', Sauna: '🧖',
  Surfing: '🏄', Hiking: '🥾', Camping: '🏕️',
};

export default function WeeklyPlanScreen() {
  const { user, submitWeeklySelection, setActiveTab } = useStore();
  const [selectedSports, setSelectedSports] = useState([]);
  const [selectedDays, setSelectedDays] = useState({});
  const [radius, setRadius] = useState(5);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const userSports = user?.sports ? Object.keys(user.sports) : [];

  const toggleSport = (sport) => {
    setSelectedSports(prev =>
      prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
    );
  };

  const toggleTimeSlot = (day, slotId) => {
    setSelectedDays(prev => {
      const daySlots = prev[day] || [];
      const updated = daySlots.includes(slotId)
        ? daySlots.filter(s => s !== slotId)
        : [...daySlots, slotId];
      return { ...prev, [day]: updated };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    const sports = selectedSports.map(s => ({ sport: s, level: user.sports[s] || 'recreational' }));
    const availability = Object.entries(selectedDays)
      .filter(([_, slots]) => slots.length > 0)
      .map(([day, slots]) => ({ day, timeSlots: slots }));

    await submitWeeklySelection(sports, availability, radius);
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-gray-50">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">You're set!</h1>
          <p className="text-gray-500 text-sm mb-6">
            Go explore your matched activities.
          </p>
          <button onClick={() => setActiveTab('explore')}
            className="w-full py-3.5 rounded-xl bg-active-500 text-white font-bold text-lg">
            Explore ⚡
          </button>
        </motion.div>
      </div>
    );
  }

  const totalSlots = Object.values(selectedDays).reduce((sum, s) => sum + s.length, 0);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="px-5 pt-14 pb-3">
        <h1 className="text-2xl font-extrabold text-gray-900">🗓️ My Week</h1>
        <p className="text-gray-500 text-xs mt-0.5">Pick sports, times, and distance — all on one page.</p>
      </div>

      {/* Single scrollable page */}
      <div className="flex-1 overflow-y-auto px-5 pb-32 space-y-5">

        {/* Sports */}
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">What this week?</p>
          <div className="flex gap-2">
            {userSports.map(sport => {
              const selected = selectedSports.includes(sport);
              return (
                <button key={sport} onClick={() => toggleSport(sport)}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-2xl border-2 transition-all ${selected ? 'border-active-500 bg-active-50' : 'border-gray-200 bg-white'}`}>
                  <span className="text-xl">{SPORT_EMOJI[sport] || '🏃'}</span>
                  <span className={`text-sm font-bold ${selected ? 'text-active-700' : 'text-gray-700'}`}>{sport}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day × Time Grid — compact */}
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
            When? <span className="text-active-500">({totalSlots} selected)</span>
          </p>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-4 border-b border-gray-100">
              <div className="p-2" />
              {TIME_SLOTS.map(t => (
                <div key={t.id} className="p-2 text-center">
                  <span className="text-[10px] text-gray-400 font-semibold">{t.icon} {t.label}</span>
                </div>
              ))}
            </div>
            {/* Day rows */}
            {DAYS.map(day => {
              const daySlots = selectedDays[day.id] || [];
              return (
                <div key={day.id} className="grid grid-cols-4 border-b border-gray-50 last:border-0">
                  <div className="p-2 flex items-center">
                    <span className={`text-xs font-bold ${daySlots.length > 0 ? 'text-active-600' : 'text-gray-500'}`}>{day.short}</span>
                  </div>
                  {TIME_SLOTS.map(slot => {
                    const selected = daySlots.includes(slot.id);
                    return (
                      <div key={slot.id} className="p-1.5 flex items-center justify-center">
                        <button onClick={() => toggleTimeSlot(day.id, slot.id)}
                          className={`w-full h-8 rounded-lg text-xs font-semibold transition-all ${selected ? 'bg-active-500 text-white' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>
                          {selected ? '✓' : '—'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Distance — inline chips */}
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">How far?</p>
          <div className="flex gap-2">
            {[1, 3, 5, 10, 25].map(r => (
              <button key={r} onClick={() => setRadius(r)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${radius === r ? 'bg-active-500 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                {r} mi
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-10">
        <button
          onClick={handleSubmit}
          disabled={selectedSports.length === 0 || loading}
          className="w-full py-3.5 rounded-xl bg-active-500 text-white font-bold text-lg disabled:opacity-40 shadow-lg shadow-active-500/20"
        >
          {loading ? 'Setting up...' : 'Set My Week ⚡'}
        </button>
      </div>
    </div>
  );
}
