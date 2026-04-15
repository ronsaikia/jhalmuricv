"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sparkles, Zap, TrendingUp, Flame, RotateCcw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import UploadZone from "@/components/UploadZone";
import LoadingRoast from "@/components/LoadingRoast";
import { ResumeAnalysis } from "@/lib/types";

// Error states for invalid document
interface InvalidDocumentError {
  status: "invalid_document";
  message: string;
}

const invalidDocumentMessages = [
  "Bhai, ye resume hai? Bijli ka bill upload kar diya kya?",
  "Uploaded document is as irrelevant as your 1st-year engineering syllabus.",
  "Did you just upload your Tinder bio? Because HR isn't swiping right on this either.",
  "Aadhaar card upload mat kar bhai, job CV pe milti hai.",
  "System confused: Is this a resume or a grocery list? Go back and upload a real CV.",
];

// Demo data for demo mode
const demoAnalysis: ResumeAnalysis = {
  overallScore: 73,
  roastHeadline:
    "Bhai, tera resume dekh ke HR ne chai pi li aur ghost kar diya.",
  roastQuote:
    "Look, I've seen grocery lists with more compelling narratives. You have the ingredients for a great resume, but you're serving them raw. Tera 'proficient in everything' actually means 'master of nothing' - aur yeh sabko dikhta hai except tereko.",
  categories: {
    structureCompleteness: {
      score: 16,
      maxScore: 20,
      feedback:
        "Solid foundation with most essential sections present, but missing a compelling summary.",
      issues: [
        "No professional summary or objective statement",
        "Projects section is thin",
      ],
      suggestions: [
        "Add a 2-3 sentence professional summary at the top",
        "Expand projects section with more details",
      ],
    },
    contentQuality: {
      score: 14,
      maxScore: 20,
      feedback:
        "Good start but relies too heavily on buzzwords and generic phrases.",
      issues: [
        "Overuse of 'responsible for' and 'assisted with'",
        "Vague descriptions without specific outcomes",
      ],
      suggestions: [
        "Replace passive voice with active voice",
        "Focus on outcomes, not just tasks",
      ],
    },
    impactMetrics: {
      score: 9,
      maxScore: 15,
      feedback:
        "Some quantified achievements present but could use more numbers.",
      issues: [
        "Only 2 bullet points have quantified results",
        "Missing scale of impact",
      ],
      suggestions: [
        "Add percentages, dollar amounts, or user counts",
        "Show before/after comparisons",
      ],
    },
    languageWriting: {
      score: 7,
      maxScore: 10,
      feedback: "Clean writing with good grammar, but could be more concise.",
      issues: ["Some wordy phrases", "Inconsistent verb tense in experience"],
      suggestions: [
        "Cut 10-20% of words from each bullet",
        "Use present tense for current role, past for previous",
      ],
    },
    formattingReadability: {
      score: 11,
      maxScore: 15,
      feedback: "Clean layout with good visual hierarchy.",
      issues: [
        "Inconsistent spacing between sections",
        "Skills list runs too long",
      ],
      suggestions: [
        "Standardize whitespace",
        "Group skills into categories",
      ],
    },
    atsCompatibility: {
      score: 7,
      maxScore: 10,
      feedback: "Good keyword density but missing some standard terms.",
      issues: [
        "Missing standard ATS keywords",
        "No mention of methodologies used",
      ],
      suggestions: [
        "Add more industry-standard keywords",
        "Include Agile, Scrum, or other methodologies",
      ],
    },
    skillsRelevance: {
      score: 9,
      maxScore: 10,
      feedback:
        "Strong technical skills that align well with current market demands.",
      issues: ["Could mention soft skills more"],
      suggestions: ["Add leadership and communication skills"],
    },
  },
  detectedSections: {
    education: true,
    experience: true,
    skills: true,
    projects: true,
    summary: false,
    certifications: false,
    achievements: true,
  },
  missingSections: ["Professional Summary", "Certifications"],
  atsKeywords: {
    found: ["Python", "React", "Git", "JavaScript", "Node.js", "SQL"],
    missing: ["CI/CD", "Agile", "REST API", "Docker", "AWS"],
    score: 65,
  },
  topStrengths: [
    "Strong technical skill set with modern frameworks",
    "Clear career progression shown",
    "Good educational background with relevant degree",
  ],
  criticalFixes: [
    "Add quantified metrics to ALL experience bullet points",
    "Write a compelling professional summary",
    "Fix verb tense consistency in experience section",
  ],
  actionPlan: [
    {
      priority: "HIGH",
      action:
        "Add quantified metrics to all experience bullet points (%, $, #)",
    },
    {
      priority: "HIGH",
      action:
        "Write a 2-3 sentence professional summary highlighting your unique value",
    },
    {
      priority: "MEDIUM",
      action: "Group skills into categories (Frontend, Backend, Tools)",
    },
    {
      priority: "MEDIUM",
      action: "Add missing ATS keywords: CI/CD, Agile, REST API, Docker",
    },
    {
      priority: "LOW",
      action: "Standardize spacing and formatting throughout",
    },
  ],
};

