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

export const categoryLabels: Record<CategoryKey, string> = {
  structureCompleteness: "Structure & Completeness",
  contentQuality: "Content Quality",
  impactMetrics: "Impact Metrics",
  languageWriting: "Language & Writing",
  formattingReadability: "Formatting & Readability",
  atsCompatibility: "ATS Compatibility",
  skillsRelevance: "Skills & Relevance",
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
