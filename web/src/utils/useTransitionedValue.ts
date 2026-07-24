import { useState, useEffect } from "react";

export function useTransitionedValue(target: number, duration: number = 100): number {
  const [value, setValue] = useState(target);

  useEffect(() => {
    const startValue = value;
    const startTime = performance.now();
    let animationFrameId: number;

    const animate = () => {
      const now = performance.now();
      const elapsed = now - startTime;

      if (elapsed >= duration) {
        setValue(target);
      } else {
        const progress = elapsed / duration;
        setValue(startValue + (target - startValue) * progress);
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, duration]);

  return value;
}