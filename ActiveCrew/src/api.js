const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

const api = {
  // Auth
  loginDemo: () => request('/auth/demo', { method: 'POST' }),
  login: (email) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email }) }),

  // Users
  getUser: (id) => request(`/users/${id}`),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Sport Levels
  getSportLevels: () => request('/sport-levels'),
  getActivityImages: () => request('/activity-images'),

  // Sessions (session-first browsing)
  getSessions: (userId, sport, day) => {
    let q = `?userId=${userId}`;
    if (sport) q += `&sport=${encodeURIComponent(sport)}`;
    if (day) q += `&day=${encodeURIComponent(day)}`;
    return request(`/sessions${q}`);
  },
  getSession: (id) => request(`/sessions/${id}`),
  joinSession: (sessionId, userId) =>
    request(`/sessions/${sessionId}/join`, { method: 'POST', body: JSON.stringify({ userId }) }),
  leaveSession: (sessionId, userId) =>
    request(`/sessions/${sessionId}/leave`, { method: 'POST', body: JSON.stringify({ userId }) }),
  seedSessions: () => request('/sessions/seed', { method: 'POST' }),

  // Activity Slots
  getActivitySlots: (userId, sport, level) => {
    let q = `?userId=${userId}`;
    if (sport) q += `&sport=${encodeURIComponent(sport)}`;
    if (level) q += `&level=${level}`;
    return request(`/activity-slots${q}`);
  },

  // Weekly Selection
  submitWeeklySelection: (userId, sports, availability, radius) =>
    request('/weekly-selection', { method: 'POST', body: JSON.stringify({ userId, sports, availability, radius }) }),
  getWeeklySelection: (userId) => request(`/weekly-selection/${userId}`),

  // Swipes
  swipe: (userId, slotId, direction) =>
    request('/swipes', { method: 'POST', body: JSON.stringify({ userId, slotId, direction }) }),

  // Select Person from Pool
  selectPerson: (userId, slotId, targetUserId) =>
    request('/select-person', { method: 'POST', body: JSON.stringify({ userId, slotId, targetUserId }) }),

  // Match Candidates
  getMatchCandidates: (userId) => request(`/match-candidates/${userId}`),

  // Match Confirmations
  confirmMatch: (matchCandidateId, userId, confirmed) =>
    request('/match-confirmations', { method: 'POST', body: JSON.stringify({ matchCandidateId, userId, confirmed }) }),

  // Matches
  getMatches: (userId) => request(`/matches/${userId}`),

  // Plans
  proposePlan: (matchId, userId, timeSlot, place, note) =>
    request('/plans', { method: 'POST', body: JSON.stringify({ matchId, userId, timeSlot, place, note }) }),
  confirmPlan: (planId, userId) =>
    request(`/plans/${planId}/confirm`, { method: 'PUT', body: JSON.stringify({ userId }) }),

  // Messages
  getMessages: (matchId) => request(`/messages/${matchId}`),
  sendMessage: (matchId, userId, text, quickReply) =>
    request('/messages', { method: 'POST', body: JSON.stringify({ matchId, userId, text, quickReply }) }),

  // Ratings
  submitRating: (data) => request('/ratings', { method: 'POST', body: JSON.stringify(data) }),

  // Reports
  submitReport: (data) => request('/reports', { method: 'POST', body: JSON.stringify(data) }),

  // Notifications
  getNotifications: (userId) => request(`/notifications/${userId}`),

  // Streaks & Badges
  getStreaks: (userId) => request(`/streaks/${userId}`),

  // Top Pick
  getTopPick: (userId) => request(`/top-pick/${userId}`),

  // Activity Feed
  getFeed: (userId) => request(`/feed/${userId}`),

  // Group Events
  getGroupEvents: () => request('/group-events'),
  rsvpGroupEvent: (eventId, userId) =>
    request(`/group-events/${eventId}/rsvp`, { method: 'POST', body: JSON.stringify({ userId }) }),

  // Nearby Spots
  getNearbySpots: (neighborhood) => request(`/nearby-spots?neighborhood=${encodeURIComponent(neighborhood)}`),

  // Reset Demo
  resetDemo: () => request('/reset-demo', { method: 'POST' }),

  // Admin
  getStats: () => request('/admin/stats'),
};

export default api;
