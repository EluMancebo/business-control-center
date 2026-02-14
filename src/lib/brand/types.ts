export type BrandPaletteKey = "bcc" | "ocean" | "sunset" | "mono";
export type BrandMode = "light" | "dark" | "system";

export type Brand = {
  brandName: string;
  palette: BrandPaletteKey;
  mode: BrandMode;
};
