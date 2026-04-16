"use client";

import { motion } from "framer-motion";
import { ThumbsUp, Flame, CheckCircle, AlertTriangle } from "lucide-react";

interface FeedbackSectionProps {
  strengths: string[];
  criticalFixes: string[];
}

export default function FeedbackSection({
  strengths,
  criticalFixes,
}: FeedbackSectionProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Strengths */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white border-4 border-[#1a1a1a] p-6"
        style={{ boxShadow: '4px 4px 0px #1a1a1a', borderLeft: '6px solid #22c55e' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 flex items-center justify-center border-3 border-green-600">
            <ThumbsUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-[#1a1a1a]">
            What&apos;s Working 💪
          </h3>
        </div>

        <ul className="space-y-0">
          {strengths.map((strength, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-start gap-3 py-3 border-b-2 border-[#e8e4df] last:border-b-0"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-[#1a1a1a] font-medium">{strength}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Critical Fixes */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white border-4 border-[#1a1a1a] p-6"
        style={{ boxShadow: '4px 4px 0px #1a1a1a', borderLeft: '6px solid #ef4444' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 flex items-center justify-center border-3 border-red-600">
            <Flame className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-[#1a1a1a]">
            Fix This NOW 🔥
          </h3>
        </div>

        <ul className="space-y-0">
          {criticalFixes.map((fix, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-start gap-3 py-3 border-b-2 border-[#e8e4df] last:border-b-0"
            >
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-[#1a1a1a] font-medium">{fix}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
