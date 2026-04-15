export interface CategoryScore {
  score: number;
  maxScore: number;
  feedback: string;
  issues: string[];
  suggestions: string[];
}

export interface ResumeAnalysis {
  overallScore: number;
  roastHeadline: string;
  roastQuote: string;
  categories: {
    structureCompleteness: CategoryScore;
    contentQuality: CategoryScore;
    impactMetrics: CategoryScore;
    languageWriting: CategoryScore;
    formattingReadability: CategoryScore;
    atsCompatibility: CategoryScore;
    skillsRelevance: CategoryScore;
  };
  detectedSections: {
    education: boolean;
    experience: boolean;
    skills: boolean;
    projects: boolean;
    summary: boolean;
    certifications: boolean;
    achievements: boolean;
  };
  missingSections: string[];
  atsKeywords: {
    found: string[];
    missing: string[];
    score: number;
  };
  topStrengths: string[];
  criticalFixes: string[];
  actionPlan: {
    priority: "HIGH" | "MEDIUM" | "LOW";
    action: string;
  }[];
}

export type CategoryKey = keyof ResumeAnalysis["categories"];

export interface CategoryLabel {
  title: string;
  subtitle: string;
}

export const categoryLabels: Record<CategoryKey, CategoryLabel> = {
  structureCompleteness: {
    title: "Structure & Completeness",
    subtitle: "Tera resume structure hai ya jugaad?",
  },
  contentQuality: {
    title: "Content Quality",
    subtitle: "Copy-paste kiya kya GeeksForGeeks se?",
  },
  impactMetrics: {
    title: "Impact & Metrics",
    subtitle: "Numbers dikhao, baatein nahi",
  },
  languageWriting: {
    title: "Language & Writing",
    subtitle: "Grammarly free trial use karo",
  },
  formattingReadability: {
    title: "Formatting",
    subtitle: "HR 6 second mein close karta hai",
  },
  atsCompatibility: {
    title: "ATS Compatibility",
    subtitle: "Bot ne reject kar diya tujhe",
  },
  skillsRelevance: {
    title: "Skills",
    subtitle: "MS Office expert? Waah.",
  },
};

export const sectionLabels: Record<keyof ResumeAnalysis["detectedSections"], string> = {
  education: "Education",
  experience: "Experience",
  skills: "Skills",
  projects: "Projects",
  summary: "Summary/Objective",
  certifications: "Certifications",
  achievements: "Achievements",
};

export interface UploadState {
  file: File | null;
  isDragging: boolean;
  error: string | null;
}

export interface AnalysisState {
  isLoading: boolean;
  data: ResumeAnalysis | null;
  error: string | null;
}

// Score reaction types
export interface ScoreReaction {
  emoji: string;
  text: string;
  color: string;
}

export const getScoreReaction = (score: number): ScoreReaction => {
  if (score <= 30) {
    return {
      emoji: "💀",
      text: "Beta, ghar ja.",
      color: "text-red-500",
    };
  }
  if (score <= 50) {
    return {
      emoji: "😬",
      text: "Bhai, improvement chahiye.",
      color: "text-orange-500",
    };
  }
  if (score <= 70) {
    return {
      emoji: "😐",
      text: "Average. Typical tier-2 energy.",
      color: "text-yellow-500",
    };
  }
  if (score <= 85) {
    return {
      emoji: "👍",
      text: "Not bad. Shayad shortlist ho.",
      color: "text-green-500",
    };
  }
  return {
    emoji: "🔥",
    text: "Ekdum mast! FAANG wale rote hain tere liye.",
    color: "text-amber-400",
  };
};
