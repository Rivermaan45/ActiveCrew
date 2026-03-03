import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store';

export default function MatchPreview() {
  const { currentMatchPreview, confirmMatchPreview, setScreen, setCurrentMatchPreview, sportLevels } = useStore();
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState('review'); // review | waiting | passed
  const mountedRef = useRef(true);

  const mc = currentMatchPreview;
  const otherUser = mc?.otherUser;
  const slot = mc?.activitySlot;

  const sport = slot?.sport;
  const levelId = sport ? otherUser?.sports?.[sport] : null;
  const levelLabel = sport && levelId
    ? (sportLevels?.[sport]?.levels?.find(l => l.id === levelId)?.label || levelId)
    : 'Any level';

  const photos = (otherUser?.photos || []).slice(0, 3);

  const reliabilityLabel = otherUser?.totalPlans > 0
    ? `${Math.round((otherUser?.showUpRate ?? 1) * 100)}% show-up`
    : 'New';

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    setPhase('review');
  }, [mc?.id]);

  if (!mc || !otherUser) return null;

  const handleBack = () => {
    setCurrentMatchPreview(null);
    setScreen(null);
  };

  const handleAction = async (confirmed) => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await confirmMatchPreview(mc.id, confirmed);

      if (!confirmed || result.status === 'passed') {
        if (mountedRef.current) setPhase('passed');
        return;
      }

      if (result.status === 'waiting_for_other') {
        if (mountedRef.current) setPhase('waiting');
        return;
      }

      // If matched, store will refresh matches; we can close this overlay.
      setCurrentMatchPreview(null);
      setScreen(null);
    } catch (e) {
      console.error(e);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  if (phase === 'waiting') {
    return (
      <div className="absolute inset-0 bg-gray-950 flex flex-col items-center justify-center p-8 z-50">
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Confirmed!</h1>
          <p className="text-gray-400 mb-2">
            Waiting for {otherUser.firstName} to confirm.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            If they confirm too, you'll go straight to scheduling.
          </p>
          <div className="flex items-center justify-center gap-4 mb-8">
            <img src={otherUser.photos?.[0]} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-gray-700" />
          </div>
          <button
            onClick={handleBack}
            className="w-full py-3.5 rounded-xl bg-active-500 text-white font-bold text-lg"
          >
            Back to Matches
          </button>
          <button
            onClick={() => {
              setCurrentMatchPreview(null);
              setScreen(null);
              useStore.getState().setActiveTab('explore');
            }}
            className="w-full py-3.5 rounded-xl bg-gray-800 text-gray-300 font-semibold mt-3"
          >
            Keep Exploring
          </button>
        </motion.div>
      </div>
    );
  }

  if (phase === 'passed') {
    return (
      <div className="absolute inset-0 bg-gray-950 flex flex-col items-center justify-center p-8 z-50">
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">✕</div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Passed</h1>
          <p className="text-gray-400 mb-8">
            This match preview is closed. No one is notified.
          </p>
          <button
            onClick={() => {
              setCurrentMatchPreview(null);
              setScreen(null);
            }}
            className="w-full py-3.5 rounded-xl bg-active-500 text-white font-bold text-lg"
          >
            Done
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-gray-50 flex flex-col z-50">
      <div className="px-5 pt-14 pb-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <button onClick={handleBack} className="text-gray-500 text-sm font-semibold">← Back</button>
          <h2 className="text-lg font-bold text-gray-900">Match Preview</h2>
          <div className="w-12" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Plan</p>
          <p className="font-extrabold text-gray-900 mt-1">
            {slot?.emoji} {slot?.sport} — {slot?.title}
          </p>
          <p className="text-gray-500 text-sm mt-1">
            📅 {slot?.day} · 🕐 {slot?.timeStart}–{slot?.timeEnd} · 📍 {slot?.neighborhood}
          </p>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="p-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Profile Reveal</p>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-1">{otherUser.firstName}, {otherUser.age}</h1>
          </div>

          <div className="px-4 pb-4">
            {photos.length > 1 ? (
              <div className="grid grid-cols-3 gap-2">
                <img src={photos[0]} alt="" className="col-span-3 w-full aspect-[3/4] rounded-2xl object-cover" />
                {photos.slice(1).map((p, i) => (
                  <img key={i} src={p} alt="" className="w-full aspect-square rounded-xl object-cover" />
                ))}
              </div>
            ) : (
              <img src={photos[0]} alt="" className="w-full aspect-[3/4] rounded-2xl object-cover" />
            )}
          </div>

          <div className="px-4 pb-4">
            <div className="flex flex-wrap gap-2">
              {otherUser.neighborhood && (
                <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">📍 {otherUser.neighborhood}</span>
              )}
              {sport && (
                <span className="px-3 py-1.5 rounded-full bg-active-50 text-active-700 text-xs font-semibold">🏅 {sport} · {levelLabel}</span>
              )}
              <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">⭐ {reliabilityLabel}</span>
              {otherUser.compatibility && (
                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${otherUser.compatibility >= 80 ? 'bg-green-100 text-green-700' : otherUser.compatibility >= 60 ? 'bg-active-50 text-active-700' : 'bg-gray-100 text-gray-600'}`}>
                  💯 {otherUser.compatibility}% compatible
                </span>
              )}
              {otherUser.bio && (
                <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">⚡ {otherUser.bio}</span>
              )}
            </div>

            <div className="mt-4 bg-gray-50 rounded-2xl p-4">
              <p className="text-gray-700 text-sm">
                Confirm to proceed to scheduling. Pass ends it quietly.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-5 bg-white border-t border-gray-100 space-y-3">
        <button
          onClick={() => handleAction(true)}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-active-500 text-white font-bold text-lg disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          {loading ? 'Confirming...' : 'Confirm this match ✅'}
        </button>
        <button
          onClick={() => handleAction(false)}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gray-900 text-gray-200 font-bold text-lg disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          Pass
        </button>
      </div>
    </div>
  );
}
