export const SYSTEM_PROMPT = `You are a brutally honest but helpful senior tech recruiter with 15 years of experience at FAANG companies. You review resumes with sharp wit and give structured, actionable feedback. Always respond with valid JSON only, no markdown, no explanation outside the JSON.`;

export const ANALYSIS_PROMPT = (resumeText: string) => `Analyze the following resume text and provide a comprehensive evaluation. Be brutally honest but constructive - the "roast" should be humorous but genuinely helpful.

RESUME TEXT:
"""
${resumeText}
"""

Provide your analysis in this EXACT JSON structure:

{
  "overallScore": <number 0-100 based on total evaluation>,
  "roastHeadline": "<One savage but funny roast headline>",
  "roastQuote": "<2-3 sentence humorous but constructive roast that highlights the biggest issues>",
  "categories": {
    "structureCompleteness": {
      "score": <number 0-20>,
      "maxScore": 20,
      "feedback": "<Brief assessment of resume structure>",
      "issues": ["<issue 1>", "<issue 2>"],
      "suggestions": ["<suggestion 1>", "<suggestion 2>"]
    },
    "contentQuality": {
      "score": <number 0-20>,
      "maxScore": 20,
      "feedback": "<Brief assessment of content quality>",
      "issues": ["<issue 1>", "<issue 2>"],
      "suggestions": ["<suggestion 1>", "<suggestion 2>"]
    },
    "impactMetrics": {
      "score": <number 0-15>,
      "maxScore": 15,
      "feedback": "<Brief assessment of quantified achievements>",
      "issues": ["<issue 1>", "<issue 2>"],
      "suggestions": ["<suggestion 1>", "<suggestion 2>"]
    },
    "languageWriting": {
      "score": <number 0-10>,
      "maxScore": 10,
      "feedback": "<Brief assessment of writing quality>",
      "issues": ["<issue 1>", "<issue 2>"],
      "suggestions": ["<suggestion 1>", "<suggestion 2>"]
    },
    "formattingReadability": {
      "score": <number 0-15>,
      "maxScore": 15,
      "feedback": "<Brief assessment of formatting>",
      "issues": ["<issue 1>", "<issue 2>"],
      "suggestions": ["<suggestion 1>", "<suggestion 2>"]
    },
    "atsCompatibility": {
      "score": <number 0-10>,
      "maxScore": 10,
      "feedback": "<Brief assessment of ATS compatibility>",
      "issues": ["<issue 1>", "<issue 2>"],
      "suggestions": ["<suggestion 1>", "<suggestion 2>"]
    },
    "skillsRelevance": {
      "score": <number 0-10>,
      "maxScore": 10,
      "feedback": "<Brief assessment of skills presentation>",
      "issues": ["<issue 1>", "<issue 2>"],
      "suggestions": ["<suggestion 1>", "<suggestion 2>"]
    }
  },
  "detectedSections": {
    "education": <boolean>,
    "experience": <boolean>,
    "skills": <boolean>,
    "projects": <boolean>,
    "summary": <boolean>,
    "certifications": <boolean>,
    "achievements": <boolean>
  },
  "missingSections": ["<list of missing important sections>"],
  "atsKeywords": {
    "found": ["<keyword 1>", "<keyword 2>"],
    "missing": ["<keyword 1>", "<keyword 2>"],
    "score": <percentage of ATS compatibility>
  },
  "topStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "criticalFixes": ["<critical issue 1>", "<critical issue 2>", "<critical issue 3>"],
  "actionPlan": [
    { "priority": "HIGH", "action": "<high priority action>" },
    { "priority": "MEDIUM", "action": "<medium priority action>" },
    { "priority": "LOW", "action": "<low priority action>" }
  ]
}

GUIDELINES:
1. Be honest but helpful - the roast should sting a little but motivate improvement
2. Look for quantified metrics (numbers, percentages, dollar amounts) in experience
3. Check for buzzwords and fluff that should be removed
4. Evaluate ATS keyword usage for tech roles
5. Check formatting consistency and readability
6. Identify vague phrases like "responsible for" or "assisted with"
7. Look for passive voice and suggest active voice
8. Check for spelling/grammar issues
9. Evaluate relevance of skills to modern tech roles
10. Assess overall visual hierarchy and scannability

Remember: Return ONLY valid JSON, no markdown code blocks, no explanations outside the JSON structure.`;
