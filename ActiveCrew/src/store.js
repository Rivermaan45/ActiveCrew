import { create } from 'zustand';
import api from './api';

const useStore = create((set, get) => ({
  // Auth
  user: null,
  token: null,
  isOnboarded: false,

  // Data
  sportLevels: {},
  activityImages: {},
  activitySlots: [],
  matchCandidates: [],
  matches: [],
  notifications: [],
  weeklySelection: null,
  peoplePool: [],

  // UI
  loading: false,
  activeTab: 'explore',
  currentSlot: null,
  currentMatchPreview: null,
  currentMatch: null,
  screen: null, // 'people-pool', 'match-preview', 'confirm-plan', 'chat', 'rating', 'profile-view'
  toasts: [],

  // Auth actions
  loginDemo: async () => {
    // Always reset demo so user goes through onboarding fresh each time
    try { await api.resetDemo(); } catch (e) {}
    const { user, token } = await api.loginDemo();
    const sportLevels = await api.getSportLevels();
    const activityImages = await api.getActivityImages();
    set({ user, token, sportLevels, activityImages, isOnboarded: false });
  },

  completeOnboarding: async (userData) => {
    const { user } = get();
    const updatedUser = await api.updateUser(user.id, userData);
    set({ user: updatedUser, isOnboarded: true });
    get().loadData();
  },

  // Data loading
  loadData: async () => {
    const { user } = get();
    if (!user) return;
    set({ loading: true });
    try {
      const [activitySlots, matchCandidates, matches, notifications] = await Promise.all([
        api.getActivitySlots(user.id),
        api.getMatchCandidates(user.id),
        api.getMatches(user.id),
        api.getNotifications(user.id),
      ]);
      set({ activitySlots, matchCandidates, matches, notifications, loading: false });
    } catch (e) {
      console.error('Load error:', e);
      set({ loading: false });
    }
  },

  // Weekly Selection
  submitWeeklySelection: async (sports, availability, radius) => {
    const { user } = get();
    const result = await api.submitWeeklySelection(user.id, sports, availability, radius);
    set({ weeklySelection: result.selection, activitySlots: result.matchingSlots });
    return result;
  },

  // Swipe on activity slot
  swipeSlot: async (slotId, direction) => {
    const { user, activitySlots } = get();
    const result = await api.swipe(user.id, slotId, direction);
    set({ activitySlots: activitySlots.map(s => s.id === slotId ? { ...s, alreadySwiped: true } : s) });

    if (direction === 'yes' && result.availableUsers?.length > 0) {
      set({ peoplePool: result.availableUsers, currentSlot: activitySlots.find(s => s.id === slotId), screen: 'people-pool' });
      return result.availableUsers;
    }
    return [];
  },

  // Select a person from pool
  selectPerson: async (slotId, targetUserId) => {
    const { user, currentSlot, peoplePool } = get();
    const otherUser = (peoplePool || []).find(p => p.id === targetUserId);
    const result = await api.selectPerson(user.id, slotId, targetUserId);
    const matchCandidates = await api.getMatchCandidates(user.id);
    const enriched = result.matchCandidate
      ? matchCandidates.find(mc => mc.id === result.matchCandidate.id)
      : null;
    const preview = enriched || (
      result.matchCandidate && otherUser && currentSlot
        ? { ...result.matchCandidate, otherUser, activitySlot: currentSlot }
        : null
    );
    set({
      matchCandidates,
      peoplePool: [],
      currentMatchPreview: preview,
      screen: preview ? 'match-preview' : null,
    });
    return result;
  },

  // Match preview
  confirmMatchPreview: async (matchCandidateId, confirmed) => {
    const { user, matchCandidates } = get();
    const candidate = matchCandidates.find(mc => mc.id === matchCandidateId);
    const otherUserId = candidate
      ? (candidate.user1Id === user.id ? candidate.user2Id : candidate.user1Id)
      : null;

    let result = await api.confirmMatch(matchCandidateId, user.id, confirmed);
    set({ matchCandidates: matchCandidates.filter(mc => mc.id !== matchCandidateId) });

    // Demo: other person confirms after a delay
    if (confirmed && result.status === 'waiting_for_other' && user.id === 'demo-user' && otherUserId) {
      setTimeout(async () => {
        try {
          const r = await api.confirmMatch(matchCandidateId, otherUserId, true);
          if (r.match) {
            const matches = await api.getMatches(user.id);
            set({ matches });
            const other = matches.find(m => m.id === r.match.id)?.otherUser;
            get().addToast({
              type: 'match',
              icon: '⚡',
              title: 'Match confirmed!',
              body: `${other?.firstName || 'Someone'} wants to do this with you too`,
              action: 'go-matches',
              matchId: r.match.id,
            });
          }
        } catch (e) { console.error('Demo delayed confirm:', e); }
      }, 2000 + Math.random() * 3000);
    }

    if (result.match) {
      const matches = await api.getMatches(user.id);
      set({ matches });
    }
    return result;
  },

  // Plan scheduling
  proposePlan: async (matchId, timeSlot, place, note) => {
    const { user } = get();
    const plan = await api.proposePlan(matchId, user.id, timeSlot, place, note);

    // Demo: other person accepts plan after a delay
    if (user.id === 'demo-user') {
      const match = get().matches.find(m => m.id === matchId);
      const otherUserId = match?.otherUser?.id;
      if (otherUserId) {
        setTimeout(async () => {
          try {
            await api.confirmPlan(plan.id, otherUserId);
            const matches = await api.getMatches(user.id);
            set({ matches });
            // Also update currentMatch if viewing this match
            const cm = get().currentMatch;
            if (cm?.id === matchId) {
              const updated = matches.find(m => m.id === matchId);
              if (updated) set({ currentMatch: updated });
            }
            const otherName = matches.find(m => m.id === matchId)?.otherUser?.firstName;
            get().addToast({
              type: 'plan',
              icon: '✅',
              title: 'Plan confirmed!',
              body: `${otherName || 'Your partner'} confirmed the plan. Chat is now open!`,
              action: 'go-chat',
              matchId,
            });
          } catch (e) {}
        }, 3000 + Math.random() * 5000);
      }
    }
    const matches = await api.getMatches(user.id);
    set({ matches });
  },

  confirmPlan: async (planId) => {
    const { user } = get();
    await api.confirmPlan(planId, user.id);
    const matches = await api.getMatches(user.id);
    set({ matches });
  },

  // Messaging
  sendMessage: async (matchId, text, quickReply) => {
    const { user } = get();
    await api.sendMessage(matchId, user.id, text, quickReply);
    const matches = await api.getMatches(user.id);
    // Keep currentMatch in sync so chat UI updates
    const updatedMatch = matches.find(m => m.id === matchId);
    set({ matches, currentMatch: updatedMatch || get().currentMatch });
  },

  // Rating
  submitRating: async (data) => {
    await api.submitRating(data);
    const { user } = get();
    const matches = await api.getMatches(user.id);
    set({ matches });
  },

  // Report
  submitReport: async (data) => { await api.submitReport(data); },

  // Toasts
  addToast: (toast) => {
    const id = Date.now() + Math.random();
    set({ toasts: [...get().toasts, { id, duration: 4500, ...toast }] });
  },
  removeToast: (id) => set({ toasts: get().toasts.filter(t => t.id !== id) }),

  // Reset Demo
  resetDemo: async () => {
    const result = await api.resetDemo();
    set({
      user: result.user,
      isOnboarded: false,
      activitySlots: [],
      matchCandidates: [],
      matches: [],
      notifications: [],
      weeklySelection: null,
      peoplePool: [],
      currentSlot: null,
      currentMatchPreview: null,
      currentMatch: null,
      screen: null,
      activeTab: 'explore',
      toasts: [],
    });
  },

  // Navigation
  setActiveTab: (tab) => set({ activeTab: tab, screen: null }),
  setScreen: (screen) => set({ screen }),
  setCurrentSlot: (slot) => set({ currentSlot: slot }),
  setCurrentMatchPreview: (mc) => set({ currentMatchPreview: mc }),
  setCurrentMatch: (m) => set({ currentMatch: m }),
}));

export default useStore;
