import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useStore from '../store';
import api from '../api';

export default function FeedScreen() {
  const { user } = useStore();
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kudosGiven, setKudosGiven] = useState(new Set());

  useEffect(() => {
    if (!user) return;
    api.getFeed(user.id).then(data => {
      setFeed(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user?.id]);

  const handleKudos = (itemId) => {
    setKudosGiven(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
    setFeed(prev => prev.map(f =>
      f.id === itemId
        ? { ...f, kudos: f.kudos + (kudosGiven.has(itemId) ? -1 : 1) }
        : f
    ));
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="px-5 pt-14 pb-4">
        <h1 className="text-2xl font-extrabold text-gray-900">Activity</h1>
        <p className="text-gray-500 text-sm mt-0.5">See what your crew is up to</p>
      </div>

      {loading ? (
        <div className="px-5 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-2 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-16 bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : feed.length === 0 ? (
        <div className="text-center py-20 px-8">
          <div className="text-5xl mb-4">📡</div>
          <h2 className="text-xl font-bold text-gray-800">No activity yet</h2>
          <p className="text-gray-500 mt-2 text-sm">Start making plans and your crew's activity will show up here!</p>
        </div>
      ) : (
        <div className="px-5 space-y-3 pb-28">
          {feed.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              {item.type === 'plan_confirmed' ? (
                <PlanFeedItem item={item} timeAgo={timeAgo} kudosGiven={kudosGiven} onKudos={handleKudos} />
              ) : (
                <CommunityFeedItem item={item} timeAgo={timeAgo} kudosGiven={kudosGiven} onKudos={handleKudos} />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlanFeedItem({ item, timeAgo, kudosGiven, onKudos }) {
  const hasKudos = kudosGiven.has(item.id);
  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex -space-x-2">
          {item.users?.map(u => (
            <img key={u.id} src={u.photo} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white" />
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">
            {item.users?.map(u => u.firstName).join(' & ')}
          </p>
          <p className="text-gray-400 text-xs">{timeAgo(item.createdAt)}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-3 mb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{item.emoji}</span>
          <span className="font-bold text-gray-800 text-sm">{item.sport} — {item.title}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>📍 {item.location}</span>
          <span>📅 {item.day} {item.time}</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={() => onKudos(item.id)}
          className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${hasKudos ? 'text-active-500' : 'text-gray-400'}`}>
          <span className={`text-lg transition-transform ${hasKudos ? 'scale-110' : ''}`}>👏</span>
          <span>{item.kudos + (hasKudos ? 1 : 0)}</span>
        </button>
        <span className="text-gray-300 text-xs">Kudos</span>
      </div>
    </div>
  );
}

function CommunityFeedItem({ item, timeAgo, kudosGiven, onKudos }) {
  const hasKudos = kudosGiven.has(item.id);
  return (
    <div className="p-4">
      <div className="flex items-center gap-3">
        <img src={item.user?.photo} alt="" className="w-9 h-9 rounded-full object-cover" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800">
            <span className="font-bold">{item.user?.firstName}</span>{' '}
            <span className="text-gray-500">{item.text}</span>
          </p>
          <p className="text-gray-400 text-xs mt-0.5">{timeAgo(item.createdAt)}</p>
        </div>
        <span className="text-2xl">{item.icon}</span>
      </div>
      <div className="flex items-center gap-4 mt-2 ml-12">
        <button onClick={() => onKudos(item.id)}
          className={`flex items-center gap-1 text-xs font-semibold transition-colors ${hasKudos ? 'text-active-500' : 'text-gray-400'}`}>
          👏 {item.kudos + (hasKudos ? 1 : 0)}
        </button>
      </div>
    </div>
  );
}
