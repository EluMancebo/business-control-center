export type MediaAsset = {
  id: string;
  type: "image" | "svg";
  url: string;
  width?: number;
  height?: number;
  metadata?: {
    dominantColor?: string;
    brightness?: "low" | "medium" | "high";
    contrast?: "low" | "medium" | "high";
    suggestedOverlay?: string;
  };
  variants?: {
    original?: string;
    optimized?: string;
    svg?: string;
  };
  createdAt: string;
};
