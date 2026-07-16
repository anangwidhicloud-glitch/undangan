'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 130,
    damping: 28,
    mass: 0.25,
  });
  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 right-0 left-0 z-[70] h-[3px] origin-left bg-gradient-to-r from-[#7f5f24] via-[#e9cf8f] to-[#9b7735]"
      style={{ scaleX }}
    />
  );
}
