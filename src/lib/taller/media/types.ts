export type AssetScope = "system" | "tenant";
export type AssetKind = "image" | "svg" | "video";
export type AssetStatus = "active" | "archived";

export type AssetItem = {
  _id: string;
  scope: AssetScope;
  kind: AssetKind;
  bucket: string;
  key: string;
  url: string;
  label: string;
  tags: string[];
  allowedIn: string[];
  mime: string;
  bytes: number;
  status: AssetStatus;
  createdAt?: string;
};

export type AssetListQuery = {
  businessId: null;
  scope: "system";
  status: AssetStatus;
  tags?: string;
};

export type AssetCreateInput = {
  businessId: null;
  scope: "system";
  kind: AssetKind;
  bucket: "vercel-blob";
  key: string;
  url: string;
  label: string;
  tags: string[];
  allowedIn: string[];
  mime: string;
  bytes: number;
  status: "active";
};
