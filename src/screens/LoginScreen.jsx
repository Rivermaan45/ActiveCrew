import React from 'react';
import { motion } from 'framer-motion';

export default function LoginScreen({ onLogin }) {
  return (
    <div className="absolute inset-0 bg-gray-950 flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="text-6xl mb-3">⚡</div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">ActiveCrew</h1>
          <p className="text-gray-400 text-sm mt-2 leading-relaxed">
            Find Your People. Do Your Thing.
          </p>
        </motion.div>
      </div>

      {/* Auth buttons */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="px-6 pb-12 space-y-3"
      >
        {/* Apple */}
        <button onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-white text-black font-semibold text-base active:scale-[0.98] transition-transform"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M14.94 5.19A4.38 4.38 0 0 0 11.58 3c-1.73 0-2.46.83-3.66.83-1.24 0-2.15-.82-3.63-.82A4.56 4.56 0 0 0 .5 6.6c0 2.83 2.06 6.93 4.08 9.14.85.93 1.88 1.98 3.24 1.94 1.29-.05 1.78-.83 3.34-.83 1.55 0 1.98.83 3.34.8 1.39-.02 2.3-.96 3.15-1.9a11.06 11.06 0 0 0 1.43-2.93 4.08 4.08 0 0 1-2.46-3.73 4.12 4.12 0 0 1 1.96-3.45 4.24 4.24 0 0 0-3.64-1.45zM12.13.37a4.17 4.17 0 0 1-1 2.77A3.38 3.38 0 0 1 8.4 4.51a3.9 3.9 0 0 1 1.02-2.7A4.37 4.37 0 0 1 12.13.37z"/>
          </svg>
          Continue with Apple
        </button>

        {/* Google */}
        <button onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-gray-800 border border-gray-700 text-white font-semibold text-base active:scale-[0.98] transition-transform"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.98 10.98 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Email */}
        <button onClick={onLogin}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl bg-gray-800 border border-gray-700 text-white font-semibold text-base active:scale-[0.98] transition-transform"
        >
          <span className="text-lg">✉️</span>
          Continue with Email
        </button>

        <p className="text-gray-500 text-[11px] text-center pt-2 leading-relaxed">
          By continuing, you agree to ActiveCrew's Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
