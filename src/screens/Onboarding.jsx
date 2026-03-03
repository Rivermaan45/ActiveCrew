import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store';

const ALL_SPORTS = [
  { name: 'Running', emoji: '🏃', desc: 'Join run clubs, find pace partners, train for races' },
  { name: 'Tennis', emoji: '🎾', desc: 'Singles, doubles, find hitting partners at your level' },
  { name: 'Padel', emoji: '🏓', desc: 'Always doubles — find your crew of 4' },
  { name: 'Swimming', emoji: '🏊', desc: 'Lap swim, open water, triathlon training' },
  { name: 'Bouldering', emoji: '🧗', desc: 'Indoor bouldering, project sessions, gym crews' },
  { name: 'Rock Climbing', emoji: '🧗', desc: 'Top rope, lead, outdoor trips' },
  { name: 'Cycling', emoji: '🚴', desc: 'Road rides, group rides, race training' },
  { name: 'Gym', emoji: '🏋️', desc: 'Lifting, CrossFit, Hyrox, partner workouts' },
  { name: 'Yoga', emoji: '🧘', desc: 'Vinyasa, power yoga, park sessions' },
  { name: 'Basketball', emoji: '🏀', desc: 'Pickup games, 5v5, shooting around' },
  { name: 'Soccer', emoji: '⚽', desc: 'Pickup soccer, indoor, outdoor leagues' },
  { name: 'Golf', emoji: '⛳', desc: 'Driving range, 9 holes, weekend rounds' },
  { name: 'Surfing', emoji: '🏄', desc: 'Rockaway sessions, board rentals, dawn patrol' },
  { name: 'Hiking', emoji: '🥾', desc: 'Day hikes, scrambles, Bear Mountain, Breakneck' },
  { name: 'Camping', emoji: '🏕️', desc: 'Car camping, backpacking, overnight trips' },
  { name: 'Coffee', emoji: '☕', desc: 'Meet over a good cup — low-key social' },
  { name: 'Dinner', emoji: '🍽️', desc: 'Try new spots, group dinners, food adventures' },
  { name: 'Sauna', emoji: '🧖', desc: 'Sauna, cold plunge, recovery sessions' },
];

const PROMPT_OPTIONS = [
  { id: 'two_truths', question: 'Two truths and a lie…' },
  { id: 'typical_sunday', question: 'Typical Sunday…' },
  { id: 'life_goal', question: 'A life goal of mine…' },
  { id: 'fav_movie_line', question: 'My favorite line from a movie…' },
  { id: 'pronounce_name', question: 'How to pronounce my name…' },
  { id: 'competitive', question: 'I get competitive about…' },
  { id: 'ideal_weekend', question: 'My ideal weekend looks like…' },
  { id: 'want_to_try', question: 'The activity I want to try but haven\'t…' },
  { id: 'go_to_spot', question: 'My go-to spot in the city…' },
  { id: 'surprised', question: 'One thing people are surprised to learn about me…' },
  { id: 'best_trip', question: 'The best trip I\'ve ever taken…' },
  { id: 'crew_vibe', question: 'I want a crew that…' },
];

const RUNNING_DETAILS = {
  trainingFor: [
    { id: 'none', label: 'Just running for fun' },
    { id: '5k', label: '5K' }, { id: '10k', label: '10K' },
    { id: 'half', label: 'Half Marathon' }, { id: 'marathon', label: 'Marathon' },
    { id: 'ultra', label: 'Ultra Marathon' },
  ],
  pace: [
    { id: 'chill', label: 'Chill / conversational' },
    { id: '11_plus', label: '11:00+/mi' }, { id: '10', label: '10:00/mi' },
    { id: '9', label: '9:00/mi' }, { id: '8', label: '8:00/mi' },
    { id: '7', label: '7:00/mi' }, { id: 'sub7', label: 'Sub-7:00/mi' },
  ],
  frequency: [
    { id: '1_2', label: '1-2x/week' }, { id: '3_4', label: '3-4x/week' },
    { id: '5_6', label: '5-6x/week' }, { id: 'daily', label: 'Every day' },
  ],
  style: [
    { id: 'social', label: 'Social runs — love chatting' },
    { id: 'training', label: 'Structured training' },
    { id: 'both', label: 'Both depending on the day' },
  ],
};

