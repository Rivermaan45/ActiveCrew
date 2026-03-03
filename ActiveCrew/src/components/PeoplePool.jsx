import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store';

export default function PeoplePool() {
  const { peoplePool, currentSlot, selectPerson, setScreen, sportLevels } = useStore();
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [loading, setLoading] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);
  const [groupSelected, setGroupSelected] = useState(new Set());

  const isGroup = currentSlot?.isGroup;
  const maxGroupPicks = (currentSlot?.groupSize || 2) - 1; // minus yourself

  const toggleGroupPick = (personId) => {
    setGroupSelected(prev => {
      const next = new Set(prev);
      if (next.has(personId)) { next.delete(personId); }
      else if (next.size < maxGroupPicks) { next.add(personId); }
      return next;
    });
  };

  const handleSelect = async (person) => {
    if (!currentSlot) return;
    setLoading(true);
    try {
      await selectPerson(currentSlot.id, person.id);
    } catch (e) {
      console.error(e);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const handleGroupSelect = async () => {
    if (!currentSlot || groupSelected.size === 0) return;
    setLoading(true);
    const selectedPeople = peoplePool.filter(p => groupSelected.has(p.id));
    try {
      for (const person of selectedPeople) {
        await selectPerson(currentSlot.id, person.id);
      }
    } catch (e) {
      console.error(e);
      if (mountedRef.current) setLoading(false);
      return;
    }
    if (mountedRef.current) setLoading(false);
  };

  return (
    <div className="absolute inset-0 bg-gray-50 flex flex-col z-40">
      {/* Header */}
      <div className="px-5 pt-14 pb-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <button onClick={() => setScreen(null)} className="text-gray-500 text-sm font-semibold">← Back</button>
          <h2 className="text-lg font-bold text-gray-900">
            {currentSlot?.emoji} {currentSlot?.sport} — {currentSlot?.title}
          </h2>
          <div className="w-12" />
        </div>
        <p className="text-gray-500 text-xs mt-1 text-center">
          {currentSlot?.day} {currentSlot?.timeStart}–{currentSlot?.timeEnd} · {currentSlot?.neighborhood}
        </p>
        {isGroup && (
          <div className="mt-2 flex items-center justify-center gap-2">
            <span className="px-3 py-1 rounded-full bg-crew-50 text-crew-700 text-xs font-bold">
              👥 Group Activity · Pick up to {maxGroupPicks} {maxGroupPicks === 1 ? 'person' : 'people'}
            </span>
          </div>
        )}
      </div>

      {/* People list */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {peoplePool.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🤷</div>
            <p className="text-gray-500">No one else is available for this slot yet.</p>
          </div>
        ) : (
          peoplePool.map((person, idx) => (
            <PersonCard
              key={person.id}
              person={person}
              sport={currentSlot?.sport}
              sportLevels={sportLevels}
              expanded={selectedIdx === idx}
              onToggle={() => setSelectedIdx(selectedIdx === idx ? null : idx)}
              onSelect={isGroup ? undefined : () => handleSelect(person)}
              loading={loading}
              isGroup={isGroup}
              isGroupSelected={groupSelected.has(person.id)}
              onGroupToggle={() => toggleGroupPick(person.id)}
              groupFull={groupSelected.size >= maxGroupPicks && !groupSelected.has(person.id)}
            />
          ))
        )}
      </div>

      {/* Group confirm button (sticky bottom) */}
      {isGroup && groupSelected.size > 0 && (
        <div className="p-5 bg-white border-t border-gray-100">
          <button onClick={handleGroupSelect} disabled={loading}
            className="w-full py-3.5 rounded-xl bg-active-500 text-white font-bold text-lg disabled:opacity-50 shadow-lg shadow-active-500/20">
            {loading ? 'Sending...' : `Request Group (${groupSelected.size}/${maxGroupPicks}) ⚡`}
          </button>
        </div>
      )}
    </div>
  );
}

function PersonCard({ person, sport, sportLevels, expanded, onToggle, onSelect, loading, isGroup, isGroupSelected, onGroupToggle, groupFull }) {
  const levelId = person.sports?.[sport];
  const levelLabel = sportLevels[sport]?.levels?.find(l => l.id === levelId)?.label || levelId || 'Any level';

  return (
    <motion.div layout className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-colors ${isGroupSelected ? 'border-active-500 ring-2 ring-active-500/20' : 'border-gray-100'}`}>
      {/* Preview row */}
      <button onClick={onToggle} className="w-full flex items-center gap-4 p-4">
        {isGroup && (
          <button
            onClick={(e) => { e.stopPropagation(); onGroupToggle?.(); }}
            disabled={groupFull && !isGroupSelected}
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isGroupSelected ? 'bg-active-500 border-active-500 text-white' : groupFull ? 'border-gray-200 bg-gray-50' : 'border-gray-300'}`}
          >
            {isGroupSelected && <span className="text-xs font-bold">✓</span>}
          </button>
        )}
        <img src={person.photos?.[0]} alt={person.firstName} className="w-16 h-16 rounded-2xl object-cover" />
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">{person.firstName}</span>
            <span className="text-gray-400 text-sm">{person.age}</span>
            {person.verified && <span className="text-active-500 text-xs">✓</span>}
          </div>
          <p className="text-gray-500 text-sm truncate">{person.bio}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-full bg-active-50 text-active-600 text-xs font-semibold">{levelLabel}</span>
            <span className="text-gray-400 text-xs flex items-center gap-1">
              ⭐ {person.totalPlans > 0 ? `${Math.round(person.showUpRate * 100)}% show-up` : 'New'}
            </span>
          </div>
        </div>
        <span className="text-gray-300 text-xl">{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Expanded profile (Hinge-style) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Photo */}
              <img src={person.photos?.[0]} alt="" className="w-full aspect-[3/4] rounded-2xl object-cover" />

              {/* Info */}
              <div className="flex flex-wrap gap-2">
                {person.jobTitle && (
                  <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">💼 {person.jobTitle}{person.company ? ` @ ${person.company}` : ''}</span>
                )}
                {person.neighborhood && (
                  <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">📍 {person.neighborhood}</span>
                )}
                {person.height && (
                  <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">📏 {person.height}</span>
                )}
              </div>

              {/* Sports badges */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1.5">Sports</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(person.sports || {}).map(([s, lv]) => (
                    <span key={s} className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s === sport ? 'bg-active-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                      {s} · {lv}
                    </span>
                  ))}
                </div>
              </div>

              {/* Prompts */}
              {person.prompts?.map((p, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-active-600 text-xs font-bold mb-1">{p.question}</p>
                  <p className="text-gray-800 text-sm">{p.answer}</p>
                </div>
              ))}

              {/* Stats */}
              <div className="flex gap-3">
                <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-gray-900">{person.totalPlans}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Plans Done</p>
                </div>
                <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-active-600">{person.totalPlans > 0 ? `${Math.round(person.showUpRate * 100)}%` : '—'}</p>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Show-up Rate</p>
                </div>
              </div>

              {/* Select button */}
              <button onClick={onSelect} disabled={loading}
                className="w-full py-3.5 rounded-xl bg-active-500 text-white font-bold text-base disabled:opacity-50 active:scale-[0.98] transition-transform">
                {loading ? 'Matching...' : `Do ${sport} with ${person.firstName} ⚡`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
