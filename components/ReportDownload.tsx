"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, RotateCcw } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ResumeAnalysis } from "@/lib/types";

interface ReportDownloadProps {
  analysis: ResumeAnalysis;
}

export default function ReportDownload({ analysis }: ReportDownloadProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!reportRef.current) return;

    setIsGenerating(true);

    try {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: "#020817",
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("resume-roast-report.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    sessionStorage.removeItem("resumeAnalysis");
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleDownload}
        disabled={isGenerating}
        className="btn-primary flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            Generating PDF...
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            Download Roast Report
          </>
        )}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleReset}
        className="px-8 py-4 border border-navy-700 text-white font-semibold rounded-lg
                 transition-all duration-300 hover:border-electric-600 hover:bg-electric-600/10
                 active:scale-95 flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-5 h-5" />
        Roast Another Resume
      </motion.button>

      {/* Hidden report container for PDF generation */}
      <div
        ref={reportRef}
        className="fixed -left-[9999px] top-0 w-[800px] p-8 bg-navy-950"
        style={{ position: "absolute", left: "-9999px" }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Resume Roast Report</h1>
          <p className="text-accent-slate">AI-Powered Resume Analysis</p>
        </div>

        <div className="space-y-6">
          {/* Overall Score */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">Overall Score: {analysis.overallScore}/100</h2>
          </div>

          {/* Roast */}
          <div className="bg-navy-900 p-4 rounded-lg border border-navy-800">
            <h3 className="text-lg font-bold text-orange-500 mb-2">{analysis.roastHeadline}</h3>
            <p className="text-accent-slate">{analysis.roastQuote}</p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Category Scores</h3>
            <div className="space-y-2">
              {Object.entries(analysis.categories).map(([key, cat]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-accent-slate">{key}</span>
                  <span className="text-white font-mono">{cat.score}/{cat.maxScore}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          <div>
            <h3 className="text-lg font-bold text-green-500 mb-2">Top Strengths</h3>
            <ul className="list-disc pl-5 text-accent-slate">
              {analysis.topStrengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          {/* Critical Fixes */}
          <div>
            <h3 className="text-lg font-bold text-red-500 mb-2">Critical Fixes</h3>
            <ul className="list-disc pl-5 text-accent-slate">
              {analysis.criticalFixes.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>

          {/* Action Plan */}
          <div>
            <h3 className="text-lg font-bold text-white mb-3">Action Plan</h3>
            <div className="space-y-2">
              {analysis.actionPlan.map((action, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    action.priority === "HIGH" ? "bg-red-500 text-white" :
                    action.priority === "MEDIUM" ? "bg-yellow-500 text-black" :
                    "bg-blue-500 text-white"
                  }`}>
                    {action.priority}
                  </span>
                  <span className="text-accent-slate">{action.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
