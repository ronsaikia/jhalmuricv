"use client";

import { motion } from "framer-motion";

export default function Hero() {
  return (
    <div className="text-center space-y-6">
      {/* Main Heading */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-4"
      >
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
          <span className="text-gradient">Get Your Resume{" "}</span>
          <motion.span
            className="inline-flex items-center gap-2 text-gradient-fire"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [1, 0.9, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Roasted
            <motion.span
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatDelay: 2,
              }}
            >
              🔥
            </motion.span>
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-lg sm:text-xl text-accent-slate max-w-2xl mx-auto"
        >
          AI-powered brutal honesty. Structured feedback. Real scores.
        </motion.p>
      </motion.div>

      {/* Feature Pills */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="flex flex-wrap justify-center gap-3"
      >
        {[
          { icon: "🤖", text: "AI Analysis" },
          { icon: "📊", text: "Detailed Scoring" },
          { icon: "💡", text: "Actionable Tips" },
        ].map((feature, index) => (
          <motion.div
            key={feature.text}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm"
          >
            <span>{feature.icon}</span>
            <span className="text-accent-slate">{feature.text}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
