import Image from "next/image";
import * as React from "react";

export function YorksteadMark({
  size = 24,
  className = "",
  ...props
}: { size?: number; className?: string } & Omit<React.ComponentProps<typeof Image>, "src" | "alt" | "width" | "height">) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-block shrink-0 ${className}`}
      style={{ width: size, height: size }}
      {...props}
    >
      <Image
        src="/brand/logo/yorkstead-transparent-light.png"
        alt=""
      width={size}
      height={size}
        className="size-full object-contain dark:hidden"
        priority
      />
      <Image
        src="/brand/logo/yorkstead-transparent-dark.png"
        alt=""
        width={size}
        height={size}
        className="hidden size-full object-contain dark:block"
        priority
      />
    </span>
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