const TENNIS_DETAILS = {
  experience: [
    { id: 'beginner', label: 'Beginner (< 1 year)' },
    { id: 'intermediate', label: 'Intermediate (1-3 years)' },
    { id: 'advanced', label: 'Advanced (3-5 years)' },
    { id: 'competitive', label: 'Competitive (5-10 years)' },
    { id: 'expro', label: 'Ex-competitive / Ex-pro' },
  ],
  playStyle: [
    { id: 'singles', label: 'Singles' },
    { id: 'doubles', label: 'Doubles' },
    { id: 'both', label: 'Both' },
  ],
  frequency: [
    { id: '1', label: 'Once a week' }, { id: '2_3', label: '2-3x/week' },
    { id: '4_plus', label: '4+/week' },
  ],
};

const PADEL_DETAILS = {
  experience: [
    { id: 'beginner', label: 'Beginner (< 1 year)' },
    { id: 'intermediate', label: 'Intermediate (1-3 years)' },
    { id: 'advanced', label: 'Advanced (3-5 years)' },
    { id: 'competitive', label: 'Competitive (5+ years)' },
  ],
  frequency: [
    { id: '1', label: 'Once a week' }, { id: '2_3', label: '2-3x/week' },
    { id: '4_plus', label: '4+/week' },
  ],
};

const TOTAL_STEPS = 6;

