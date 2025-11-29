'use client';

import { motion } from 'framer-motion';

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function BlurText({ text, className = '', delay = 0.05 }: BlurTextProps) {
  const words = text.split(' ');

  const variants = {
    hidden: { filter: 'blur(10px)', opacity: 0, y: 5 },
    visible: { filter: 'blur(0px)', opacity: 1, y: 0 },
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {words.map((word, idx) => (
        <motion.span
          key={idx}
          className="inline-block"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: idx * delay, duration: 0.4, ease: 'easeOut' }}
          variants={variants}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}
