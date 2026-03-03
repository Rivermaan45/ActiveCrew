import React from 'react';
import useStore from '../store';
import ExploreScreen from './ExploreScreen';
import MatchesScreen from './MatchesScreen';
import ProfileScreen from './ProfileScreen';
import WeeklyPlanScreen from './WeeklyPlanScreen';
import MyWeekScreen from './MyWeekScreen';
import FeedScreen from './FeedScreen';
import PeoplePool from '../components/PeoplePool';
import MatchPreview from '../components/MatchPreview';
import ConfirmPlan from '../components/ConfirmPlan';
import ChatView from '../components/ChatView';
import RatingModal from '../components/RatingModal';
import ProfileView from '../components/ProfileView';

const TABS = [
  { id: 'explore', label: 'Explore', icon: '🔍' },
  { id: 'weekly', label: 'My Week', icon: '🗓️' },
  { id: 'matches', label: 'Matches', icon: '⚡' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

export default function TabShell() {
  const { activeTab, setActiveTab, screen, matches, matchCandidates } = useStore();

  const pendingCount = matches.filter(m => m.status === 'pending_plan' || m.status === 'plan_confirmed').length
    + matchCandidates.length;

  // Overlay screens
  if (screen === 'people-pool') return <PeoplePool />;
  if (screen === 'match-preview') return <MatchPreview />;
  if (screen === 'confirm-plan') return <ConfirmPlan />;
  if (screen === 'chat') return <ChatView />;
  if (screen === 'rating') return <RatingModal />;
  if (screen === 'profile-view') return <ProfileView />;

  return (
    <div className="absolute inset-0 flex flex-col bg-gray-50">
      <div className="flex-1 overflow-hidden">
        {activeTab === 'explore' && <ExploreScreen />}
        {activeTab === 'weekly' && <MyWeekScreen />}
        {activeTab === 'feed' && <FeedScreen />}
        {activeTab === 'matches' && <MatchesScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </div>

      {/* Tab Bar */}
      <div className="flex border-t border-gray-200 bg-white safe-bottom">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 pt-2.5 relative transition-colors ${activeTab === tab.id ? 'text-active-600' : 'text-gray-400'}`}
          >
            <span className="text-[16px]">{tab.icon}</span>
            <span className="text-[8px] font-semibold">{tab.label}</span>
            {tab.id === 'matches' && pendingCount > 0 && (
              <span className="absolute top-1.5 right-1/2 translate-x-4 w-4 h-4 bg-active-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
