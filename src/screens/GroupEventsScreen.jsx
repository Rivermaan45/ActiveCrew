import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../store';
import api from '../api';

export default function GroupEventsScreen() {
  const { user } = useStore();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    api.getGroupEvents().then(data => {
      setEvents(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleRSVP = async (eventId) => {
    if (!user) return;
    try {
      const updated = await api.rsvpGroupEvent(eventId, user.id);
      setEvents(prev => prev.map(e => e.id === eventId ? { ...updated, rsvpStatus: updated.rsvpStatus } : e));
    } catch (e) {
      console.error('RSVP failed:', e);
    }
  };

  const isGoing = (event) => event.attendees?.some(a => a.id === user?.id);

  if (loading) {
    return (
      <div className="h-full overflow-y-auto bg-gray-50">
        <div className="px-5 pt-14 pb-4">
          <h1 className="text-2xl font-extrabold text-gray-900">Group Events</h1>
        </div>
        <div className="px-5 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-200" />
              <div className="bg-white p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="px-5 pt-14 pb-2">
        <h1 className="text-2xl font-extrabold text-gray-900">Group Events</h1>
        <p className="text-gray-500 text-sm mt-0.5">Open events you can join — bring a friend!</p>
      </div>

      <div className="px-5 pb-28 space-y-4 mt-2">
        {events.map((event, idx) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
          >
            {/* Event image header */}
            <div className="relative h-36">
              <img src={event.image} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-active-500 text-white text-[10px] font-bold">{event.emoji} {event.sport}</span>
                  {event.tags?.includes('bring-a-friend') && (
                    <span className="px-2 py-0.5 rounded-full bg-crew-500 text-white text-[10px] font-bold">👯 Bring a Friend</span>
                  )}
                  {event.tags?.includes('double-date-friendly') && (
                    <span className="px-2 py-0.5 rounded-full bg-purple-500 text-white text-[10px] font-bold">💕 Double Date OK</span>
                  )}
                </div>
                <h3 className="text-white font-extrabold text-lg leading-tight">{event.title}</h3>
              </div>
            </div>

            {/* Event details */}
            <div className="p-4">
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <span>📅 {event.day}</span>
                <span>🕐 {event.timeStart}–{event.timeEnd}</span>
                <span>📍 {event.neighborhood}</span>
              </div>

              {/* Attendees */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex -space-x-2">
                  {event.attendees?.slice(0, 5).map(a => (
                    <img key={a.id} src={a.photo} alt="" className="w-7 h-7 rounded-full object-cover border-2 border-white" />
                  ))}
                </div>
                <span className="text-gray-500 text-xs">
                  {event.attendees?.length}/{event.maxAttendees} going
                </span>
                {event.host && (
                  <span className="text-gray-400 text-xs">· Hosted by {event.host.firstName}</span>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {event.tags?.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-medium">{tag}</span>
                ))}
              </div>

              {/* Expandable description */}
              <AnimatePresence>
                {expandedId === event.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-gray-600 text-sm mb-3">{event.description}</p>
                    <p className="text-gray-400 text-xs mb-3">📌 {event.location}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2">
                <button
                  onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-semibold"
                >
                  {expandedId === event.id ? 'Less' : 'Details'}
                </button>
                <button
                  onClick={() => handleRSVP(event.id)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    isGoing(event)
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-active-500 text-white shadow-lg shadow-active-500/20'
                  }`}
                >
                  {isGoing(event) ? '✓ Going!' : "I'm In ⚡"}
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
