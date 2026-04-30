import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Vellum Health",
    short_name: "Vellum",
    description:
      "Encrypted video consultations, signed digital prescriptions, and same-day pharmacy fulfilment.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F2E9",
    theme_color: "#F6F2E9",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
