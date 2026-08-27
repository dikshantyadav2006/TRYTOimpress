"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ImgHTMLAttributes } from "react";

import { cn } from "../../lib/cn";

export interface ParallaxImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "alt"> {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  strength?: number;
}

export function ParallaxImage({
  src,
  alt,
  className,
  imgClassName,
  strength = 28,
  ...rest
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div style={{ y }} className={cn("h-full w-full", imgClassName)}>
        <img src={src} alt={alt} className="h-full w-full scale-110 object-cover" {...rest} />
      </motion.div>
    </div>
  );
}
