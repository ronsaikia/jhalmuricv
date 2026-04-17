"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Navbar() {
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
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/favicon.svg"
                  alt="JhalmuriCV Flame"
                  width={32}
                  height={32}
                  className="inline-block"
                />
                <span
                  className="font-syne font-black text-3xl text-[#1a1a1a] tracking-tight"
                  style={{ fontFamily: 'var(--font-syne)' }}
                >
                  JhalmuriCV
                </span>
              </Link>
            </motion.div>

            {/* RIGHT: Warning badge + Made in India */}
            <div className="flex items-center gap-4">
              {/* Warning Badge - Link to secret page - NEOBRUTALIST STYLE */}
              <Link href="/secret">
              <motion.button
                title="Click to discover who's watching 👀"
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
              </Link>

            </div>
          </div>
        </div>
      </motion.nav>
    </>
  );
}
