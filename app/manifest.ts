import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

const iconVersion = "yorkstead-y-20260828";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${brand.name} — ${brand.descriptor}`,
    short_name: "Yorkstead Ops",
    description: "Yorkstead Operations commercial operations platform.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0d1117",
    theme_color: "#0d1117",
    icons: [
      { src: `/icon?v=${iconVersion}`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `/icon?v=${iconVersion}`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
