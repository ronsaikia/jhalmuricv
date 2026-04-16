"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const loadingMessages = [
  "Tera resume padh ke aansu aa gaye... 😭",
  "Consulting 15 rejected LinkedIn applications for reference...",
  "Checking if 'MS Office Expert' is a real skill...",
  "TCS NextStep bhi shocked hai yaar...",
  "Ammi Papa ka sapna tod raha hun slowly...",
  "Calculating damage to your FAANG dreams...",
  "Bhai kitne buzzwords daale hain yaar... 💀",
  "Grammarly ne bhi surrender kar diya...",
];

export default function LoadingRoast() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#f0ede8]"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            #1a1a1a 0,
            #1a1a1a 2px,
            transparent 2px,
            transparent 30px
          )`
        }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Static Emoji with brutalist border */}
        <div
          className="text-8xl bg-white border-4 border-[#1a1a1a] p-6"
          style={{ boxShadow: '6px 6px 0px #1a1a1a' }}
        >
          🔥
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-bold font-mono text-[#1a1a1a]">
            Roasting Your Resume...
          </h3>

          {/* Rotating Messages */}
          <div className="h-8 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-[#1a1a1a] font-mono font-bold"
              >
                {loadingMessages[currentIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Progress Bar - neo-brutalist */}
        <div className="w-64 h-4 bg-white border-3 border-[#1a1a1a] overflow-hidden">
          <motion.div
            className="h-full bg-[#e8441a]"
            initial={{ width: "0%" }}
            animate={{
              width: ["0%", "100%", "0%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
