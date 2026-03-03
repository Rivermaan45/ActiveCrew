import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store';
import api from '../api';

const EMOJI = {
  Tennis: '🎾', Padel: '🏓', Running: '🏃', Swimming: '🏊', Bouldering: '🧗',
  'Rock Climbing': '🧗', Cycling: '🚴', Gym: '🏋️', Yoga: '🧘', Basketball: '🏀',
  Soccer: '⚽', Golf: '⛳', Coffee: '☕', Dinner: '🍽️', Sauna: '🧖',
  Surfing: '🏄', Hiking: '🥾', Camping: '🏕️',
};

const SPORT_DETAIL_LABELS = {
  Running: {
    trainingFor: { none: 'Just for fun', '5k': '5K', '10k': '10K', half: 'Half Marathon', marathon: 'Marathon', ultra: 'Ultra' },
    pace: { chill: 'Chill pace', '11_plus': '11:00+/mi', '10': '10:00/mi', '9': '9:00/mi', '8': '8:00/mi', '7': '7:00/mi', sub7: 'Sub-7:00/mi' },
    frequency: { '1_2': '1-2x/week', '3_4': '3-4x/week', '5_6': '5-6x/week', daily: 'Every day' },
    style: { social: 'Social runs', training: 'Structured training', both: 'Both' },
  },
  Tennis: {
    experience: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', competitive: 'Competitive', expro: 'Ex-pro' },
    playStyle: { singles: 'Singles', doubles: 'Doubles', both: 'Both' },
    frequency: { '1': '1x/week', '2_3': '2-3x/week', '4_plus': '4+/week' },
  },
  Padel: {
    experience: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced', competitive: 'Competitive' },
    frequency: { '1': '1x/week', '2_3': '2-3x/week', '4_plus': '4+/week' },
  },
};

const BADGE_COLORS = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  orange: 'bg-active-100 text-active-700',
  purple: 'bg-purple-100 text-purple-700',
  gold: 'bg-yellow-100 text-yellow-700',
  teal: 'bg-teal-100 text-teal-700',
  red: 'bg-red-100 text-red-700',
};

