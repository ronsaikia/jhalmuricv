"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <div className="space-y-8">
      {/* Main Heading - Bold Editorial Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-2 text-left md:text-left"
      >
        <h1 className="text-editorial font-bold text-[#1a1a1a]" style={{ fontSize: 'clamp(40px, 7vw, 84px)' }}>
          Get Your Resume
        </h1>
        <h1 className="text-editorial font-bold text-gradient-fire" style={{ fontSize: 'clamp(40px, 7vw, 84px)' }}>
          Roasted
        </h1>
      </motion.div>

      {/* Subheading Badge - Neo-brutalist */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border-3 border-[#e8441a] text-[#e8441a] font-bold font-mono text-xs uppercase tracking-wider"
          style={{ boxShadow: '3px 3px 0px #e8441a' }}
        >
          AI-POWERED • BRUTAL • HONEST
        </span>
      </motion.div>

      {/* Three Stats - Neo-brutalist cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="flex flex-wrap items-start sm:items-center gap-3 sm:gap-6 pt-4 overflow-x-hidden"
      >
        <div className="bg-white border-4 border-[#1a1a1a] px-6 py-4 text-left min-w-[120px] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#1a1a1a] transition-all duration-100" style={{ boxShadow: '4px 4px 0px #1a1a1a' }}>
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a] font-mono">7</div>
          <div className="text-sm text-[#1a1a1a] mt-1 font-bold">Categories</div>
        </div>

        <div className="hidden sm:block w-px h-12 bg-[#1a1a1a]" />

        <div className="bg-white border-4 border-[#1a1a1a] px-6 py-4 text-left min-w-[120px] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#1a1a1a] transition-all duration-100" style={{ boxShadow: '4px 4px 0px #1a1a1a' }}>
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#1a1a1a] font-mono">100</div>
          <div className="text-sm text-[#1a1a1a] mt-1 font-bold">Points</div>
        </div>

        <div className="hidden sm:block w-px h-12 bg-[#1a1a1a]" />

        <div className="bg-[#e8441a] border-4 border-[#1a1a1a] px-6 py-4 text-left min-w-[120px] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#1a1a1a] transition-all duration-100" style={{ boxShadow: '4px 4px 0px #1a1a1a' }}>
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-mono">0</div>
          <div className="text-sm text-white mt-1 font-bold">Mercy</div>
        </div>
      </motion.div>
    </div>
  );
}
