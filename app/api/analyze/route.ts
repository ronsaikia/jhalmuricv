import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT, ANALYSIS_PROMPT } from "@/lib/analyzePrompt";

// PDF parsing requires Node.js runtime
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Check API key at startup
if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Parse PDF using pdfjs-dist
async function parsePDF(buffer: Buffer): Promise<{ text: string }> {
  try {
    // Use legacy build for Node.js compatibility
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");

    // Convert Buffer to Uint8Array
    const uint8Array = new Uint8Array(buffer);

    // Load the PDF document
    const loadingTask = pdfjs.getDocument({
      data: uint8Array,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const pdfDocument = await loadingTask.promise;

    // Extract text from all pages
    let fullText = "";
    const numPages = pdfDocument.numPages;

    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => (item as { str: string }).str)
        .join(" ");
      fullText += pageText + "\n";
    }

    return { text: fullText };
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to parse PDF: " + (error as Error).message);
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
  // Check API key early
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Server configuration error: API key not configured" },
      { status: 500 }
    );
  }

  try {
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

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse PDF text
    let pdfText: string;
    try {
      const data = await parsePDF(buffer);
      pdfText = data.text;
    } catch (parseError) {
      console.error("PDF parsing error:", parseError);
      return NextResponse.json(
        { error: "Could not read PDF. Make sure it's not image-only or corrupted." },
        { status: 400 }
      );
    }

    // Check if we have meaningful text
    if (!pdfText || pdfText.trim().length < 50) {
      return NextResponse.json(
        { error: "PDF contains too little text. It may be image-based or scanned." },
        { status: 400 }
      );
    }

    // Validate that this looks like a resume
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

    // Call Gemini API
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(
        SYSTEM_PROMPT + "\n\n" + ANALYSIS_PROMPT(truncatedText)
      );
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
      console.error("Gemini API error:", apiError);
      return NextResponse.json(
        { error: "Analysis failed. Please try again later." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
