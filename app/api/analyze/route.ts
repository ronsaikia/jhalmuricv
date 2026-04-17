import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { SYSTEM_PROMPT, ANALYSIS_PROMPT, VISION_ANALYSIS_PROMPT, SIMPLIFIED_JSON_PROMPT } from "@/lib/analyzePrompt";

// Supports: GEMINI_API_KEY, GEMINI_API_KEY_2, GEMINI_API_KEY_3
// Add multiple keys to .env.local for automatic rotation on 503 errors

// PDF parsing requires Node.js runtime
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Sleep helper for retry logic
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Parse PDF using pure regex approach - no native dependencies
async function parsePDF(buffer: Buffer): Promise<{ text: string }> {
  try {
    const pdfString = buffer.toString("latin1");
    const textParts: string[] = [];

    // Extract text from BT...ET blocks
    const btEtRegex = /BT([\s\S]*?)ET/g;
    let btMatch;
    while ((btMatch = btEtRegex.exec(pdfString)) !== null) {
      const block = btMatch[1];
      // Match Tj operator (single string)
      const tjRegex = /\(([^)]*)\)\s*Tj/g;
      let tjMatch;
      while ((tjMatch = tjRegex.exec(block)) !== null) {
        textParts.push(tjMatch[1]);
      }
      // Match TJ operator (array of strings)
      const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g;
      let tjArrayMatch;
      while ((tjArrayMatch = tjArrayRegex.exec(block)) !== null) {
        const arrayContent = tjArrayMatch[1];
        const stringRegex = /\(([^)]*)\)/g;
        let strMatch;
        while ((strMatch = stringRegex.exec(arrayContent)) !== null) {
          textParts.push(strMatch[1]);
        }
      }
    }

    // Also try to find plain text streams
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let streamMatch;
    while ((streamMatch = streamRegex.exec(pdfString)) !== null) {
      const content = streamMatch[1];
      if (/[a-zA-Z]{10,}/.test(content)) {
        // Looks like readable text
        const words = content.match(/[a-zA-Z][a-zA-Z\s.,@\-+]{3,}/g);
        if (words) textParts.push(...words);
      }
    }

    const fullText = textParts
      .join(" ")
      .replace(/\\n/g, "\n")
      .replace(/\\r/g, "")
      .replace(/\\t/g, " ")
      .replace(/\\\(/g, "(")
      .replace(/\\\)/g, ")")
      .replace(/\\\\/g, "\\")
      .replace(/\s+/g, " ")
      .trim();

    if (fullText.length > 100) {
      console.log("[PDF Parse] Regex extraction succeeded, got", fullText.length, "chars");
      return { text: fullText };
    }

    throw new Error("Regex extraction yielded insufficient text: " + fullText.length + " chars");
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[PDF Parse] Regex strategy failed:", msg);
    throw new Error("Could not extract text from PDF");
  }
}

// Check if an error indicates a 503/overload/429 condition
function isOverloadedError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("503") ||
      message.includes("429") ||
      message.includes("overloaded") ||
      message.includes("rate limit") ||
      message.includes("too many requests") ||
      message.includes("resource exhausted") ||
      message.includes("try again later")
    );
  }
  return false;
}

// Retry wrapper for Gemini API call with key rotation
async function callGeminiWithRetry(
  apiKeys: string[],
  prompt: string,
  base64Data?: string,
  maxRetries = 4
) {
  let keyIndex = 0;
  const delays = [1000, 2000, 3000, 4000];

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const currentKey = apiKeys[keyIndex % apiKeys.length];
    const genAI = new GoogleGenerativeAI(currentKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    try {
      if (base64Data) {
        const contentParts: Part[] = [
          { inlineData: { mimeType: "application/pdf", data: base64Data } },
          { text: prompt },
        ];
        return await model.generateContent({ contents: [{ role: "user", parts: contentParts }] });
      } else {
        return await model.generateContent(prompt);
      }
    } catch (error) {
      console.error(`[Gemini] Key ${keyIndex % apiKeys.length + 1}, attempt ${attempt + 1} failed:`, error);

      if (attempt < maxRetries && isOverloadedError(error)) {
        keyIndex++; // rotate to next key
        const delay = delays[attempt] || 4000;
        console.log(`[Gemini] Rotating to key ${keyIndex % apiKeys.length + 1}, retrying after ${delay}ms...`);
        await sleep(delay);
        continue;
      }
      throw error;
    }
  }
  throw new Error("All API keys exhausted after retries");
}

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
    "professional",
    "career",
    "internship",
    "certificate",
    "training",
    "references",
    // Additional keywords for Indian/tech resumes
    "gpa",
    "cgpa",
    "intern",
    "developer",
    "engineer",
    "b.tech",
    "btech",
    "b.e",
    "mtech",
    "m.tech",
    "computer science",
    "information technology",
    "software",
    "coding",
    "programming",
    "java",
    "python",
    "react",
    "node",
  ];

  const textLower = text.toLowerCase();
  const keywordCount = resumeKeywords.filter((kw) =>
    textLower.includes(kw)
  ).length;

  // Check for name + email pattern (common in resumes)
  const hasEmailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasNamePattern = /[A-Z][a-z]+\s+[A-Z][a-z]+/.test(text);

  // Relaxed criteria: 2+ keywords OR (has name pattern AND email pattern)
  return keywordCount >= 2 || (hasEmailPattern && hasNamePattern);
}