// Function to check if text looks like a resume
function looksLikeResume(text: string): boolean {
  const resumeKeywords = [
    "experience",
    "education",
    "skills",
    "work",
    "job",
    "employment",
    "qualification",
    "degree",
    "university",
    "college",
    "project",
    "achievement",
    "summary",
    "objective",
    "contact",
    "email",
    "phone",
    "linkedin",
    "github",
  ];

  const textLower = text.toLowerCase();
  const keywordCount = resumeKeywords.filter((kw) =>
    textLower.includes(kw)
  ).length;

  // If less than 3 resume keywords found, likely not a resume
  return keywordCount >= 3 && text.length > 200;
}

export default function Home() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalidDocError, setInvalidDocError] = useState<InvalidDocumentError | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setInvalidDocError(null);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setError(null);
    setInvalidDocError(null);
  };

  const handleRetry = () => {
    setSelectedFile(null);
    setError(null);
    setInvalidDocError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please upload a resume first");
      return;
    }

    setIsLoading(true);
    setError(null);
    setInvalidDocError(null);

    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      // Check for invalid document error
      if (data.status === "invalid_document" || !looksLikeResume(data.extractedText || "")) {
        const randomMessage =
          invalidDocumentMessages[
            Math.floor(Math.random() * invalidDocumentMessages.length)
          ];
        setInvalidDocError({
          status: "invalid_document",
          message: randomMessage,
        });
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze resume");
      }

      // Store analysis in sessionStorage
      sessionStorage.setItem("resumeAnalysis", JSON.stringify(data));

      // Trigger confetti if score is high
      if (data.overallScore > 80) {
        const confetti = (await import("canvas-confetti")).default;
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#22c55e", "#3b82f6", "#f97316"],
        });
      }

      router.push("/results");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      setIsLoading(false);
    }
  };

  const handleDemo = () => {
    sessionStorage.setItem("resumeAnalysis", JSON.stringify(demoAnalysis));
    router.push("/results");
  };

  // Show invalid document error screen
  if (invalidDocError) {
    return (
      <main className="min-h-screen bg-background overflow-x-hidden">
        <Navbar />

        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full"
          >
            <div className="glass-strong rounded-2xl p-8 text-center border border-red-500/30">
              {/* Pulsing Clown/Warning Emoji */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, -5, 5, -5, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
                className="text-8xl mb-6"
              >
                🤡
              </motion.div>

              <h2 className="text-2xl font-bold text-red-400 mb-4">
                Invalid Document
              </h2>

              <p className="text-lg text-accent-slate mb-8 italic">
                &ldquo;{invalidDocError.message}&rdquo;
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRetry}
                className="btn-primary flex items-center justify-center gap-2 mx-auto"
              >
                <RotateCcw className="w-5 h-5" />
                Galti ho gayi, asli resume upload karunga 😭
              </motion.button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {isLoading && <LoadingRoast />}

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <Hero />

          {/* Upload Section */}
          <div className="mt-12">
            <UploadZone
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onClearFile={handleClearFile}
            />

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAnalyze}
                disabled={isLoading || !selectedFile}
                className="btn-primary text-lg flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Analyzing...
                  </>
                ) : (
                  <>
                  <Flame className="w-5 h-5" />
                    Roast My Resume
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDemo}
                className="px-6 py-4 border border-navy-700 text-accent-slate font-medium rounded-lg
                         transition-all duration-300 hover:border-electric-600 hover:text-white
                         active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Try Demo
              </motion.button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="mt-20 grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Analyze",
                description:
                  "AI-powered deep analysis of your resume's strengths and weaknesses",
                color: "text-yellow-500",
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "Score",
                description:
                  "Get detailed scores across 7 critical resume dimensions",
                color: "text-green-500",
              },
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: "Improve",
                description:
                  "Receive actionable, prioritized feedback to land more interviews",
                color: "text-electric-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="card-glass text-center group"
              >
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-xl
                              bg-navy-800 mb-4 group-hover:bg-navy-700 transition-colors ${feature.color}`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-accent-slate">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Footer Note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-16 text-center text-sm text-accent-slate/60"
          >
            Built with 🔥 by CHIRON
          </motion.p>
        </div>
      </div>
    </main>
  );
}
