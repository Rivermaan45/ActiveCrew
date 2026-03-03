import React from 'react';
import useStore from '../store';

export default function MatchesScreen() {
  const { matches, matchCandidates, setCurrentMatch, setCurrentMatchPreview, setScreen } = useStore();

  const pendingPlan = matches.filter(m => m.status === 'pending_plan');
  const confirmed = matches.filter(m => m.status === 'plan_confirmed');
  const completed = matches.filter(m => m.status === 'completed');

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-2xl font-extrabold text-gray-900">Matches</h1>
        <p className="text-gray-500 text-sm mt-0.5">Your activity partners</p>
      </div>

      {/* Match Previews */}
      {matchCandidates.length > 0 && (
        <Section title="Match Previews" count={matchCandidates.length}>
          {matchCandidates.map(mc => (
            <MatchPreviewCard key={mc.id} mc={mc} onTap={() => {
              setCurrentMatchPreview(mc);
              setScreen('match-preview');
            }} />
          ))}
        </Section>
      )}

      {/* Pending Plan */}
      {pendingPlan.length > 0 && (
        <Section title="Schedule a Plan" count={pendingPlan.length}>
          {pendingPlan.map(m => (
            <MatchCard key={m.id} match={m} badge="Schedule" badgeColor="bg-active-500" onTap={() => {
              setCurrentMatch(m);
              setScreen('confirm-plan');
            }} />
          ))}
        </Section>
      )}

      {/* Confirmed */}
      {confirmed.length > 0 && (
        <Section title="Upcoming Plans" count={confirmed.length}>
          {confirmed.map(m => (
            <MatchCard key={m.id} match={m} badge="Confirmed ✓" badgeColor="bg-green-500" onTap={() => {
              setCurrentMatch(m);
              setScreen('chat');
            }} />
          ))}
        </Section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <Section title="Past Plans" count={completed.length}>
          {completed.map(m => (
            <MatchCard key={m.id} match={m} badge="Done" badgeColor="bg-gray-400" onTap={() => {
              setCurrentMatch(m);
              setScreen('rating');
            }} />
          ))}
        </Section>
      )}

      {matches.length === 0 && matchCandidates.length === 0 && (
        <div className="text-center py-20 px-8">
          <div className="text-5xl mb-4">⚡</div>
          <h2 className="text-xl font-bold text-gray-800">No matches yet</h2>
          <p className="text-gray-500 mt-2 text-sm">Swipe right on activities and pick someone to match with!</p>
        </div>
      )}

      <div className="h-24" />
    </div>
  );
}

function Section({ title, count, children }) {
  return (
    <div className="px-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider">{title}</h3>
        <span className="px-2 py-0.5 rounded-full bg-active-100 text-active-700 text-xs font-bold">{count}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function MatchPreviewCard({ mc, onTap }) {
  return (
    <button onClick={onTap} className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-left">
      <img src={mc.otherUser?.photos?.[0]} alt="" className="w-14 h-14 rounded-xl object-cover" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900">{mc.otherUser?.firstName}, {mc.otherUser?.age}</p>
        <p className="text-gray-500 text-sm truncate">{mc.activitySlot?.sport} — {mc.activitySlot?.title}</p>
      </div>
      <span className="px-3 py-1 rounded-full bg-active-500 text-white text-xs font-bold shrink-0">Review</span>
    </button>
  );
}

function MatchCard({ match, badge, badgeColor, onTap }) {
  return (
    <button onClick={onTap} className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 text-left">
      <img src={match.otherUser?.photos?.[0]} alt="" className="w-14 h-14 rounded-xl object-cover" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900">{match.otherUser?.firstName}</p>
        <p className="text-gray-500 text-sm truncate">{match.activitySlot?.emoji} {match.activitySlot?.sport} — {match.activitySlot?.title}</p>
        {match.plan && (
          <p className="text-active-600 text-xs mt-0.5 font-medium">
            📅 {match.activitySlot?.day} {match.activitySlot?.timeStart} · 📍 {match.activitySlot?.location}
          </p>
        )}
      </div>
      <span className={`px-3 py-1 rounded-full text-white text-xs font-bold shrink-0 ${badgeColor}`}>{badge}</span>
    </button>
  );
}
