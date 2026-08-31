export interface ImagePlaceholderProps {
  src?: string;
  alt?: string;
  className?: string;
}

export function ImagePlaceholder({
  src,
  alt = "Cute illustration",
  className,
}: ImagePlaceholderProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`h-auto w-full rounded-3xl object-contain ${className ?? ""}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`bg-surface relative aspect-square w-full overflow-hidden rounded-3xl ${className ?? ""}`}
    >
      <div className="bg-linear-to-br absolute inset-0 from-pink-500/30 via-rose-500/20 to-purple-500/30" />
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="plushie" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>
        <ellipse cx="100" cy="138" rx="46" ry="18" fill="#000000" opacity="0.18" />
        <circle cx="100" cy="104" r="52" fill="url(#plushie)" />
        <circle cx="68" cy="80" r="18" fill="#fda4af" />
        <circle cx="132" cy="80" r="18" fill="#fda4af" />
        <circle cx="80" cy="96" r="3.4" fill="#121315" />
        <circle cx="120" cy="96" r="3.4" fill="#121315" />
        <path
          d="M90 118 Q100 128 110 118"
          stroke="#121315"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <text x="150" y="52" fontSize="22">
          💖
        </text>
        <text x="34" y="60" fontSize="16">
          💕
        </text>
        <text x="46" y="180" fontSize="16">
          ✨
        </text>
      </svg>
      <span className="bg-background/60 text-foreground absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm">
        our story 💌
      </span>
    </div>
  );
}
