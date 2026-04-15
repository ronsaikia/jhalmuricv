"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, AlertCircle, Lightbulb } from "lucide-react";
import { CategoryScore, CategoryKey } from "@/lib/types";
import { categoryLabels } from "@/lib/types";

interface CategoryCardProps {
  categoryKey: CategoryKey;
  data: CategoryScore;
  index: number;
}

export default function CategoryCard({
  categoryKey,
  data,
  index,
}: CategoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const percentage = (data.score / data.maxScore) * 100;
  const label = categoryLabels[categoryKey];

  // Color based on percentage
  const getColor = (p: number): { bg: string; text: string; glow: string } => {
    if (p >= 80)
      return {
        bg: "bg-green-500",
        text: "text-green-500",
        glow: "shadow-green-500/30",
      };
    if (p >= 50)
      return {
        bg: "bg-yellow-500",
        text: "text-yellow-500",
        glow: "shadow-yellow-500/30",
      };
    return {
      bg: "bg-red-500",
      text: "text-red-500",
      glow: "shadow-red-500/30",
    };
  };

  const colors = getColor(percentage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`card-glass cursor-pointer ${
        isExpanded ? "ring-1 ring-electric-500/50" : ""
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-white">{label.title}</h3>
          <div className="flex items-center gap-2">
            <span className={`font-mono font-bold ${colors.text}`}>
              {data.score}/{data.maxScore}
            </span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4 text-accent-slate" />
            </motion.div>
          </div>
        </div>
        {/* Hinglish Subtitle */}
        <p className="text-xs text-accent-slate/70 mt-1 truncate">
          {label.subtitle}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar mb-3">
        <motion.div
          className={`progress-fill ${colors.bg}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
          style={{
            boxShadow: `0 0 10px ${colors.bg.replace("bg-", "").replace("-500", "")}`,
          }}
        />
      </div>

      {/* Feedback */}
      <p className="text-sm text-accent-slate line-clamp-2">{data.feedback}</p>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-4 border-t border-navy-700 mt-4">
              {/* Issues */}
              {data.issues.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-red-400">
                      Issues
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {data.issues.map((issue, i) => (
                      <li
                        key={i}
                        className="text-sm text-accent-slate pl-6 relative"
                      >
                        <span className="absolute left-2 top-1.5 w-1 h-1 rounded-full bg-red-400" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {data.suggestions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-electric-500" />
                    <span className="text-sm font-medium text-electric-500">
                      Suggestions
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {data.suggestions.map((suggestion, i) => (
                      <li
                        key={i}
                        className="text-sm text-accent-slate pl-6 relative"
                      >
                        <span className="absolute left-2 top-1.5 w-1 h-1 rounded-full bg-electric-500" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
