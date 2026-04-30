"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactNode } from "react";

/**
 * Generic fade-up reveal. Pass `delay` in seconds to stagger.
 */
export function FadeUp({
  children,
  delay = 0,
  className = "",
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "article" | "header";
}) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];
  return (
    <MotionTag
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
