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

export const getScoreReaction = (score: number, seed?: number): ScoreReaction => {
  const rand = seed !== undefined ? seed : Math.random();

  if (score <= 30) {
    const options: ScoreReaction[] = [
      { emoji: "💀", text: "Beta, ghar ja.", color: "#ef4444" },
      { emoji: "🪦", text: "Resume ya death certificate?", color: "#ef4444" },
      { emoji: "☠️", text: "HR ne screenshot liya roast ke liye.", color: "#ef4444" },
    ];
    return options[Math.floor(rand * options.length)];
  }
  if (score <= 50) {
    const options: ScoreReaction[] = [
      { emoji: "😬", text: "Bhai, improvement chahiye.", color: "#f97316" },
      { emoji: "😰", text: "TCS bhi sochegi do baar.", color: "#f97316" },
      { emoji: "😵", text: "Itna toh expect nahi tha yaar.", color: "#f97316" },
    ];
    return options[Math.floor(rand * options.length)];
  }
  if (score <= 70) {
    const options: ScoreReaction[] = [
      { emoji: "😐", text: "Average. Typical tier-2 energy.", color: "#eab308" },
      { emoji: "🤔", text: "Chalega... par chalega nahi FAANG mein.", color: "#eab308" },
      { emoji: "😑", text: "Mass hiring candidate vibes.", color: "#eab308" },
      { emoji: "🙃", text: "Berozgari se 2 kadam door.", color: "#eab308" },
    ];
    return options[Math.floor(rand * options.length)];
  }
  if (score <= 85) {
    const options: ScoreReaction[] = [
      { emoji: "👍", text: "Not bad. Shayad shortlist ho.", color: "#22c55e" },
      { emoji: "💪", text: "Solid. Kuch hope hai tere mein.", color: "#22c55e" },
      { emoji: "🙌", text: "HR ka call aa sakta hai.", color: "#22c55e" },
    ];
    return options[Math.floor(rand * options.length)];
  }
  const options: ScoreReaction[] = [
    { emoji: "🔥", text: "Ekdum mast! FAANG wale rote hain tere liye.", color: "#f59e0b" },
    { emoji: "🚀", text: "Tera resume dekh ke HR ka dil jeet liya.", color: "#f59e0b" },
    { emoji: "⭐", text: "Bhai tu toh placement cell ka hero hai.", color: "#f59e0b" },
  ];
  return options[Math.floor(rand * options.length)];
};
