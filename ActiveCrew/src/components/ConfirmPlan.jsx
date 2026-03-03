import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store';

const PLACE_SUGGESTIONS = {
  'East Village': ['Tompkins Square Park', 'St. Marks Place', 'Astor Place'],
  'Central Park': ['Engineers\' Gate (90th & 5th)', 'Bethesda Fountain', 'Great Lawn'],
  'West Village': ['Hudson River Park', 'Washington Square Park', 'Chelsea Piers'],
  'Williamsburg': ['McCarren Park', 'Domino Park', 'East River State Park'],
  'SoHo': ['Prince St & Broadway', 'Mercer Playground', 'Thompson St Park'],
  'DUMBO': ['Brooklyn Bridge Park', 'Jane\'s Carousel', 'Main St Park'],
  'Flatiron': ['Madison Square Park', 'Union Square', 'Gramercy Park area'],
  'Gowanus': ['Brooklyn Boulders Gowanus', 'Whole Foods Gowanus', '4th Ave entrance'],
  'Long Island City': ['The Cliffs LIC entrance', 'Gantry Plaza', 'Hunters Point'],
  'Greenpoint': ['McCarren Pool entrance', 'WNYC Transmitter Park', 'India St pier'],
  'Prospect Park': ['Grand Army Plaza', 'Bartel-Pritchard entrance', 'Lakeside Center'],
  'Upper West Side': ['Columbus Circle', 'Riverside Park 72nd', 'Central Park West 86th'],
  'Upper East Side': ['Engineers\' Gate', '92nd St Y area', 'Carl Schurz Park'],
  'Rockaway Beach': ['Beach 67th St entrance', 'Beach 90th St entrance', 'Locals Surf School'],
  'Bear Mountain': ['Bear Mountain Inn parking', 'Hessian Lake trailhead', 'Perkins Memorial Tower lot'],
  'Harriman State Park': ['Beaver Pond Campground', 'Lake Sebago Beach', 'Reeves Meadow trailhead'],
  'Cold Spring': ['Breakneck Ridge trailhead (Metro-North stop)', 'Cold Spring village gazebo', 'Main St & Market St'],
  'Palisades': ['Palisades Interstate Park entrance', 'Alpine Picnic Area', 'State Line Lookout'],
  'Catskills': ['Slide Mountain trailhead', 'Phoenicia town center', 'Woodland Valley campground'],
};

export default function ConfirmPlan() {
  const { currentMatch, proposePlan, setScreen } = useStore();
  const [step, setStep] = useState(0);
  const [note, setNote] = useState('');
  const [selectedPlace, setSelectedPlace] = useState('');
  const [bringFriend, setBringFriend] = useState(false);

  const slot = currentMatch?.activitySlot;
  const neighborhood = slot?.neighborhood || 'West Village';
  const places = PLACE_SUGGESTIONS[neighborhood] || PLACE_SUGGESTIONS['West Village'];

  const timeSlot = {
    day: slot?.day,
    date: getNextDay(slot?.day),
    start: slot?.timeStart,
    end: slot?.timeEnd,
  };

  const handleConfirm = async () => {
    const finalNote = bringFriend ? `${note ? note + ' · ' : ''}👯 Bringing a +1 — feel free to bring someone too!` : note;
    await proposePlan(currentMatch.id, timeSlot, selectedPlace || places[0], finalNote);
    setScreen(null);
    useStore.getState().setActiveTab('matches');
  };

  return (
    <div className="absolute inset-0 bg-gray-50 flex flex-col z-40">
      <div className="px-5 pt-14 pb-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <button onClick={() => setScreen(null)} className="text-gray-500 text-sm font-semibold">← Back</button>
          <h2 className="text-lg font-bold text-gray-900">Lock In Plan</h2>
          <div className="w-12" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {/* Match info */}
        <div className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          <img src={currentMatch?.otherUser?.photos?.[0]} alt="" className="w-14 h-14 rounded-xl object-cover" />
          <div>
            <p className="font-bold text-gray-900">{slot?.emoji} {slot?.sport} with {currentMatch?.otherUser?.firstName}</p>
            <p className="text-gray-500 text-sm">{slot?.title}</p>
          </div>
        </div>

        {/* Time (from the activity slot) */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">When</h3>
          <div className="bg-white rounded-2xl p-4 border border-active-200 shadow-sm">
            <p className="font-bold text-gray-900">📅 {timeSlot.day}, {timeSlot.date}</p>
            <p className="text-active-600 text-sm font-medium mt-1">🕐 {timeSlot.start} – {timeSlot.end}</p>
          </div>
        </div>

        {/* Place */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">Where to meet</h3>
          <div className="space-y-2">
            {places.map(place => (
              <button key={place} onClick={() => setSelectedPlace(place)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${selectedPlace === place ? 'border-active-500 bg-active-50' : 'border-gray-200 bg-white'}`}
              >
                <p className={`font-semibold ${selectedPlace === place ? 'text-active-700' : 'text-gray-800'}`}>📍 {place}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Bring a Friend / Double Date */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">Bring a Friend?</h3>
          <button onClick={() => setBringFriend(!bringFriend)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${bringFriend ? 'border-crew-500 bg-crew-50' : 'border-gray-200 bg-white'}`}
          >
            <span className="text-3xl">{bringFriend ? '👯' : '👤'}</span>
            <div className="flex-1">
              <p className={`font-bold text-sm ${bringFriend ? 'text-crew-700' : 'text-gray-800'}`}>
                {bringFriend ? 'Bringing a +1!' : 'Bring a friend along'}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                {bringFriend
                  ? 'Your partner will see this and can bring someone too — double date vibes!'
                  : 'Feel safer or make it social — your match can bring someone too'}
              </p>
            </div>
            <div className={`w-10 h-6 rounded-full transition-colors flex items-center ${bringFriend ? 'bg-crew-500 justify-end' : 'bg-gray-300 justify-start'}`}>
              <div className="w-5 h-5 rounded-full bg-white shadow mx-0.5" />
            </div>
          </button>
        </div>

        {/* Note */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">Quick note (optional)</h3>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value.slice(0, 140))}
            placeholder="Looking forward to it! I'll be in a blue shirt..."
            rows={3}
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:border-active-500 focus:outline-none resize-none"
          />
          <p className="text-right text-xs text-gray-400 mt-1">{note.length}/140</p>
        </div>
      </div>

      <div className="p-5 bg-white border-t border-gray-100">
        <button onClick={handleConfirm}
          className="w-full py-3.5 rounded-xl bg-active-500 text-white font-bold text-lg active:scale-[0.98] transition-transform">
          Confirm Plan ⚡
        </button>
      </div>
    </div>
  );
}

function getNextDay(dayName) {
  if (!dayName) return '';
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date();
  const todayIdx = today.getDay();
  const targetIdx = days.indexOf(dayName);
  if (targetIdx === -1) return '';
  let diff = targetIdx - todayIdx;
  if (diff <= 0) diff += 7;
  const target = new Date(today);
  target.setDate(today.getDate() + diff);
  return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
