export type HeroPresetStatus = "active" | "archived";

export type HeroData = {
  badge: string;
  title: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  backgroundImageUrl: string;
  logoUrl: string;
  logoSvg: string;
};

export type HeroPresetItem = {
  _id: string;
  key: string;
  label: string;
  description?: string;
  tags?: string[];
  status: HeroPresetStatus;
  data: HeroData;
  createdAt?: string;
  updatedAt?: string;
};

export type HeroPresetListResponse = {
  ok: boolean;
  items?: HeroPresetItem[];
  error?: string;
};

export type HeroPresetDetailResponse = {
  ok: boolean;
  item?: HeroPresetItem;
  error?: string;
};

export type HeroPresetListQuery = {
  status: HeroPresetStatus;
  tag?: string;
};

export type HeroPresetCreateInput = {
  key: string;
  label: string;
  description: string;
  tags: string[];
  status: "active";
  data: HeroData;
};

export type HeroPresetUpdateInput = {
  label?: string;
  description?: string;
  tags?: string[];
  status?: HeroPresetStatus;
  data?: HeroData;
};

export type ParseResult<T> = { ok: true; data: T } | { ok: false; error: string };
