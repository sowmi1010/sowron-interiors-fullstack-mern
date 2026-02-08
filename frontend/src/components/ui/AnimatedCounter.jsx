import { useEffect, useState } from "react";

export default function AnimatedCounter({ value, duration = 800 }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value || 0;
    const increment = end / (duration / 30);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(Math.floor(start));
    }, 20);

    return () => clearInterval(timer);
  }, [duration, value]);

  return count;
}