export default function ProfileScreen() {
  const { user, sportLevels, matches } = useStore();
  const [streakData, setStreakData] = useState(null);
  const [editing, setEditing] = useState(false);

  // Edit state
  const [editName, setEditName] = useState('');
  const [editJob, setEditJob] = useState('');
  const [editNeighborhood, setEditNeighborhood] = useState('');

  useEffect(() => {
    if (!user) return;
    api.getStreaks(user.id).then(setStreakData).catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      setEditName(user.firstName || '');
      setEditJob(user.jobTitle || '');
      setEditNeighborhood(user.neighborhood || '');
    }
  }, [user?.id]);

  const handleSave = async () => {
    await api.updateUser(user.id, {
      ...user,
      firstName: editName,
      jobTitle: editJob,
      neighborhood: editNeighborhood,
    });
    const updatedUser = { ...user, firstName: editName, jobTitle: editJob, neighborhood: editNeighborhood };
    useStore.setState({ user: updatedUser });
    setEditing(false);
  };

  const totalPlans = matches.filter(m => m.status === 'completed').length;
  const confirmedPlans = matches.filter(m => m.status === 'plan_confirmed').length;

  const getSportDetailChips = (sport) => {
    const details = user?.sportDetails?.[sport];
    const labels = SPORT_DETAIL_LABELS[sport];
    if (!details || !labels) return [];
    const chips = [];
    Object.entries(details).forEach(([key, val]) => {
      const labelMap = labels[key];
      if (labelMap && labelMap[val]) chips.push(labelMap[val]);
    });
    return chips;
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="px-5 pt-14 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900">Profile</h1>
        <button onClick={() => editing ? handleSave() : setEditing(true)}
          className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${editing ? 'bg-active-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
          {editing ? 'Save' : 'Edit'}
        </button>
      </div>

      {/* Profile card */}
      <div className="mx-5 mb-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="relative">
            <img src={user?.photos?.[0]} alt="" className="w-full aspect-square object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-5">
              {editing ? (
                <div className="space-y-2">
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    className="bg-white/20 backdrop-blur-sm text-white font-extrabold text-xl rounded-xl px-3 py-1.5 w-full placeholder-white/50 focus:outline-none" />
                  <input value={editJob} onChange={e => setEditJob(e.target.value)} placeholder="Job title..."
                    className="bg-white/20 backdrop-blur-sm text-white/80 text-sm rounded-xl px-3 py-1.5 w-full placeholder-white/40 focus:outline-none" />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-extrabold text-white">{user?.firstName}, {user?.age}</h2>
                  <p className="text-white/80 text-sm">{user?.jobTitle}</p>
                </>
              )}
            </div>
            {user?.verified && (
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-active-500 text-white text-[10px] font-bold">Verified ✓</div>
            )}
          </div>

          <div className="p-5 space-y-4">
            <div className="flex flex-wrap gap-2">
              {editing ? (
                <div className="w-full">
                  <label className="text-[10px] text-gray-400 uppercase">Neighborhood</label>
                  <input value={editNeighborhood} onChange={e => setEditNeighborhood(e.target.value)}
                    className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 text-sm focus:border-active-500 focus:outline-none" />
                </div>
              ) : (
                <>
                  {user?.neighborhood && <Pill icon="�" text={user.neighborhood} />}
                  {user?.gender && <Pill icon="�" text={user.gender} />}
                </>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-3">
              <StatBox label="Plans Done" value={totalPlans} />
              <StatBox label="Upcoming" value={confirmedPlans} color="text-active-600" />
              <StatBox label="Show-up" value={totalPlans > 0 ? `${Math.round((user?.showUpRate ?? 1) * 100)}%` : '—'} color="text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Streaks & Badges */}
      {streakData && (
        <div className="mx-5 mb-6">
          <div className="bg-gradient-to-r from-active-500 to-crew-500 rounded-2xl p-5 mb-4 shadow-lg shadow-active-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider">Weekly Streak</p>
                <p className="text-white text-4xl font-extrabold mt-1">{streakData.weekStreak}</p>
                <p className="text-white/70 text-sm mt-0.5">
                  {streakData.weekStreak === 1 ? 'week active' : 'weeks in a row'}
                </p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-6xl"
              >
                🔥
              </motion.div>
            </div>
          </div>

          {streakData.badges?.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">Badges</h3>
              <div className="flex flex-wrap gap-2">
                {streakData.badges.map(badge => (
                  <div key={badge.id}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold ${BADGE_COLORS[badge.color] || 'bg-gray-100 text-gray-700'}`}>
                    <span>{badge.icon}</span>
                    <span>{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Prompts */}
      {user?.prompts?.length > 0 && user.prompts.some(p => p.answer) && (
        <div className="mx-5 mb-6">
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">About You</h3>
          <div className="space-y-3">
            {user.prompts.filter(p => p.answer).map((p, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <p className="text-active-600 text-xs font-bold mb-1">{p.question}</p>
                <p className="text-gray-800 text-sm">{p.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sports & Levels with sport-specific details */}
      <div className="mx-5 mb-6">
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">Your Sports</h3>
        <div className="space-y-2">
          {Object.entries(user?.sports || {}).map(([sport, level]) => {
            const levelData = sportLevels[sport]?.levels?.find(l => l.id === level);
            const detailChips = getSportDetailChips(sport);
            return (
              <div key={sport} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{EMOJI[sport] || '🏃'}</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">{sport}</p>
                    <p className="text-gray-500 text-xs">{levelData?.label || level}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-active-50 text-active-700 text-xs font-bold">{level}</span>
                </div>
                {detailChips.length > 0 && (
                  <div className="mt-2 pl-10 flex flex-wrap gap-1.5">
                    {detailChips.map((chip, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full bg-gray-50 text-gray-600 text-[10px] font-semibold">
                        {chip}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* App info */}
      <div className="mx-5 mb-6">
        <div className="bg-gradient-to-r from-active-500 to-crew-400 rounded-2xl p-5 text-center">
          <p className="text-white text-2xl font-extrabold">⚡ ActiveCrew</p>
          <p className="text-white/70 text-xs mt-1">Find Your People. Do Your Thing.</p>
          <p className="text-white/50 text-[10px] mt-2">v0.5.0</p>
        </div>
      </div>

      {/* Reset Demo */}
      <div className="mx-5 mb-6">
        <button
          onClick={async () => {
            if (confirm('Reset the demo? This will clear all your matches, plans, and messages so you can start fresh.')) {
              await useStore.getState().resetDemo();
            }
          }}
          className="w-full py-3.5 rounded-2xl bg-gray-100 border border-gray-200 text-gray-500 text-sm font-semibold active:bg-gray-200 transition-colors"
        >
          🔄 Reset Demo
        </button>
      </div>

      <div className="h-28" />
    </div>
  );
}

function Pill({ icon, text }) {
  return (
    <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium capitalize">
      {icon && <>{icon} </>}{text}
    </span>
  );
}

function StatBox({ label, value, color = 'text-gray-900' }) {
  return (
    <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-gray-500 uppercase font-semibold">{label}</p>
    </div>
  );
}
