"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, AlertCircle, Lightbulb, ArrowRight } from "lucide-react";
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
  // Each card has completely isolated state
  const [isExpanded, setIsExpanded] = useState(false);

  const percentage = (data.score / data.maxScore) * 100;
  const label = categoryLabels[categoryKey];

  // Handle click with stopPropagation to prevent event bubbling
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Color based on percentage
  const getColor = (p: number): { bg: string; text: string; border: string } => {
    if (p >= 80)
      return {
        bg: "bg-green-500",
        text: "text-green-600",
        border: "border-green-600",
      };
    if (p >= 50)
      return {
        bg: "bg-yellow-500",
        text: "text-yellow-600",
        border: "border-yellow-500",
      };
    return {
      bg: "bg-red-500",
      text: "text-red-600",
      border: "border-red-600",
    };
  };

  const colors = getColor(percentage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white border-4 border-[#1a1a1a] p-6 cursor-pointer hover:translate-y-[-1px] transition-transform duration-100"
      style={{ boxShadow: '4px 4px 0px #1a1a1a' }}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-mono font-bold text-lg text-[#1a1a1a] mb-1">{label.title}</h3>
          {/* Hinglish Subtitle */}
          <p className="text-sm text-[#6b6b6b] truncate font-medium">
            {label.subtitle}
          </p>
        </div>

        {/* Score fraction - RIGHT aligned, large */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`font-mono font-bold text-2xl ${colors.text}`}>
            {data.score}/{data.maxScore}
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-[#1a1a1a]" />
          </motion.div>
        </div>
      </div>

      {/* Progress Bar - neo-brutalist */}
      <div className="h-3 bg-[#e8e4df] overflow-hidden border-2 border-[#1a1a1a] mb-3">
        <motion.div
          className={`h-full ${colors.bg}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
        />
      </div>

      {/* Feedback */}
      <p className="text-sm text-[#1a1a1a] font-medium">{data.feedback}</p>

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
            <div className="pt-4 space-y-4 border-t-3 border-[#1a1a1a] mt-4">
              {/* Issues */}
              {data.issues.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-bold text-red-600">
                      Issues
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {data.issues.map((issue, i) => (
                      <li
                        key={i}
                        className="text-sm text-[#1a1a1a] flex items-start gap-2 font-medium"
                      >
                        <ArrowRight className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
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
                    <Lightbulb className="w-4 h-4 text-[#e8441a]" />
                    <span className="text-sm font-bold text-[#e8441a]">
                      Suggestions
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {data.suggestions.map((suggestion, i) => (
                      <li
                        key={i}
                        className="text-sm text-[#1a1a1a] flex items-start gap-2 font-medium"
                      >
                        <ArrowRight className="w-4 h-4 text-[#e8441a] flex-shrink-0 mt-0.5" />
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
