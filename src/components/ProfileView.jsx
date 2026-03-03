import React from 'react';
import useStore from '../store';

export default function ProfileView() {
  const { currentMatch, setScreen, sportLevels } = useStore();
  const person = currentMatch?.otherUser;
  const slot = currentMatch?.activitySlot;

  if (!person) return null;

  // Back goes to chat if a plan is confirmed (meaning the user came from chat)
  const hasPlan = currentMatch?.plan?.status === 'confirmed';
  const handleBack = () => setScreen(hasPlan ? 'chat' : null);

  const showUpDisplay = person.totalPlans > 0
    ? `${Math.round((person.showUpRate ?? 1) * 100)}%`
    : '—';

  return (
    <div className="absolute inset-0 bg-gray-50 flex flex-col z-40">
      <div className="px-5 pt-14 pb-3 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <button onClick={handleBack} className="text-gray-500 text-sm font-semibold">← Back</button>
          <h2 className="text-lg font-bold text-gray-900">{person.firstName}'s Profile</h2>
          <div className="w-12" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Photo grid */}
        {person.photos?.length > 1 ? (
          <div className="grid grid-cols-2 gap-2">
            <img src={person.photos[0]} alt="" className="col-span-2 w-full aspect-[3/4] rounded-3xl object-cover shadow-lg" />
            {person.photos.slice(1).map((p, i) => (
              <img key={i} src={p} alt="" className="w-full aspect-square rounded-2xl object-cover" />
            ))}
          </div>
        ) : (
          <img src={person.photos?.[0]} alt="" className="w-full aspect-[3/4] rounded-3xl object-cover shadow-lg" />
        )}

        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{person.firstName} {person.lastName}, {person.age}</h1>
          <p className="text-gray-500 text-sm mt-1">{person.bio}</p>
        </div>

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
          {person.gender && (
            <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-medium capitalize">👤 {person.gender}</span>
          )}
        </div>

        {/* Social Links */}
        {person.socials && Object.keys(person.socials).length > 0 && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Socials</p>
            <div className="flex flex-wrap gap-2">
              {person.socials.instagram && (
                <span className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-bold">
                  📸 @{person.socials.instagram}
                </span>
              )}
              {person.socials.spotify && (
                <span className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                  🎵 {person.socials.spotify}
                </span>
              )}
              {person.socials.strava && (
                <span className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                  🏃 {person.socials.strava}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Interests */}
        {person.interests?.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Interests</p>
            <div className="flex flex-wrap gap-1.5">
              {person.interests.map(i => (
                <span key={i} className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">{i}</span>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">Sports</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(person.sports || {}).map(([s, lv]) => {
              const levelLabel = sportLevels[s]?.levels?.find(l => l.id === lv)?.label || lv;
              return (
                <span key={s} className="px-3 py-1.5 rounded-full bg-active-50 text-active-700 text-xs font-semibold">
                  {s} · {levelLabel}
                </span>
              );
            })}
          </div>
        </div>

        {person.prompts?.filter(p => p.answer).map((p, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-active-600 text-xs font-bold mb-1">{p.question}</p>
            <p className="text-gray-800 text-sm">{p.answer}</p>
          </div>
        ))}

        <div className="flex gap-3">
          <div className="flex-1 bg-white rounded-xl p-4 text-center border border-gray-100">
            <p className="text-2xl font-bold text-gray-900">{person.totalPlans}</p>
            <p className="text-[10px] text-gray-500 uppercase font-semibold">Plans Done</p>
          </div>
          <div className="flex-1 bg-white rounded-xl p-4 text-center border border-gray-100">
            <p className="text-2xl font-bold text-active-600">{showUpDisplay}</p>
            <p className="text-[10px] text-gray-500 uppercase font-semibold">Show-up Rate</p>
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
