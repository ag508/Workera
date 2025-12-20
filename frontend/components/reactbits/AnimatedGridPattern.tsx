'use client';

import { useEffect, useId, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface AnimatedGridPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  strokeDasharray?: string | number;
  numSquares?: number;
  className?: string;
  maxOpacity?: number;
  duration?: number;
  repeatDelay?: number;
}

export default function AnimatedGridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 30,
  className,
  maxOpacity = 0.3,
  duration = 4,
  repeatDelay = 1,
  ...props
}: AnimatedGridPatternProps) {
  // Extract repeatDelay to prevent it from being passed to SVG DOM element
  void repeatDelay;
  const id = useId();
  const containerRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const getPos = useCallback(() => {
    return [
      Math.floor((Math.random() * dimensions.width) / width),
      Math.floor((Math.random() * dimensions.height) / height),
    ];
  }, [dimensions, width, height]);

  const generateSquares = useCallback((count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      pos: [0, 0],
    }));
  }, []);

  const [squares, setSquares] = useState(() => generateSquares(numSquares));

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    const currentRef = containerRef.current;
    if (currentRef) {
      resizeObserver.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        resizeObserver.unobserve(currentRef);
      }
    };
  }, []);

  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSquares(
        generateSquares(numSquares).map((sq) => ({
          ...sq,
          pos: getPos(),
        }))
      );
    }
  }, [dimensions, numSquares, generateSquares, getPos]);

  return (
    <svg
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30 ${className}`}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      <svg x={x} y={y} className="overflow-visible">
        {squares.map(({ pos: [x, y] }, index) => (
          <motion.rect
            initial={{ opacity: 0 }}
            animate={{ opacity: maxOpacity }}
            transition={{
              duration,
              repeat: Infinity,
              delay: index * 0.1,
              repeatType: "reverse",
            }}
            onAnimationComplete={() => {
              const newSquares = [...squares];
              newSquares[index].pos = getPos();
              setSquares(newSquares);
            }}
            key={`${x}-${y}-${index}`}
            width={width - 1}
            height={height - 1}
            x={x * width + 1}
            y={y * height + 1}
            fill="currentColor"
            strokeWidth="0"
          />
        ))}
      </svg>
    </svg>
  );
}
