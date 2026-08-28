import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export function YorksteadIcon({ canvasSize = 512 }: { canvasSize?: number }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#0d1117", borderRadius: `${canvasSize * 0.1875}px`, border: `${canvasSize * 0.046875}px solid #30363d` }}>
      <svg width={canvasSize * 0.6640625} height={canvasSize * 0.6640625} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 8L16 16V24" stroke="#f0f6fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M24 8L16 16" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="16" cy="16" r="2" fill="#38bdf8" />
        <circle cx="16" cy="24" r="1.5" fill="#f0f6fc" />
      </svg>
    </div>
  );
}

export default function Icon() {
  return new ImageResponse(<YorksteadIcon />, size);
}
