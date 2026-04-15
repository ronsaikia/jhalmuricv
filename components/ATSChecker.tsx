"use client";

import { motion } from "framer-motion";
import { CheckCircle, Search } from "lucide-react";
import { ResumeAnalysis } from "@/lib/types";

interface ATSCheckerProps {
  data: ResumeAnalysis["atsKeywords"];
}

export default function ATSChecker({ data }: ATSCheckerProps) {
  const { found, missing, score } = data;

  // Calculate ring circumference
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (score / 100) * circumference;

  // Color based on score
  const getColor = (s: number): string => {
    if (s >= 70) return "#22c55e";
    if (s >= 50) return "#eab308";
    return "#ef4444";
  };

  const color = getColor(score);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Score Ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-glass flex flex-col items-center justify-center p-6"
      >
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            className="transform -rotate-90"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#1e3a5f"
              strokeWidth={strokeWidth}
            />
            <motion.circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - progress }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold font-mono" style={{ color }}>
              {score}%
            </span>
            <span className="text-xs text-accent-slate">ATS Score</span>
          </div>
        </div>

        <p className="mt-4 text-sm text-accent-slate text-center">
          Keyword match rate for Applicant Tracking Systems
        </p>
      </motion.div>

      {/* Keywords Section */}
      <div className="space-y-4">
        {/* Found Keywords */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card-glass"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h4 className="font-medium text-white">Keywords Found</h4>
            <span className="ml-auto text-sm text-green-500 font-mono">
              {found.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {found.map((keyword, i) => (
              <motion.span
                key={keyword}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="px-2.5 py-1 text-sm rounded-full bg-green-500/20
                         text-green-400 border border-green-500/30"
              >
                {keyword}
              </motion.span>
            ))}
            {found.length === 0 && (
              <p className="text-sm text-accent-slate">
                No common ATS keywords found
              </p>
            )}
          </div>
        </motion.div>

        {/* Missing Keywords */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card-glass"
        >
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-5 h-5 text-accent-slate" />
            <h4 className="font-medium text-white">Keywords Missing</h4>
            <span className="ml-auto text-sm text-accent-slate font-mono">
              {missing.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {missing.map((keyword, i) => (
              <motion.span
                key={keyword}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                className="px-2.5 py-1 text-sm rounded-full bg-navy-800
                         text-accent-slate border border-navy-700"
              >
                {keyword}
              </motion.span>
            ))}
            {missing.length === 0 && (
              <p className="text-sm text-accent-slate">
                Great job! You have most relevant keywords
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
