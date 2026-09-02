import type { MetadataRoute } from "next";
import { brand } from "@/lib/brand";

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
      { src: "/brand/logo/yorkstead-dark.png", sizes: "516x516", type: "image/png", purpose: "any" },
      { src: "/brand/logo/yorkstead-dark.png", sizes: "516x516", type: "image/png", purpose: "maskable" },
    ],
  };
}
