import React, { useEffect, useState } from 'react';
import useStore from './store';
import IPhoneFrame from './components/iPhoneFrame';
import LoginScreen from './screens/LoginScreen';
import Onboarding from './screens/Onboarding';
import TabShell from './screens/TabShell';
import SplashScreen from './components/SplashScreen';
import ToastNotification from './components/ToastNotification';

function AppContent() {
  const { user, isOnboarded, loginDemo } = useStore();
  const [phase, setPhase] = useState('splash'); // splash, login, onboarding, app
  const [error, setError] = useState(null);

  const handleLogin = () => {
    setPhase('splash');
    loginDemo()
      .then(() => {
        setTimeout(() => {
          const state = useStore.getState();
          setPhase(state.isOnboarded ? 'app' : 'onboarding');
        }, 800);
      })
      .catch(e => setError(e.message));
  };

  useEffect(() => {
    // Show splash briefly, then login screen
    setTimeout(() => setPhase('login'), 1500);
  }, []);

  // Re-check onboarded state when it changes
  useEffect(() => {
    if (isOnboarded && phase === 'onboarding') {
      setPhase('app');
    }
  }, [isOnboarded]);

  if (error) return (
    <div className="absolute inset-0 bg-gray-950 flex flex-col items-center justify-center p-8">
      <div className="text-4xl mb-4">⚠️</div>
      <h1 className="text-xl font-bold text-white mb-2">Connection Error</h1>
      <p className="text-gray-400 text-sm text-center mb-4">Make sure the server is running on port 3001.</p>
      <code className="text-red-400 text-xs bg-gray-800 p-3 rounded-xl">{error}</code>
      <button onClick={() => { setError(null); setPhase('login'); }} className="mt-6 px-6 py-3 rounded-xl bg-active-500 text-white font-bold">Retry</button>
    </div>
  );

  if (phase === 'splash') return <SplashScreen />;
  if (phase === 'login') return <LoginScreen onLogin={handleLogin} />;
  if (phase === 'onboarding') return <Onboarding />;
  return <>
    <ToastNotification />
    <TabShell />
  </>;
}

export default function App() {
  return (
    <IPhoneFrame>
      <AppContent />
    </IPhoneFrame>
  );
}
