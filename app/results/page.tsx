"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Flame,
  ArrowRight,
  Flag,
  Share2,
  Copy,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ScoreGauge from "@/components/ScoreGauge";
import CategoryCard from "@/components/CategoryCard";
import ATSChecker from "@/components/ATSChecker";
import FeedbackSection from "@/components/FeedbackSection";
import ReportDownload from "@/components/ReportDownload";
import { ResumeAnalysis, CategoryKey, sectionLabels, getScoreReaction } from "@/lib/types";

// Section Header Component with animated accent bar
interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  delay?: number;
}

function SectionHeader({ icon, title, subtitle, delay = 0 }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="mb-6"
    >
      <div className="flex items-center gap-3 mb-2">
        {/* Animated accent bar */}
        <motion.div
          className="w-1 h-8 bg-electric-500 rounded-full"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: delay + 0.2, ease: "easeOut" }}
          style={{ transformOrigin: "top" }}
        />
        <div className="w-8 h-8 rounded-lg bg-electric-500/20 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>
      {subtitle && <p className="text-accent-slate ml-12">{subtitle}</p>}
    </motion.div>
  );
}

// Toast notification component
interface ToastProps {
  message: string;
  subMessage?: string;
  isVisible: boolean;
  onClose: () => void;
}

function Toast({ message, subMessage, isVisible, onClose }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="glass-strong px-6 py-4 rounded-xl border border-green-500/50">
            <p className="text-white font-medium text-center">{message}</p>
            {subMessage && (
              <p className="text-sm text-accent-slate text-center mt-1">{subMessage}</p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Get analysis from sessionStorage
    const stored = sessionStorage.getItem("resumeAnalysis");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAnalysis(parsed);
      } catch (e) {
        console.error("Failed to parse analysis:", e);
        router.push("/");
      }
    } else {
      router.push("/");
    }
    setIsLoading(false);
  }, [router]);

  const handleShare = () => {
    if (!analysis) return;

    const shareText = `I just got roasted by AI — scored ${analysis.overallScore}/100. Apparently my resume is "${analysis.roastHeadline}". Check yours at ${typeof window !== "undefined" ? window.location.origin : ""} 🔥`;

    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setShowToast(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-electric-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-accent-slate">Loading results...</p>
        </div>
      </main>
    );
  }

  if (!analysis) {
    return null; // Will redirect
  }

  const categoryEntries = Object.entries(
    analysis.categories
  ) as [CategoryKey, ResumeAnalysis["categories"][CategoryKey]][];

  const scoreReaction = getScoreReaction(analysis.overallScore);

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-16 overflow-hidden">
          {/* Section 1: Roast Header - REORDERED */}
          <section className="text-center">
            {/* Fire emoji - FIRST */}
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
                className="text-6xl"
              >
                🔥
              </motion.div>
            </div>

            {/* Score Gauge - SECOND */}
            <div className="flex justify-center mb-4">
              <ScoreGauge score={analysis.overallScore} />
            </div>

            {/* Overall Score label - THIRD */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg font-medium text-white mb-6"
            >
              Overall Score
            </motion.p>

            {/* Indian Score Reaction Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center mb-8"
            >
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass-strong border ${
                  analysis.overallScore >= 86
                    ? "border-amber-400/50 shadow-lg shadow-amber-400/20"
                    : analysis.overallScore >= 71
                    ? "border-green-500/50"
                    : analysis.overallScore >= 51
                    ? "border-yellow-500/50"
                    : analysis.overallScore >= 31
                    ? "border-orange-500/50"
                    : "border-red-500/50"
                }`}
              >
                <span className="text-xl">{scoreReaction.emoji}</span>
                <span className={`font-mono font-medium ${scoreReaction.color}`}>
                  {scoreReaction.text}
                </span>
              </div>
            </motion.div>

            {/* roastHeadline - FOURTH (moved below gauge) */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient-fire mb-8"
            >
              {analysis.roastHeadline}
            </motion.h1>

            {/* Roast Quote Card - LAST (with blinking cursor) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              <div className="rounded-xl overflow-hidden">
                <div className="glass">
                  <div className="terminal-dots border-b border-navy-700">
                    <div className="terminal-dot terminal-dot-red" />
                    <div className="terminal-dot terminal-dot-yellow" />
                    <div className="terminal-dot terminal-dot-green" />
                  </div>
                  <div className="p-6">
                    <p className="text-lg text-accent-slate italic">
                      &ldquo;{analysis.roastQuote}&rdquo;
                      <span className="inline-block w-2 h-5 bg-accent-slate ml-1 animate-blink-cursor" />
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Section 2: Score Breakdown */}
          <section>
            <SectionHeader
              icon={<Flag className="w-4 h-4 text-electric-500" />}
              title="Score Breakdown"
              subtitle="Detailed analysis across 7 key dimensions"
            />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryEntries.map(([key, data], index) => (
                <CategoryCard
                  key={key}
                  categoryKey={key}
                  data={data}
                  index={index}
                />
              ))}
            </div>
          </section>

          {/* Section 3: Section Detection */}
          <section>
            <SectionHeader
              icon={<CheckCircle className="w-4 h-4 text-electric-500" />}
              title="Section Detection"
              subtitle="Which sections we found in your resume"
            />

            <div className="card-glass">
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
                {Object.entries(analysis.detectedSections).map(
                  ([section, detected], index) => (
                    <motion.div
                      key={section}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg ${
                        detected
                          ? "bg-green-500/10 border border-green-500/30"
                          : "bg-navy-800/50 border border-navy-700"
                      }`}
                    >
                      {detected ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                      <span
                        className={`text-sm text-center ${
                          detected ? "text-white" : "text-accent-slate"
                        }`}
                      >
                        {
                          sectionLabels[
                            section as keyof typeof sectionLabels
                          ]
                        }
                      </span>
                    </motion.div>
                  )
                )}
              </div>

              {/* Missing Sections Warning */}
              {analysis.missingSections.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10
                           border border-yellow-500/30"
                >
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-500">
                      Missing Important Sections:
                    </p>
                    <p className="text-sm text-accent-slate">
                      {analysis.missingSections.join(", ")}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </section>

          {/* Section 4: ATS Compatibility */}
          <section>
            <SectionHeader
              icon={<Flame className="w-4 h-4 text-electric-500" />}
              title="ATS Compatibility"
              subtitle="How well your resume performs with Applicant Tracking Systems"
            />

            <ATSChecker data={analysis.atsKeywords} />
          </section>

          {/* Section 5: Strengths vs Critical Fixes */}
          <section>
            <SectionHeader
              icon={<ArrowRight className="w-4 h-4 text-electric-500" />}
              title="The Good vs The Ugly"
            />

            <FeedbackSection
              strengths={analysis.topStrengths}
              criticalFixes={analysis.criticalFixes}
            />
          </section>

          {/* Section 6: Action Plan */}
          <section>
            <SectionHeader
              icon={<CheckCircle className="w-4 h-4 text-electric-500" />}
              title="Your Action Plan"
              subtitle="Prioritized steps to improve your resume"
            />

            <div className="space-y-3">
              {analysis.actionPlan.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card-glass flex items-center gap-4"
                >
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      action.priority === "HIGH"
                        ? "bg-red-500 text-white"
                        : action.priority === "MEDIUM"
                        ? "bg-yellow-500 text-black"
                        : "bg-electric-500 text-white"
                    }`}
                  >
                    {action.priority}
                  </span>
                  <span className="text-white">{action.action}</span>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Section 7: Download Report & Share */}
          <section className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card-glass py-12 px-8"
            >
              <h2 className="text-2xl font-bold text-white mb-4">
                Ready to make your resume fire? 🔥
              </h2>
              <p className="text-accent-slate mb-8 max-w-lg mx-auto">
                Download your complete roast report and start implementing these
                improvements today.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <ReportDownload analysis={analysis} />

                {/* Share Roast Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShare}
                  className="px-6 py-4 border border-navy-700 text-accent-slate font-medium rounded-lg
                           transition-all duration-300 hover:border-electric-600 hover:text-white
                           active:scale-95 flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Copy className="w-5 h-5 text-green-500" />
                      <span className="text-green-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-5 h-5" />
                      Share My Roast 🔥
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </section>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message="Copied to clipboard!"
        subMessage="Ab share karo sharam ke saath 😂"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </main>
  );
}
