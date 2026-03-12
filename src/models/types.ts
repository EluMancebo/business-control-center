export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface BrandingConfig {
  businessId: string;
  logoUrl?: string;
  palette: ColorPalette;
  mode: 'monochromatic' | 'analogous' | 'complementary' | 'split-complementary' | 'triadic' | 'tetradic';
  status: 'draft' | 'published';
}

export interface SectionVariant {
  id: string;
  name: string;
  payloadSchema: Record<string, unknown>; // JSON Schema para validación, usando unknown en lugar de any para lint riguroso
}   