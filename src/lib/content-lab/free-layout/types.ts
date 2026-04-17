export type FreeLayoutSlotId =
  | "nav"
  | "headline"
  | "subheadline"
  | "ctaGroup"
  | "visual"
  | "footer";

export type FreeLayoutViewportId = "mobile" | "tablet" | "desktop" | "wide";

export type FreeLayoutAnchor =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export type FreeLayoutRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FreeLayoutSlot = {
  id: FreeLayoutSlotId;
  rect: FreeLayoutRect;
  anchor: FreeLayoutAnchor;
  zIndex: number;
  locked?: boolean;
};

export type FreeLayoutViewport = {
  viewport: FreeLayoutViewportId;
  slots: FreeLayoutSlot[];
};

export type FreeLayoutDraft = {
  version: 1;
  viewports: FreeLayoutViewport[];
};

const VIEWPORTS: FreeLayoutViewportId[] = [
  "mobile",
  "tablet",
  "desktop",
  "wide",
];

const SLOT_IDS: FreeLayoutSlotId[] = [
  "nav",
  "headline",
  "subheadline",
  "ctaGroup",
  "visual",
  "footer",
];

const MIN_Z_INDEX = 0;
const MAX_Z_INDEX = 12;

const DEFAULT_SLOT_RECTS: Record<
  FreeLayoutViewportId,
  Record<FreeLayoutSlotId, FreeLayoutRect>
> = {
  mobile: {
    nav: { x: 0.04, y: 0.03, width: 0.92, height: 0.09 },
    headline: { x: 0.08, y: 0.2, width: 0.84, height: 0.16 },
    subheadline: { x: 0.08, y: 0.38, width: 0.84, height: 0.1 },
    ctaGroup: { x: 0.08, y: 0.52, width: 0.84, height: 0.1 },
    visual: { x: 0.18, y: 0.66, width: 0.64, height: 0.18 },
    footer: { x: 0.05, y: 0.88, width: 0.9, height: 0.08 },
  },
  tablet: {
    nav: { x: 0.04, y: 0.03, width: 0.92, height: 0.08 },
    headline: { x: 0.08, y: 0.2, width: 0.6, height: 0.14 },
    subheadline: { x: 0.08, y: 0.35, width: 0.58, height: 0.09 },
    ctaGroup: { x: 0.08, y: 0.47, width: 0.5, height: 0.08 },
    visual: { x: 0.58, y: 0.2, width: 0.34, height: 0.34 },
    footer: { x: 0.04, y: 0.9, width: 0.92, height: 0.07 },
  },
  desktop: {
    nav: { x: 0.03, y: 0.03, width: 0.94, height: 0.08 },
    headline: { x: 0.06, y: 0.23, width: 0.46, height: 0.16 },
    subheadline: { x: 0.06, y: 0.41, width: 0.42, height: 0.1 },
    ctaGroup: { x: 0.06, y: 0.55, width: 0.34, height: 0.09 },
    visual: { x: 0.57, y: 0.24, width: 0.36, height: 0.36 },
    footer: { x: 0.04, y: 0.9, width: 0.92, height: 0.07 },
  },
  wide: {
    nav: { x: 0.03, y: 0.03, width: 0.94, height: 0.08 },
    headline: { x: 0.06, y: 0.23, width: 0.44, height: 0.15 },
    subheadline: { x: 0.06, y: 0.4, width: 0.4, height: 0.1 },
    ctaGroup: { x: 0.06, y: 0.54, width: 0.32, height: 0.09 },
    visual: { x: 0.6, y: 0.2, width: 0.32, height: 0.4 },
    footer: { x: 0.04, y: 0.9, width: 0.92, height: 0.07 },
  },
};

const DEFAULT_SLOT_ANCHORS: Record<FreeLayoutSlotId, FreeLayoutAnchor> = {
  nav: "top-center",
  headline: "top-left",
  subheadline: "top-left",
  ctaGroup: "top-left",
  visual: "center",
  footer: "bottom-center",
};

const DEFAULT_SLOT_Z_INDEX: Record<FreeLayoutSlotId, number> = {
  nav: 10,
  headline: 8,
  subheadline: 7,
  ctaGroup: 9,
  visual: 5,
  footer: 6,
};

function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function clampZIndex(value: number): number {
  return Math.min(MAX_Z_INDEX, Math.max(MIN_Z_INDEX, Math.round(value)));
}

export function clampRectValues(rect: FreeLayoutRect): FreeLayoutRect {
  const x = clampUnit(rect.x);
  const y = clampUnit(rect.y);
  const width = clampUnit(rect.width);
  const height = clampUnit(rect.height);
  const maxWidth = Math.max(0, 1 - x);
  const maxHeight = Math.max(0, 1 - y);

  return {
    x,
    y,
    width: Math.min(width, maxWidth),
    height: Math.min(height, maxHeight),
  };
}

function createDefaultSlot(
  viewport: FreeLayoutViewportId,
  slotId: FreeLayoutSlotId
): FreeLayoutSlot {
  return {
    id: slotId,
    rect: clampRectValues(DEFAULT_SLOT_RECTS[viewport][slotId]),
    anchor: DEFAULT_SLOT_ANCHORS[slotId],
    zIndex: clampZIndex(DEFAULT_SLOT_Z_INDEX[slotId]),
    locked: slotId === "nav" || slotId === "footer",
  };
}

function createDefaultViewport(viewport: FreeLayoutViewportId): FreeLayoutViewport {
  return {
    viewport,
    slots: SLOT_IDS.map((slotId) => createDefaultSlot(viewport, slotId)),
  };
}

export function createDefaultFreeLayout(): FreeLayoutDraft {
  return {
    version: 1,
    viewports: VIEWPORTS.map((viewport) => createDefaultViewport(viewport)),
  };
}

export function getSlot(
  layout: FreeLayoutDraft,
  viewport: FreeLayoutViewportId,
  slotId: FreeLayoutSlotId
): FreeLayoutSlot | undefined {
  const targetViewport = layout.viewports.find((item) => item.viewport === viewport);
  return targetViewport?.slots.find((slot) => slot.id === slotId);
}

export function updateSlotRect(
  layout: FreeLayoutDraft,
  viewport: FreeLayoutViewportId,
  slotId: FreeLayoutSlotId,
  rect: FreeLayoutRect
): FreeLayoutDraft {
  const nextRect = clampRectValues(rect);

  return {
    ...layout,
    viewports: layout.viewports.map((view) => {
      if (view.viewport !== viewport) return view;

      return {
        ...view,
        slots: view.slots.map((slot) =>
          slot.id === slotId ? { ...slot, rect: nextRect } : slot
        ),
      };
    }),
  };
}
