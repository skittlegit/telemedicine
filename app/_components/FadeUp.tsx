"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ReactNode } from "react";

/**
 * Subtle fade-up reveal for marketing sections. Tightened from the prior
 * 14px / 550ms editorial flourish to a 6px / 280ms clinical fade so the
 * page still feels alive without making the user wait. `whileInView` with
 * `once: true` so it only fires the first time.
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
      initial={reduce ? false : { opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.28, ease: "easeOut", delay }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
