'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltedCardProps {
  children: React.ReactNode;
  className?: string;
  rotateAmplitude?: number;
  scaleOnHover?: number;
}

export default function TiltedCard({
  children,
  className = '',
  rotateAmplitude = 12,
  scaleOnHover = 1.05,
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const z = useMotionValue(0);

  const rotateX = useTransform(y, [-0.5, 0.5], [rotateAmplitude, -rotateAmplitude]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-rotateAmplitude, rotateAmplitude]);
  const scale = useSpring(1, { stiffness: 200, damping: 10 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate mouse position relative to center (-0.5 to 0.5)
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;

    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseEnter = () => {
    scale.set(scaleOnHover);
    z.set(50);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    scale.set(1);
    z.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative preserve-3d cursor-pointer ${className}`}
      style={{
        rotateX,
        rotateY,
        scale,
        z,
        transformStyle: 'preserve-3d',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}
