"use client";

import { motion } from "motion/react";
import { usePathname } from "next/navigation";

/**
 * Non-blocking route fade. Previous version used `<AnimatePresence mode="wait">`
 * with a 280ms exit, which made every nav feel like 280–400ms of dead time
 * because the next page literally couldn't paint until the old one finished
 * exiting. We now key a single motion.div on the pathname and only animate
 * the *enter* — no exit, no AnimatePresence — so the new page paints
 * immediately and just fades in over 120ms.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.12, ease: "linear" }}
      className="contents"
    >
      {children}
    </motion.div>
  );
}
