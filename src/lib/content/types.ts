export type ContentBlockType = "hero" | "promo" | "card" | "popup";

export type ContentBlock = {
  id: string;
  type: ContentBlockType;
  title?: string;
  description?: string;
  mediaId?: string;
  overlayPresetId?: string;
  cta?: {
    label: string;
    href: string;
  };
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
};
