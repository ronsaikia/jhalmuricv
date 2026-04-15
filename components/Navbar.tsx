"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-strong"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative">
              <Flame className="w-6 h-6 text-orange-500" />
              <motion.div
                className="absolute inset-0"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Flame className="w-6 h-6 text-orange-400" />
              </motion.div>
            </div>
            <span className="font-mono font-bold text-lg">
              Resume <span className="text-electric-500">Roaster</span>
            </span>
          </motion.div>

          {/* AEC Badge */}
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-800/50 border border-navy-700"
            whileHover={{ borderColor: "rgba(37, 99, 235, 0.5)" }}
          >
            <div className="w-2 h-2 rounded-full bg-electric-500 animate-pulse" />
            <span className="text-xs font-mono text-accent-slate">
              AEC Coding Club
            </span>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}
