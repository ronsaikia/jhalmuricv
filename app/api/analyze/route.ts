import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { SYSTEM_PROMPT, ANALYSIS_PROMPT } from "@/lib/analyzePrompt";

// PDF parsing requires Node.js runtime
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Check API key at startup
if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Sleep helper for retry logic
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Parse PDF with multiple fallback strategies
async function parsePDF(buffer: Buffer): Promise<{ text: string }> {
  const errors: string[] = [];

  // Strategy 1: Try pdf-parse package (most reliable when it works)
  try {
    console.log("[PDF Parse] Attempting pdf-parse strategy...");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    const result = await pdfParse(buffer);
    if (result.text && result.text.trim().length > 0) {
      console.log("[PDF Parse] pdf-parse succeeded, extracted", result.text.length, "chars");
      return { text: result.text };
    }
    throw new Error("pdf-parse returned empty text");
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[PDF Parse] pdf-parse failed:", msg);
    errors.push(`pdf-parse: ${msg}`);
  }

  // Strategy 2: Try pdfjs-dist legacy build
  try {
    console.log("[PDF Parse] Attempting pdfjs-dist legacy build...");
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

    // Disable worker in Node.js
    pdfjs.GlobalWorkerOptions.workerSrc = "";

    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjs.getDocument({
      data: uint8Array,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const pdfDocument = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => (item as { str: string }).str)
        .filter((str) => str && str.length > 0)
        .join(" ");
      fullText += pageText + "\n";
    }

    if (fullText.trim().length > 0) {
      console.log("[PDF Parse] pdfjs-dist legacy succeeded, extracted", fullText.length, "chars");
      return { text: fullText };
    }
    throw new Error("pdfjs-dist legacy returned empty text");
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[PDF Parse] pdfjs-dist legacy failed:", msg);
    errors.push(`pdfjs-dist legacy: ${msg}`);
  }

  // Strategy 3: Try pdfjs-dist standard build
  try {
    console.log("[PDF Parse] Attempting pdfjs-dist standard build...");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfjs: typeof import("pdfjs-dist") = await import("pdfjs-dist/build/pdf.mjs" as string);

    // Disable worker in Node.js
    pdfjs.GlobalWorkerOptions.workerSrc = "";

    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjs.getDocument({
      data: uint8Array,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const pdfDocument = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pageText = textContent.items
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => item.str as string)
        .filter((str: string) => str && str.length > 0)
        .join(" ");
      fullText += pageText + "\n";
    }

    if (fullText.trim().length > 0) {
      console.log("[PDF Parse] pdfjs-dist standard succeeded, extracted", fullText.length, "chars");
      return { text: fullText };
    }
    throw new Error("pdfjs-dist standard returned empty text");
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[PDF Parse] pdfjs-dist standard failed:", msg);
    errors.push(`pdfjs-dist standard: ${msg}`);
  }

  // All strategies failed
  console.error("[PDF Parse] All strategies failed:", errors);
  throw new Error(`Could not read PDF. Make sure it's not image-only or corrupted.`);
}

// Retry wrapper for Gemini API call - accepts text prompt or content parts
async function callGeminiWithRetry(
  prompt: string | Part[],
  retries = 1
): Promise<ReturnType<ReturnType<GoogleGenerativeAI["getGenerativeModel"]>["generateContent"]>> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    if (typeof prompt === "string") {
      return await model.generateContent(prompt);
    } else {
      // Multimodal: pass content parts with proper content structure
      return await model.generateContent({
        contents: [{ role: "user", parts: prompt }],
      });
    }
  } catch (error) {
    console.error("[Gemini] Initial call failed:", error);
    if (retries > 0) {
      console.log(`[Gemini] Retrying after 1000ms... (${retries} retries left)`);
      await sleep(1000);
      return callGeminiWithRetry(prompt, retries - 1);
    }
    throw error;
  }
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
  ];

  const textLower = text.toLowerCase();
  const keywordCount = resumeKeywords.filter((kw) =>
    textLower.includes(kw)
  ).length;

  // If less than 3 resume keywords found, likely not a resume
  // Also check for minimum length
  return keywordCount >= 3 && text.length > 300;
}

// Pool of invalid document messages
const invalidDocumentMessages = [
  "Bhai, ye resume hai? Bijli ka bill upload kar diya kya?",
  "Uploaded document is as irrelevant as your 1st-year engineering syllabus.",
  "Did you just upload your Tinder bio? Because HR isn't swiping right on this either.",
  "Aadhaar card upload mat kar bhai, job CV pe milti hai.",
  "System confused: Is this a resume or a grocery list? Go back and upload a real CV.",
];

export async function POST(request: NextRequest) {
  // Wrap entire handler in try/catch for robustness
  try {
    // Check API key early
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Server configuration error: API key not configured" },
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

    if (useVisionMode) {
      // Vision mode: send raw PDF to Gemini
      console.log("[Gemini] Using vision mode with raw PDF");
      const base64Data = buffer.toString("base64");

      const contentParts: Part[] = [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: base64Data,
          },
        },
        { text: SYSTEM_PROMPT + "\n\n" + ANALYSIS_PROMPT("") },
      ];

      result = await callGeminiWithRetry(contentParts);
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
        SYSTEM_PROMPT + "\n\n" + ANALYSIS_PROMPT(truncatedText)
      );
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

      // Validate the response structure
      if (!analysis.overallScore && analysis.overallScore !== 0) {
        return NextResponse.json(
          { error: "Invalid analysis response structure" },
          { status: 500 }
        );
      }

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
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
