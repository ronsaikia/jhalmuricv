"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  label?: string;
}

export default function ScoreGauge({
  score,
  size = 200,
  strokeWidth = 12,
  showLabel = true,
  label = "Overall Score",
}: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (displayScore / 100) * circumference;

  // Color based on score
  const getColor = (s: number): string => {
    if (s <= 40) return "#ef4444"; // Red
    if (s <= 70) return "#eab308"; // Yellow
    return "#22c55e"; // Green
  };

  const getGlowColor = (s: number): string => {
    if (s <= 40) return "rgba(239, 68, 68, 0.5)";
    if (s <= 70) return "rgba(234, 179, 8, 0.5)";
    return "rgba(34, 197, 94, 0.5)";
  };

  const color = getColor(score);
  const glowColor = getGlowColor(score);
  const trackColor = color + "4D"; // 30% opacity in hex

  // Animate score counting
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  // Calculate stroke dash offset - handle edge case for 100%
  const strokeDashoffset = score >= 100 ? 0 : circumference - progress;

  return (
    <div className="relative flex flex-col items-center">
      {/* Container - perfectly circular */}
      <div
        className="relative rounded-full"
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          overflow: "visible",
        }}
      >
        {/* Outer glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            boxShadow: `0 0 60px ${glowColor}, 0 0 100px ${glowColor}`,
            borderRadius: "50%",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />

        {/* Inner shadow ring for depth */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: "50%",
            boxShadow: "inset 0 0 30px rgba(0, 0, 0, 0.4), inset 0 0 60px rgba(0, 0, 0, 0.2)",
          }}
        />

        {/* SVG Gauge - overflow visible for glow */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* Glow filter for progress circle */}
            <filter id={`glow-${score}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Track Circle - using score color with 30% opacity */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Inner shadow ring (SVG) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth / 2 - 2}
            fill="none"
            stroke="rgba(0, 0, 0, 0.3)"
            strokeWidth={1}
          />

          {/* Progress Circle with glow filter */}
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
            animate={{ strokeDashoffset: strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            filter={`url(#glow-${score})`}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-5xl font-bold font-mono"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            {displayScore}
          </motion.span>
          <span className="text-sm text-accent-slate mt-1">/100</span>
        </div>
      </div>

      {/* Label */}
      {showLabel && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-lg font-medium text-white"
        >
          {label}
        </motion.p>
      )}
    </div>
  );
}
