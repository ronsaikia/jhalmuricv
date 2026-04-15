"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, File, Check, AlertCircle, X } from "lucide-react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClearFile: () => void;
}

export default function UploadZone({
  onFileSelect,
  selectedFile,
  onClearFile,
}: UploadZoneProps) {
  const [isHovered, setIsHovered] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.size > 5 * 1024 * 1024) {
          return;
        }
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const hasError = fileRejections.length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Terminal Window Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative rounded-xl overflow-hidden"
      >
        {/* Terminal Header */}
        <div className="glass border-b-0 rounded-t-xl">
          <div className="terminal-dots">
            <div className="terminal-dot terminal-dot-red" />
            <div className="terminal-dot terminal-dot-yellow" />
            <div className="terminal-dot terminal-dot-green" />
          </div>
        </div>

        {/* Upload Zone */}
        <div
          {...getRootProps()}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            relative border-2 border-dashed border-navy-700 bg-navy-900/50
            rounded-b-xl p-8 sm:p-12 transition-all duration-300 cursor-pointer
            ${isDragActive ? "border-electric-500 bg-electric-500/5" : ""}
            ${isHovered ? "border-electric-600" : ""}
            ${hasError ? "border-red-500 bg-red-500/5" : ""}
          `}
        >
          <input {...getInputProps()} />

          {/* Animated Border Gradient */}
          {(isDragActive || isHovered) && (
            <motion.div
              layoutId="border-glow"
              className="absolute inset-0 rounded-b-xl pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, #2563eb, #3b82f6, #2563eb)",
                backgroundSize: "200% 100%",
                opacity: 0.3,
                filter: "blur(8px)",
              }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          )}

          <AnimatePresence mode="wait">
            {selectedFile ? (
              <motion.div
                key="file-selected"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative z-10 flex flex-col items-center gap-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center"
                >
                  <Check className="w-8 h-8 text-green-500" />
                </motion.div>

                <div className="text-center">
                  <p className="text-white font-medium flex items-center gap-2 justify-center">
                    <File className="w-4 h-4 text-electric-500" />
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-accent-slate mt-1">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearFile();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400
                           hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Remove file
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="upload-prompt"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative z-10 flex flex-col items-center gap-4"
              >
                <motion.div
                  animate={{
                    y: isDragActive ? [0, -5, 0] : [0, -3, 0],
                  }}
                  transition={{
                    duration: isDragActive ? 0.3 : 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-16 h-16 rounded-full bg-navy-800 flex items-center justify-center"
                >
                  <Upload
                    className={`w-8 h-8 transition-colors ${
                      isDragActive ? "text-electric-500" : "text-accent-slate"
                    }`}
                  />
                </motion.div>

                <div className="text-center">
                  <p className="text-white font-medium">
                    {isDragActive
                      ? "Drop your resume here!"
                      : "Drop your resume PDF here"}
                  </p>
                  <p className="text-sm text-accent-slate mt-1">
                    or click to browse files
                  </p>
                  <p className="text-xs text-accent-slate/60 mt-2">
                    PDF only, max 5MB
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Error Messages */}
      <AnimatePresence>
        {hasError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 flex items-center gap-2 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            <span>
              {fileRejections[0]?.errors[0]?.code === "file-too-large"
                ? "File size exceeds 5MB limit"
                : "Please upload a valid PDF file"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
