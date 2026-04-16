"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const messages = [
  "Kya dekhne aaya hai yahan? 🤡",
  "Beta, yeh page nahi tha tera. Apna resume fix kar pehle💀",
  "HR ne tujhe reject kiya, ab yeh page bhi kar raha hai",
  "Teri curiosity hi tera sabse bada weakness hai. Resume pe likh de😂",
  "404: Life goals not found. Resume bhi nahi bana tere se💅",
  "Bhai, ek page pe aaya aur ye bhi samajh nahi aaya? Coding sikhle pehle",
];

const emojis = ["🤡", "💀"];

// Get truly random index using Math.random()
function getRandomIndex(length: number): number {
  return Math.floor(Math.random() * length);
}

export default function SecretPageClient() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentEmoji, setCurrentEmoji] = useState(emojis[0]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set truly random message on client-side mount
    setCurrentIndex(getRandomIndex(messages.length));
    setCurrentEmoji(emojis[getRandomIndex(emojis.length)]);
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f0ede8] flex items-center justify-center px-4">
        <div className="w-16 h-16 border-4 border-[#1a1a1a] border-t-[#e8441a] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#f0ede8] flex items-center justify-center px-4"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #1a1a1a 0,
            #1a1a1a 2px,
            transparent 2px,
            transparent 20px
          )`
        }} />
      </div>

      <div className="relative z-10 max-w-lg w-full">
        {/* Neo-brutalist Card */}
        <div
          className="bg-white border-4 border-[#1a1a1a] relative"
          style={{ boxShadow: '8px 8px 0px #1a1a1a' }}
        >
          {/* Terminal Header */}
          <div
            className="bg-[#e8441a] px-4 py-3 flex items-center gap-2 border-b-4 border-[#1a1a1a]"
          >
            <div className="w-4 h-4 border-2 border-[#1a1a1a] bg-white" />
            <div className="w-4 h-4 border-2 border-[#1a1a1a] bg-white" />
            <div className="w-4 h-4 border-2 border-[#1a1a1a] bg-white" />
            <span className="ml-4 text-sm text-white font-mono font-bold">
              pakde_gaye.exe
            </span>
          </div>

          {/* Content */}
          <div className="p-8 text-center">
            {/* Random Emoji */}
            <div
              className="text-8xl mb-6"
            >
              {currentEmoji}
            </div>

            {/* Random Message */}
            <div className="mb-8">
              <p className="text-xl text-[#1a1a1a] font-bold">
                {messages[currentIndex]}
              </p>
            </div>

            {/* Neo-brutalist Back Button */}
            <Link href="/" passHref>
              <motion.button
                whileHover={{
                  x: 2,
                  y: 2,
                  boxShadow: '2px 2px 0px #1a1a1a'
                }}
                whileTap={{
                  x: 4,
                  y: 4,
                  boxShadow: '0px 0px 0px #1a1a1a'
                }}
                className="w-full px-6 py-4 bg-[#e8441a] text-white font-bold text-lg
                         border-4 border-[#1a1a1a] transition-all duration-100
                         flex items-center justify-center gap-2"
                style={{ boxShadow: '4px 4px 0px #1a1a1a' }}
              >
                Theek hai bhai, wapas jata hun 😭
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Bottom text */}
        <p className="text-center text-[#1a1a1a]/70 text-sm mt-6 font-mono font-bold">
          {'// Kya socha tha? Kuch milega yahan aake?'}
        </p>
      </div>
    </motion.div>
  );
}
