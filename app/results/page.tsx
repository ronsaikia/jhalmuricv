"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Flame,
  ArrowRight,
  Flag,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ScoreGauge from "@/components/ScoreGauge";
import CategoryCard from "@/components/CategoryCard";
import ATSChecker from "@/components/ATSChecker";
import FeedbackSection from "@/components/FeedbackSection";
import ReportDownload from "@/components/ReportDownload";
import { ResumeAnalysis, CategoryKey, sectionLabels } from "@/lib/types";

export default function ResultsPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Section 1: Roast Header */}
          <section className="text-center">
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

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-gradient-fire mb-6"
            >
              {analysis.roastHeadline}
            </motion.h1>

            <div className="flex justify-center mb-8">
              <ScoreGauge score={analysis.overallScore} />
            </div>

            {/* Roast Quote Card */}
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
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Section 2: Score Breakdown */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-electric-500/20 flex items-center justify-center">
                  <Flag className="w-4 h-4 text-electric-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Score Breakdown</h2>
              </div>
              <p className="text-accent-slate">
                Detailed analysis across 7 key dimensions
              </p>
            </motion.div>

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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-electric-500/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-electric-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Section Detection</h2>
              </div>
              <p className="text-accent-slate">
                Which sections we found in your resume
              </p>
            </motion.div>

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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-electric-500/20 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-electric-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">ATS Compatibility</h2>
              </div>
              <p className="text-accent-slate">
                How well your resume performs with Applicant Tracking Systems
              </p>
            </motion.div>

            <ATSChecker data={analysis.atsKeywords} />
          </section>

          {/* Section 5: Strengths vs Critical Fixes */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-electric-500/20 flex items-center justify-center">
                  <ArrowRight className="w-4 h-4 text-electric-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">The Good vs The Ugly</h2>
              </div>
            </motion.div>

            <FeedbackSection
              strengths={analysis.topStrengths}
              criticalFixes={analysis.criticalFixes}
            />
          </section>

          {/* Section 6: Action Plan */}
          <section>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-electric-500/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-electric-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Your Action Plan</h2>
              </div>
              <p className="text-accent-slate">
                Prioritized steps to improve your resume
              </p>
            </motion.div>

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

          {/* Section 7: Download Report */}
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

              <ReportDownload analysis={analysis} />
            </motion.div>
          </section>
        </div>
      </div>
    </main>
  );
}