export default function Onboarding() {
  const { completeOnboarding, sportLevels, user } = useStore();
  const [step, setStep] = useState(0);

  // Step 0: Profile basics
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [agePreference, setAgePreference] = useState('no_preference');

  // Step 1: Photos (6 slots)
  const [photos, setPhotos] = useState([null, null, null, null, null, null]);

  // Step 2: About you — job + social prompts (pick 2)
  const [jobTitle, setJobTitle] = useState('');
  const [selectedPrompts, setSelectedPrompts] = useState([]);
  const [promptAnswers, setPromptAnswers] = useState({});

  // Step 3: Sport selection
  const [selectedSports, setSelectedSports] = useState([]);
  const [sportSearch, setSportSearch] = useState('');

  // Step 4: Sport-specific details
  const [sportDetails, setSportDetails] = useState({});
  const [currentSportIdx, setCurrentSportIdx] = useState(0);

  // Step 5: Verification
  const [phone, setPhone] = useState('');

  const toggleSport = (name) => {
    setSelectedSports(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    );
  };

  const togglePrompt = (id) => {
    setSelectedPrompts(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const setSportDetail = (sport, key, value) => {
    setSportDetails(prev => ({
      ...prev,
      [sport]: { ...(prev[sport] || {}), [key]: value },
    }));
  };

  const handleFinish = () => {
    const sports = {};
    selectedSports.forEach(s => {
      const details = sportDetails[s] || {};
      if (s === 'Running') sports[s] = details.pace || 'chill';
      else if (s === 'Tennis') sports[s] = details.experience || 'intermediate';
      else if (s === 'Padel') sports[s] = details.experience || 'intermediate';
      else sports[s] = 'recreational';
    });

    const prompts = selectedPrompts.map(id => {
      const q = PROMPT_OPTIONS.find(p => p.id === id);
      return { question: q?.question || '', answer: promptAnswers[id] || '' };
    }).filter(p => p.answer);

    completeOnboarding({
      firstName: firstName || 'You',
      age: parseInt(age) || 28,
      gender,
      neighborhood,
      agePreference,
      jobTitle,
      photos: photos.filter(Boolean),
      prompts,
      sports,
      sportDetails,
      phone,
      verified: phone.length >= 10,
    });
  };

  const currentSport = selectedSports[currentSportIdx];

  const canContinue = () => {
    switch (step) {
      case 0: return firstName.length > 0;
      case 1: return true;
      case 2: return true;
      case 3: return selectedSports.length > 0;
      case 4: return true;
      case 5: return true;
      default: return true;
    }
  };

  return (
    <div className="absolute inset-0 bg-gray-950 text-white flex flex-col">
      {/* Progress bar */}
      <div className="px-6 pt-14 pb-2">
        <div className="flex gap-1">
          {[...Array(TOTAL_STEPS)].map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-active-500' : 'bg-gray-700'}`} />
          ))}
        </div>
        <p className="text-gray-600 text-[10px] text-right mt-1">{step + 1} of {TOTAL_STEPS}</p>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 0: Profile Basics */}
        {step === 0 && (
          <motion.div key="s0" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex-1 px-6 pt-4 overflow-y-auto pb-32">
            <h1 className="text-2xl font-bold mb-1">Create your profile</h1>
            <p className="text-gray-400 text-sm mb-5">The basics — people see this when you match.</p>

            <div className="space-y-4">
              <Field label="First Name">
                <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Your first name" className="input-field" />
              </Field>
              <div className="flex gap-3">
                <Field label="Age" className="flex-1">
                  <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="28" className="input-field" />
                </Field>
                <Field label="Neighborhood" className="flex-1">
                  <input value={neighborhood} onChange={e => setNeighborhood(e.target.value)} placeholder="West Village" className="input-field" />
                </Field>
              </div>
              <Field label="Gender">
                <div className="flex gap-2 mt-1">
                  {['Male', 'Female', 'Non-binary'].map(g => (
                    <button key={g} onClick={() => setGender(g.toLowerCase())}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${gender === g.toLowerCase() ? 'bg-active-500 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Play with people who are…">
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[
                    { id: 'younger', label: 'Younger' },
                    { id: 'older', label: 'Older' },
                    { id: 'same_age', label: 'Same age' },
                    { id: 'no_preference', label: 'No preference' },
                  ].map(opt => (
                    <button key={opt.id} onClick={() => setAgePreference(opt.id)}
                      className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${agePreference === opt.id ? 'bg-active-500 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          </motion.div>
        )}

        {/* STEP 1: Photos (6 slots) */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex-1 px-6 pt-4 overflow-y-auto pb-32">
            <h1 className="text-2xl font-bold mb-1">Add your photos</h1>
            <p className="text-gray-400 text-sm mb-5">Action shots over selfies. Show us you doing your thing.</p>

            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo, idx) => (
                <button key={idx}
                  onClick={() => {
                    const demoPhotos = user?.photos || ['/personas/persona5.png'];
                    const newPhotos = [...photos];
                    newPhotos[idx] = newPhotos[idx] ? null : demoPhotos[0];
                    setPhotos(newPhotos);
                  }}
                  className={`aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${photo ? 'border-active-500' : 'border-gray-700 bg-gray-800'}`}
                >
                  {photo ? (
                    <div className="relative w-full h-full">
                      <img src={photo} alt="" className="w-full h-full object-cover" />
                      <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">✕</div>
                      {idx === 0 && <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-full bg-active-500 text-white text-[9px] font-bold">MAIN</div>}
                    </div>
                  ) : (
                    <>
                      <span className="text-2xl text-gray-500">+</span>
                      <span className="text-[10px] text-gray-500 mt-1">{idx === 0 ? 'Main' : `Photo ${idx + 1}`}</span>
                    </>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* STEP 2: About You — Job + Social Prompts (pick 2) */}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex-1 px-6 pt-4 overflow-y-auto pb-32">
            <h1 className="text-2xl font-bold mb-1">About you</h1>
            <p className="text-gray-400 text-sm mb-5">What you do + pick 2 prompts to answer.</p>

            <div className="space-y-4">
              <Field label="What do you do?">
                <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Product Designer at..." className="input-field" />
              </Field>

              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mt-4">Pick 2 prompts to answer</p>

              {selectedPrompts.map(promptId => {
                const prompt = PROMPT_OPTIONS.find(p => p.id === promptId);
                return (
                  <div key={promptId} className="bg-gray-800 rounded-2xl p-4 border border-active-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-active-400 text-sm font-semibold">{prompt?.question}</p>
                      <button onClick={() => {
                        setSelectedPrompts(prev => prev.filter(x => x !== promptId));
                        setPromptAnswers(prev => { const n = {...prev}; delete n[promptId]; return n; });
                      }} className="text-gray-500 text-xs">✕</button>
                    </div>
                    <textarea
                      value={promptAnswers[promptId] || ''}
                      onChange={e => setPromptAnswers(prev => ({ ...prev, [promptId]: e.target.value }))}
                      placeholder="Your answer..."
                      rows={2}
                      className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none text-sm"
                    />
                  </div>
                );
              })}

              {selectedPrompts.length < 2 && (
                <div className="space-y-2">
                  {PROMPT_OPTIONS.filter(p => !selectedPrompts.includes(p.id)).map(p => (
                    <button key={p.id} onClick={() => togglePrompt(p.id)}
                      className="w-full text-left p-3 rounded-xl border border-gray-700 bg-gray-800 text-gray-300 text-sm font-medium hover:border-active-500/50 transition-colors">
                      {p.question}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 3: Sport Selection — searchable + quick picks */}
        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex-1 px-6 pt-4 overflow-y-auto pb-32">
            <h1 className="text-2xl font-bold mb-1">Pick your sports</h1>
            <p className="text-gray-400 text-sm mb-3">Select what you play. You'll set your level next.</p>

            {/* Selected chips */}
            {selectedSports.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedSports.map(name => {
                  const s = ALL_SPORTS.find(x => x.name === name);
                  return (
                    <button key={name} onClick={() => toggleSport(name)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-active-500 text-white text-sm font-semibold">
                      {s?.emoji} {name} <span className="ml-1 opacity-70">✕</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Search bar */}
            <input
              type="text"
              value={sportSearch}
              onChange={e => setSportSearch(e.target.value)}
              placeholder="Search sports..."
              className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm mb-4 focus:outline-none focus:border-active-500"
            />

            {/* Quick-pick emoji row (top 6) */}
            {!sportSearch && (
              <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
                {ALL_SPORTS.slice(0, 6).map(s => {
                  const selected = selectedSports.includes(s.name);
                  return (
                    <button key={s.name} onClick={() => toggleSport(s.name)}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border-2 min-w-[64px] transition-all ${selected ? 'border-active-500 bg-active-500/10' : 'border-gray-700 bg-gray-800'}`}>
                      <span className="text-2xl">{s.emoji}</span>
                      <span className={`text-[10px] font-semibold ${selected ? 'text-active-400' : 'text-gray-400'}`}>{s.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Filtered list */}
            <div className="space-y-2">
              {ALL_SPORTS
                .filter(s => !sportSearch || s.name.toLowerCase().includes(sportSearch.toLowerCase()))
                .map(s => {
                  const selected = selectedSports.includes(s.name);
                  return (
                    <button key={s.name} onClick={() => toggleSport(s.name)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left ${selected ? 'border-active-500 bg-active-500/10' : 'border-gray-700 bg-gray-800'}`}>
                      <span className="text-2xl">{s.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm ${selected ? 'text-active-400' : 'text-white'}`}>{s.name}</p>
                        <p className="text-gray-400 text-xs mt-0.5 truncate">{s.desc}</p>
                      </div>
                      {selected && <span className="text-active-500 text-lg">✓</span>}
                    </button>
                  );
                })}
              {sportSearch && ALL_SPORTS.filter(s => s.name.toLowerCase().includes(sportSearch.toLowerCase())).length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No sports match "{sportSearch}"</p>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 4: Sport-Specific Details */}
        {step === 4 && currentSport && (
          <motion.div key={`s4-${currentSportIdx}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex-1 px-6 pt-4 overflow-y-auto pb-32">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-3xl">{ALL_SPORTS.find(s => s.name === currentSport)?.emoji}</span>
              <h1 className="text-2xl font-bold">{currentSport}</h1>
            </div>
            <p className="text-gray-400 text-sm mb-5">
              Tell us about your {currentSport.toLowerCase()} ({currentSportIdx + 1}/{selectedSports.length})
            </p>

            {/* Running Details */}
            {currentSport === 'Running' && (
              <div className="space-y-5">
                <DetailSection title="What are you training for?" options={RUNNING_DETAILS.trainingFor}
                  value={sportDetails.Running?.trainingFor} onChange={v => setSportDetail('Running', 'trainingFor', v)} />
                <DetailSection title="Easy / Z2 pace" options={RUNNING_DETAILS.pace}
                  value={sportDetails.Running?.pace} onChange={v => setSportDetail('Running', 'pace', v)} />
                <DetailSection title="How often do you run?" options={RUNNING_DETAILS.frequency}
                  value={sportDetails.Running?.frequency} onChange={v => setSportDetail('Running', 'frequency', v)} />
                <DetailSection title="Running style" options={RUNNING_DETAILS.style}
                  value={sportDetails.Running?.style} onChange={v => setSportDetail('Running', 'style', v)} />
              </div>
            )}

            {/* Tennis Details */}
            {currentSport === 'Tennis' && (
              <div className="space-y-5">
                <DetailSection title="Experience level" options={TENNIS_DETAILS.experience}
                  value={sportDetails.Tennis?.experience} onChange={v => setSportDetail('Tennis', 'experience', v)} />
                <DetailSection title="Play style" options={TENNIS_DETAILS.playStyle}
                  value={sportDetails.Tennis?.playStyle} onChange={v => setSportDetail('Tennis', 'playStyle', v)} />
                <DetailSection title="How often do you play?" options={TENNIS_DETAILS.frequency}
                  value={sportDetails.Tennis?.frequency} onChange={v => setSportDetail('Tennis', 'frequency', v)} />
              </div>
            )}

            {/* Padel Details */}
            {currentSport === 'Padel' && (
              <div className="space-y-5">
                <DetailSection title="Experience level" options={PADEL_DETAILS.experience}
                  value={sportDetails.Padel?.experience} onChange={v => setSportDetail('Padel', 'experience', v)} />
                <DetailSection title="How often do you play?" options={PADEL_DETAILS.frequency}
                  value={sportDetails.Padel?.frequency} onChange={v => setSportDetail('Padel', 'frequency', v)} />
              </div>
            )}
          </motion.div>
        )}

        {/* STEP 5: Verification */}
        {step === 5 && (
          <motion.div key="s5" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="flex-1 px-6 pt-4 overflow-y-auto pb-32">
            <h1 className="text-2xl font-bold mb-1">Verify your account</h1>
            <p className="text-gray-400 text-sm mb-5">Keeps the community safe and real.</p>

            <div className="space-y-4">
              <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <p className="text-white font-semibold text-sm">Phone Verification</p>
                    <p className="text-gray-400 text-xs">We'll text you a code</p>
                  </div>
                </div>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000" className="input-field" />
                {phone.length >= 10 && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-green-500 text-sm">✓</span>
                    <span className="text-green-400 text-xs">Phone verified (demo)</span>
                  </div>
                )}
              </div>

              <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔗</span>
                  <div>
                    <p className="text-white font-semibold text-sm">Connect Instagram (optional)</p>
                    <p className="text-gray-400 text-xs">Builds trust with other members</p>
                  </div>
                </div>
                <button className="w-full mt-3 py-2.5 rounded-xl bg-gray-700 text-gray-300 text-xs font-semibold border border-gray-600">
                  Connect Instagram
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom buttons */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-gray-950 via-gray-950/95 to-transparent pt-12">
        <div className="flex gap-3">
          {step > 0 && (
            <button onClick={() => {
              if (step === 4 && currentSportIdx > 0) {
                setCurrentSportIdx(currentSportIdx - 1);
              } else {
                setStep(step - 1);
              }
            }} className="px-6 py-3.5 rounded-xl bg-gray-800 text-gray-300 font-semibold">
              Back
            </button>
          )}
          <button
            onClick={() => {
              if (step === 3 && selectedSports.length === 0) return;
              if (step === 4) {
                if (currentSportIdx < selectedSports.length - 1) {
                  setCurrentSportIdx(currentSportIdx + 1);
                  return;
                }
                setStep(step + 1);
                return;
              }
              if (step === 5) {
                handleFinish();
                return;
              }
              setStep(step + 1);
            }}
            disabled={!canContinue()}
            className="flex-1 py-3.5 rounded-xl bg-active-500 text-white font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {step === 5 ? "Let's Go ⚡" : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = '' }) {
  return (
    <div className={className}>
      <label className="text-xs text-gray-400 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function DetailSection({ title, options, value, onChange }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt.id} onClick={() => onChange(opt.id)}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${value === opt.id ? 'bg-active-500 text-white' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
