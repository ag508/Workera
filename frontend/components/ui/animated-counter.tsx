'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
  decimals?: number;
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  duration = 2,
  className = '',
  decimals = 0,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [hasAnimated, setHasAnimated] = useState(false);

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const display = useTransform(spring, (current) =>
    `${prefix}${current.toFixed(decimals)}${suffix}`
  );

  useEffect(() => {
    if (isInView && !hasAnimated) {
      spring.set(value);
      setHasAnimated(true);
    }
  }, [isInView, value, spring, hasAnimated]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}

interface StatCardProps {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  className?: string;
}

export function StatCard({
  value,
  label,
  suffix = '',
  prefix = '',
  icon,
  trend,
  className = '',
}: StatCardProps) {
  return (
    <div className={`stat-card group ${className}`}>
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className="icon-box icon-box-lg icon-primary rounded-xl group-hover:scale-110 transition-transform">
            {icon}
          </div>
        )}
        {trend && (
          <span className={`stat-trend ${trend.isPositive ? 'stat-trend-up' : 'stat-trend-down'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <div className="stat-value">
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
