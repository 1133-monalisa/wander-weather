import { Variants } from "framer-motion";

export const SMOOTH_EASE: [number, number, number, number] = [
  0.25, 0.1, 0.25, 1,
];

// Viewport settings for scroll triggering
export const VIEWPORT_CONFIG = {
  once: true,
  amount: 0.2, // Trigger when 20% of element is visible
  margin: "0px 0px -50px 0px",
};

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

export const sectionUpVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: SMOOTH_EASE,
    },
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: SMOOTH_EASE },
  },
};

export const scaleUpVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.8, ease: SMOOTH_EASE },
  },
};
