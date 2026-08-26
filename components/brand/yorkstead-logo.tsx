import * as React from "react";

export function YorksteadMark({
  size = 24,
  className = "",
  ...props
}: { size?: number; className?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      {...props}
    >
      {/* Precision Industrial Monogram: Hexagonal Faceted 'Y' Core */}
      <rect width="32" height="32" rx="6" className="fill-card stroke-border" strokeWidth="1.5" />
      
      {/* Upper Left Prismatic Ray */}
      <path
        d="M8 8L16 16V24"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-foreground"
      />
      {/* Upper Right Prismatic Ray with Cyan Accent */}
      <path
        d="M24 8L16 16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      />
      {/* Center Precision Vertex Node */}
      <circle cx="16" cy="16" r="2" className="fill-primary" />
      {/* Baseline Anchor Accent */}
      <circle cx="16" cy="24" r="1.5" className="fill-foreground" />
    </svg>
  );
}

export function YorksteadLogoLockup({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <YorksteadMark size={size} />
      <div className="flex flex-col">
        <span className="font-mono text-sm font-bold tracking-[0.24em] text-foreground leading-none">
          YORKSTEAD<span className="text-primary">.SYSTEMS</span>
        </span>
      </div>
    </div>
  );
}
