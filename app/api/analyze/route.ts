import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { SYSTEM_PROMPT, ANALYSIS_PROMPT } from "@/lib/analyzePrompt";

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

    let fullText = textParts
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

// Retry wrapper for Gemini API call
async function callGeminiWithRetry(
  genAI: GoogleGenerativeAI,
  prompt: string,
  base64Data?: string,
  retries = 1
): Promise<ReturnType<ReturnType<GoogleGenerativeAI["getGenerativeModel"]>["generateContent"]>> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    if (base64Data) {
      // Vision mode: send PDF as inline data with text prompt
      const contentParts: Part[] = [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: base64Data,
          },
        },
        { text: prompt },
      ];
      return await model.generateContent({
        contents: [{ role: "user", parts: contentParts }],
      });
    } else {
      // Text mode: send text prompt only
      return await model.generateContent(prompt);
    }
  } catch (error) {
    console.error("[Gemini] Initial call failed:", error);
    if (retries > 0) {
      console.log(`[Gemini] Retrying after 1000ms... (${retries} retries left)`);
      await sleep(1000);
      return callGeminiWithRetry(genAI, prompt, base64Data, retries - 1);
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
    // Check API key and initialize genAI lazily
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set!");
      return NextResponse.json(
        { error: "Server configuration error: API key not configured" },
        { status: 500 }
      );
    }

    // Initialize genAI inside the handler for lazy loading
    const genAI = new GoogleGenerativeAI(apiKey);

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
      console.log("[Gemini] Using vision mode with raw PDF, buffer size:", buffer.length);

      // Check if buffer is small enough for inline data (Gemini has limits)
      let base64Data: string;
      if (buffer.length > 4 * 1024 * 1024) {
        // Too large - trim to first 4MB
        console.log("[Gemini] PDF too large, trimming to 4MB for vision mode");
        const trimmedBuffer = Buffer.from(buffer.subarray(0, 4 * 1024 * 1024));
        base64Data = trimmedBuffer.toString("base64");
      } else {
        base64Data = buffer.toString("base64");
      }

      result = await callGeminiWithRetry(
        genAI,
        SYSTEM_PROMPT + "\n\n" + ANALYSIS_PROMPT(""),
        base64Data
      );
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
        genAI,
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
