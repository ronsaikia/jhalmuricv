"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Navbar() {
  const router = useRouter();

  const handleSecretClick = () => {
    // Add unique query param to force fresh render
    router.push("/secret?v=" + Date.now());
  };

  return (
    <>
      {/* Orange-red solid line at top */}
      <div
        className="fixed top-0 left-0 right-0 z-[60] h-[4px] bg-[#e8441a] border-b-2 border-[#1a1a1a]"
      />

      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-[4px] left-0 right-0 z-50 bg-[#f0ede8] border-b-3 border-[#1a1a1a]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[64px]">
            {/* LEFT: Logo */}
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
            >
              <span className="font-mono font-bold text-xl text-[#1a1a1a]">
                🔥 Resume Roaster
              </span>
            </motion.div>

            {/* RIGHT: Warning badge + Made in India */}
            <div className="flex items-center gap-4">
              {/* Warning Badge - Button with router.push - NEOBRUTALIST STYLE */}
              <motion.button
                onClick={handleSecretClick}
                className="flex items-center gap-2 px-4 py-2 bg-[#ef4444] text-white
                         border-3 border-[#1a1a1a] font-bold font-mono text-xs
                         cursor-pointer select-none"
                style={{ boxShadow: '3px 3px 0px #1a1a1a' }}
                whileHover={{
                  x: 1,
                  y: 1,
                  boxShadow: '2px 2px 0px #1a1a1a'
                }}
                whileTap={{
                  x: 3,
                  y: 3,
                  boxShadow: '0px 0px 0px #1a1a1a'
                }}
                animate={{
                  rotate: [-1, 1, -1, 1, -1, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 2,
                }}
              >
                <span className="animate-pulse truncate max-w-[100px] sm:max-w-none">
                  NEAR YOU 👀
                </span>
              </motion.button>

            </div>
          </div>
        </div>
      </motion.nav>
    </>
  );
}
