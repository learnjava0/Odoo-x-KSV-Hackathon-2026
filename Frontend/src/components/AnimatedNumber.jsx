import { useEffect, useRef, useState } from 'react';

export default function AnimatedNumber({ value = 0, formatter = (number) => number.toLocaleString() }) {
  const numericValue = Number(value) || 0;
  const previousValue = useRef(0);
  const [displayValue, setDisplayValue] = useState(previousValue.current);

  useEffect(() => {
    const startValue = previousValue.current;
    const difference = numericValue - startValue;
    const duration = 700;
    let animationFrame;
    let startTime;

    const animate = (time) => {
      startTime ??= time;
      const progress = Math.min((time - startTime) / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startValue + difference * easedProgress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        previousValue.current = numericValue;
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [numericValue]);

  return formatter(displayValue);
}
