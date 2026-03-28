import type { MediaAsset } from "@/lib/media/types";

type MockMediaAsset = MediaAsset & {
  collection: "generic" | "client" | "sector" | "creative";
};

export const MOCK_MEDIA_ASSETS: MockMediaAsset[] = [
  {
    id: "img-1",
    type: "image",
    url: "https://picsum.photos/1200/600?1",
    createdAt: "2026-03-01T09:00:00.000Z",
    collection: "generic",
    metadata: {
      dominantColor: "#3b82f6",
      brightness: "medium",
      contrast: "medium",
      suggestedOverlay: "soft",
    },
  },
  {
    id: "img-2",
    type: "image",
    url: "https://picsum.photos/1200/600?2",
    createdAt: "2026-03-02T09:00:00.000Z",
    collection: "generic",
    metadata: {
      dominantColor: "#0f172a",
      brightness: "low",
      contrast: "high",
      suggestedOverlay: "medium",
    },
  },
  {
    id: "img-3",
    type: "image",
    url: "https://picsum.photos/1200/600?3",
    createdAt: "2026-03-03T09:00:00.000Z",
    collection: "client",
    metadata: {
      dominantColor: "#16a34a",
      brightness: "high",
      contrast: "medium",
      suggestedOverlay: "soft",
    },
  },
  {
    id: "img-4",
    type: "image",
    url: "https://picsum.photos/1200/600?4",
    createdAt: "2026-03-04T09:00:00.000Z",
    collection: "sector",
    metadata: {
      dominantColor: "#f97316",
      brightness: "medium",
      contrast: "high",
      suggestedOverlay: "strong",
    },
  },
  {
    id: "img-5",
    type: "image",
    url: "https://picsum.photos/1200/600?5",
    createdAt: "2026-03-05T09:00:00.000Z",
    collection: "creative",
    metadata: {
      dominantColor: "#a855f7",
      brightness: "low",
      contrast: "medium",
      suggestedOverlay: "strong",
    },
  },
  {
    id: "img-6",
    type: "image",
    url: "https://picsum.photos/1200/600?6",
    createdAt: "2026-03-06T09:00:00.000Z",
    collection: "client",
    metadata: {
      dominantColor: "#dc2626",
      brightness: "high",
      contrast: "low",
      suggestedOverlay: "none",
    },
  },
  {
    id: "logo-1",
    type: "image",
    url: "https://picsum.photos/600/600?logo-1",
    createdAt: "2026-03-07T09:00:00.000Z",
    collection: "client",
    metadata: {
      dominantColor: "#111827",
      brightness: "medium",
      contrast: "high",
      suggestedOverlay: "none",
    },
  },
  {
    id: "logo-2",
    type: "image",
    url: "https://picsum.photos/600/600?logo-2",
    createdAt: "2026-03-08T09:00:00.000Z",
    collection: "creative",
    metadata: {
      dominantColor: "#ffffff",
      brightness: "high",
      contrast: "high",
      suggestedOverlay: "soft",
    },
  },
];
