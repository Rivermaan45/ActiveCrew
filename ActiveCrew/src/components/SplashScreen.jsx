import React from 'react';
import { motion } from 'framer-motion';

export default function SplashScreen() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-active-500 via-active-600 to-crew-500 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="text-center"
      >
        <div className="text-6xl mb-4">⚡</div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">ActiveCrew</h1>
        <p className="text-white/70 text-sm mt-2">Find Your People. Do Your Thing.</p>
      </motion.div>
    </div>
  );
}
