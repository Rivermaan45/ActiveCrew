import React, { useState } from 'react';
import useStore from '../store';

export default function RatingModal() {
  const { currentMatch, user, submitRating, setScreen } = useStore();
  const [showedUp, setShowedUp] = useState(true);
  const [respectful, setRespectful] = useState(5);
  const [onTime, setOnTime] = useState(5);
  const [vibe, setVibe] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const otherUser = currentMatch?.otherUser;
  const slot = currentMatch?.activitySlot;
  const plan = currentMatch?.plan;

  const handleSubmit = async () => {
    await submitRating({
      planId: plan?.id,
      raterId: user.id,
      rateeId: otherUser?.id,
      showedUp,
      respectful,
      onTime,
      vibe,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="absolute inset-0 bg-gray-950 flex flex-col items-center justify-center p-8 z-50">
        <div className="text-5xl mb-4">🎉</div>
        <h1 className="text-2xl font-extrabold text-white mb-2">Thanks for the rating!</h1>
        <p className="text-gray-400 text-center mb-8">This helps the community stay reliable.</p>
        <button onClick={() => { setScreen(null); useStore.getState().setActiveTab('explore'); }}
          className="w-full py-3.5 rounded-xl bg-active-500 text-white font-bold text-lg">
          Back to Explore
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-gray-50 flex flex-col z-40">
      <div className="px-5 pt-14 pb-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <button onClick={() => setScreen(null)} className="text-gray-500 text-sm font-semibold">← Back</button>
          <h2 className="text-lg font-bold text-gray-900">Rate Your Plan</h2>
          <div className="w-12" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {/* Match info */}
        <div className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <img src={otherUser?.photos?.[0]} alt="" className="w-14 h-14 rounded-xl object-cover" />
          <div>
            <p className="font-bold text-gray-900">{slot?.emoji} {slot?.sport} with {otherUser?.firstName}</p>
            <p className="text-gray-500 text-sm">{slot?.title}</p>
          </div>
        </div>

        {/* Show up */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">Did they show up?</h3>
          <div className="flex gap-3">
            <button onClick={() => setShowedUp(true)}
              className={`flex-1 py-3 rounded-xl font-bold text-lg border-2 transition-all ${showedUp ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-500'}`}>
              Yes ✓
            </button>
            <button onClick={() => setShowedUp(false)}
              className={`flex-1 py-3 rounded-xl font-bold text-lg border-2 transition-all ${!showedUp ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-500'}`}>
              No ✕
            </button>
          </div>
        </div>

        {showedUp && (
          <>
            <RatingRow label="On Time" value={onTime} onChange={setOnTime} />
            <RatingRow label="Respectful" value={respectful} onChange={setRespectful} />
            <RatingRow label="Vibe / Fun" value={vibe} onChange={setVibe} />
          </>
        )}
      </div>

      <div className="p-5 bg-white border-t border-gray-100">
        <button onClick={handleSubmit}
          className="w-full py-3.5 rounded-xl bg-active-500 text-white font-bold text-lg active:scale-[0.98] transition-transform">
          Submit Rating
        </button>
      </div>
    </div>
  );
}

function RatingRow({ label, value, onChange }) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">{label}</h3>
        <span className="text-active-600 font-bold">{value}/5</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n} onClick={() => onChange(n)}
            className={`flex-1 py-3 rounded-xl text-lg font-bold transition-all ${n <= value ? 'bg-active-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
            {n <= value ? '★' : '☆'}
          </button>
        ))}
      </div>
    </div>
  );
}