// Pool of invalid document messages
const invalidDocumentMessages = [
  "Bhai, ye resume hai? Bijli ka bill upload kar diya kya?",
  "Uploaded document is as irrelevant as your 1st-year engineering syllabus.",
  "Tinder bio de diya kya? Because HR isn't swiping right on this either.",
  "Aadhaar card upload mat kar bhai, job CV pe milti hai.",
  "Kya Matlab? Kuch bhi upload karega?",
];

export async function POST(request: NextRequest) {
  // Wrap entire handler in try/catch for robustness
  try {
    // Collect all available API keys
    const apiKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
    ].filter(Boolean) as string[];

    if (apiKeys.length === 0) {
      return NextResponse.json(
        { error: "Server configuration error: No API keys configured" },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("resume") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are accepted" },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Convert file to buffer with error handling
    let bytes: ArrayBuffer;
    try {
      bytes = await file.arrayBuffer();
    } catch (readError) {
      console.error("[PDF Read] Failed to read file:", readError);
      return NextResponse.json(
        { error: "Failed to read file. The file may be corrupted." },
        { status: 400 }
      );
    }
    const buffer = Buffer.from(bytes);

    // Try to parse PDF text
    let pdfText = "";
    let useVisionMode = false;

    try {
      const data = await parsePDF(buffer);
      pdfText = data.text;
    } catch {
      // Text extraction failed - fall back to vision mode
      console.log("[PDF Parse] Text extraction failed, falling back to vision mode");
      useVisionMode = true;
    }

    // Check if we have meaningful text - if not, use vision mode
    if (!useVisionMode && (!pdfText || pdfText.trim().length < 50)) {
      console.log("[PDF Parse] Text too short (" + (pdfText?.length || 0) + " chars), using vision mode");
      useVisionMode = true;
    }

    let result;
    let visionAttemptCount = 0;
    let base64Data: string | undefined;

    // Prepare base64 data for vision mode if needed
    if (useVisionMode) {
      if (buffer.length > 4 * 1024 * 1024) {
        console.log("[Gemini] PDF too large, trimming to 4MB for vision mode");
        const trimmedBuffer = Buffer.from(buffer.subarray(0, 4 * 1024 * 1024));
        base64Data = trimmedBuffer.toString("base64");
      } else {
        base64Data = buffer.toString("base64");
      }
    }

    // Wrap Gemini calls in a retry loop for 503 errors
    const maxGeminiAttempts = 3;
    const delays = [1000, 2000, 4000];

    for (let attempt = 0; attempt < maxGeminiAttempts; attempt++) {
      try {
        if (useVisionMode) {
          // Vision mode: send raw PDF to Gemini
          console.log("[Gemini] Using vision mode with raw PDF, buffer size:", buffer.length);

          result = await callGeminiWithRetry(
            apiKeys,
            SYSTEM_PROMPT + "\n\n" + VISION_ANALYSIS_PROMPT,
            base64Data
          );
          visionAttemptCount = attempt + 1;
        } else {
          // Text mode: validate it's a resume first
          if (!looksLikeResume(pdfText)) {
            const randomMessage =
              invalidDocumentMessages[Math.floor(Math.random() * invalidDocumentMessages.length)];
            return NextResponse.json(
              {
                status: "invalid_document",
                message: randomMessage,
                error: "Invalid document uploaded",
              },
              { status: 400 }
            );
          }

          // Truncate very long resumes to avoid token limits
          const truncatedText = pdfText.slice(0, 15000);

          // Call Gemini API with text prompt
          console.log("[Gemini] Using text mode with extracted PDF text");
          result = await callGeminiWithRetry(
            apiKeys,
            SYSTEM_PROMPT + "\n\n" + ANALYSIS_PROMPT(truncatedText)
          );
        }

        // If we get here, the call succeeded - break out of retry loop
        break;
      } catch (error) {
        console.error(`[Gemini] Handler attempt ${attempt + 1} failed:`, error);

        // Only retry on 503/overload errors
        if (attempt < maxGeminiAttempts - 1 && isOverloadedError(error)) {
          const delay = delays[attempt] || 4000;
          console.log(`[Gemini] Handler retrying after ${delay}ms...`);
          await sleep(delay);
          continue;
        }

        // Don't retry on other errors - throw to outer handler
        throw error;
      }
    }

    if (!result) {
      throw new Error("Failed to get Gemini response after all retries");
    }

    // Process the response
    try {
      const analysisText = result.response.text().trim();

      let cleanedText = analysisText;

      // Remove markdown code block markers if present
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.slice(7);
      } else if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.slice(3);
      }
      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.slice(0, -3);
      }
      cleanedText = cleanedText.trim();

      // Parse the JSON response
      let analysis;
      try {
        analysis = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Response text:", cleanedText.substring(0, 500));

        // In vision mode, try one more time with a simplified prompt
        if (useVisionMode && visionAttemptCount > 0 && base64Data) {
          console.log("[Gemini] Vision mode JSON parse failed, attempting simplified retry...");
          try {
            const retryResult = await callGeminiWithRetry(
              apiKeys,
              SYSTEM_PROMPT + "\n\n" + VISION_ANALYSIS_PROMPT + "\n\n" + SIMPLIFIED_JSON_PROMPT,
              base64Data
            );

            const retryText = retryResult.response.text().trim();
            let retryCleaned = retryText;
            if (retryCleaned.startsWith("```json")) retryCleaned = retryCleaned.slice(7);
            else if (retryCleaned.startsWith("```")) retryCleaned = retryCleaned.slice(3);
            if (retryCleaned.endsWith("```")) retryCleaned = retryCleaned.slice(0, -3);
            retryCleaned = retryCleaned.trim();

            analysis = JSON.parse(retryCleaned);
            console.log("[Gemini] Simplified retry succeeded");
          } catch (retryError) {
            console.error("Simplified retry also failed:", retryError);
            throw new Error("Failed to parse analysis response after retry");
          }
        } else {
          // Try to extract JSON from the response if it added extra text
          try {
            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              analysis = JSON.parse(jsonMatch[0]);
              console.log("Successfully extracted JSON from response");
            } else {
              throw new Error("No JSON object found in response");
            }
          } catch (extractError) {
            console.error("Failed to extract JSON:", extractError);
            return NextResponse.json(
              { error: "Failed to parse analysis response. Please try again." },
              { status: 500 }
            );
          }
        }
      }

      // Check for invalid_document status from Gemini (in vision mode)
      if (analysis.status === "invalid_document") {
        return NextResponse.json(
          {
            status: "invalid_document",
            message: analysis.message || "This doesn't look like a resume. Please upload a valid CV.",
            error: "Invalid document uploaded",
          },
          { status: 400 }
        );
      }

      // Validate the response structure
      // Check if overallScore is present and >= 0 - if so, treat as valid response
      if (typeof analysis.overallScore === "number" && analysis.overallScore >= 0) {
        return NextResponse.json(analysis);
      }

      // If overallScore is missing, check for other essential fields
      if (!analysis.roastHeadline || !analysis.roastQuote) {
        return NextResponse.json(
          { error: "Invalid analysis response structure" },
          { status: 500 }
        );
      }

      // Accept responses even if missingSections is empty or detectedSections has all false values
      // These are valid for bad resumes
      return NextResponse.json(analysis);
    } catch (apiError) {
      console.error("Error processing Gemini response:", apiError);
      return NextResponse.json(
        { error: "Analysis failed. Please try again later." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error in POST handler:", error);

    // Check for specific error types to show user-friendly messages
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : "";

    // Service overload errors - show friendly retry message
    if (
      errorMessage.includes("503") ||
      errorMessage.includes("429") ||
      errorMessage.includes("overloaded") ||
      errorMessage.includes("rate limit") ||
      errorMessage.includes("too many requests") ||
      errorMessage.includes("resource exhausted")
    ) {
      return NextResponse.json(
        {
          error: "API busy hai abhi 😤 Thoda wait karo aur retry karo, ya Demo mode try karo",
          retryAfter: 5
        },
        { status: 503 }
      );
    }

    // Generic error - don't expose technical details
    return NextResponse.json(
      { error: "Something went wrong while analyzing your resume. Please try again." },
      { status: 500 }
    );
  }
}
