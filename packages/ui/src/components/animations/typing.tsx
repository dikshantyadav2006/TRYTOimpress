"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "../../lib/cn";

export interface TypingProps {
  text: string;
  speed?: number;
  startDelay?: number;
  className?: string;
  cursorClassName?: string;
  onComplete?: () => void;
}

export function Typing({
  text,
  speed = 55,
  startDelay = 0,
  className,
  cursorClassName,
  onComplete,
}: TypingProps) {
  const [count, setCount] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setCount(0);
    let timeout: number;
    let index = 0;

    const tick = () => {
      index += 1;
      setCount(index);
      if (index >= text.length) {
        window.setTimeout(() => onCompleteRef.current?.(), 150);
        return;
      }
      timeout = window.setTimeout(tick, speed);
    };

    timeout = window.setTimeout(tick, startDelay);
    return () => window.clearTimeout(timeout);
  }, [text, speed, startDelay]);

  const done = count >= text.length;

  return (
    <span className={className}>
      {text.slice(0, count)}
      <span
        aria-hidden
        className={cn(
          "text-pink-300",
          done ? "opacity-0" : "animate-pulse",
          cursorClassName,
        )}
      >
        |
      </span>
    </span>
  );
}
