"use client";

import { useState, type ImgHTMLAttributes } from "react";

import { cn } from "../lib/cn";

export interface ImageAssetProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "width" | "height"> {
  src: string;
  alt?: string;
  aspectRatio?: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}

export function ImageAsset({
  src,
  alt,
  aspectRatio,
  className,
  imgClassName,
  eager = false,
  ...rest
}: ImageAssetProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <img
        src={src}
        alt={alt ?? ""}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-[opacity,transform] duration-1000",
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-[1.04]",
          imgClassName,
        )}
        {...rest}
      />
    </div>
  );
}
