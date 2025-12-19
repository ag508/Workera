'use client';

import { useEffect, useRef } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';

interface LottieAnimationProps {
  animationData?: object;
  src?: string;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onComplete?: () => void;
  speed?: number;
}

export function LottieAnimation({
  animationData,
  src,
  loop = true,
  autoplay = true,
  className = '',
  style,
  onComplete,
  speed = 1,
}: LottieAnimationProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(speed);
    }
  }, [speed]);

  if (!animationData && !src) {
    return null;
  }

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      path={src}
      loop={loop}
      autoplay={autoplay}
      className={className}
      style={style}
      onComplete={onComplete}
    />
  );
}

// Pre-defined animation data for common use cases
export const animations = {
  // Hiring/Recruitment themed animation data
  hiring: {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 90,
    w: 400,
    h: 400,
    nm: "Hiring Animation",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Circle",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 1, k: [{ t: 0, s: [0], h: 0 }, { t: 90, s: [360] }] },
          p: { a: 0, k: [200, 200, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 1, k: [{ t: 0, s: [100, 100, 100] }, { t: 45, s: [110, 110, 100] }, { t: 90, s: [100, 100, 100] }] }
        },
        shapes: [
          {
            ty: "el",
            s: { a: 0, k: [100, 100] },
            p: { a: 0, k: [0, 0] },
            nm: "Ellipse"
          },
          {
            ty: "st",
            c: { a: 0, k: [0.063, 0.725, 0.506, 1] },
            o: { a: 0, k: 100 },
            w: { a: 0, k: 8 },
            lc: 2,
            lj: 1,
            nm: "Stroke"
          }
        ]
      }
    ]
  },
  // Success checkmark animation
  success: {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 60,
    w: 200,
    h: 200,
    nm: "Success",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Check",
        sr: 1,
        ks: {
          o: { a: 1, k: [{ t: 0, s: [0] }, { t: 15, s: [100] }] },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [100, 100, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 1, k: [{ t: 0, s: [0, 0, 100] }, { t: 30, s: [100, 100, 100] }] }
        },
        shapes: [
          {
            ty: "el",
            s: { a: 0, k: [80, 80] },
            p: { a: 0, k: [0, 0] },
            nm: "Ellipse"
          },
          {
            ty: "fl",
            c: { a: 0, k: [0.063, 0.725, 0.506, 1] },
            o: { a: 0, k: 100 },
            nm: "Fill"
          }
        ]
      }
    ]
  },
  // Loading dots animation
  loading: {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 60,
    w: 100,
    h: 40,
    nm: "Loading",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Dot1",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [20, 20, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 1, k: [{ t: 0, s: [100, 100, 100] }, { t: 15, s: [140, 140, 100] }, { t: 30, s: [100, 100, 100] }] }
        },
        shapes: [
          {
            ty: "el",
            s: { a: 0, k: [10, 10] },
            p: { a: 0, k: [0, 0] },
            nm: "Ellipse"
          },
          {
            ty: "fl",
            c: { a: 0, k: [0.063, 0.725, 0.506, 1] },
            o: { a: 0, k: 100 },
            nm: "Fill"
          }
        ]
      },
      {
        ddd: 0,
        ind: 2,
        ty: 4,
        nm: "Dot2",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [50, 20, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 1, k: [{ t: 10, s: [100, 100, 100] }, { t: 25, s: [140, 140, 100] }, { t: 40, s: [100, 100, 100] }] }
        },
        shapes: [
          {
            ty: "el",
            s: { a: 0, k: [10, 10] },
            p: { a: 0, k: [0, 0] },
            nm: "Ellipse"
          },
          {
            ty: "fl",
            c: { a: 0, k: [0.063, 0.725, 0.506, 1] },
            o: { a: 0, k: 100 },
            nm: "Fill"
          }
        ]
      },
      {
        ddd: 0,
        ind: 3,
        ty: 4,
        nm: "Dot3",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [80, 20, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 1, k: [{ t: 20, s: [100, 100, 100] }, { t: 35, s: [140, 140, 100] }, { t: 50, s: [100, 100, 100] }] }
        },
        shapes: [
          {
            ty: "el",
            s: { a: 0, k: [10, 10] },
            p: { a: 0, k: [0, 0] },
            nm: "Ellipse"
          },
          {
            ty: "fl",
            c: { a: 0, k: [0.063, 0.725, 0.506, 1] },
            o: { a: 0, k: 100 },
            nm: "Fill"
          }
        ]
      }
    ]
  }
};
