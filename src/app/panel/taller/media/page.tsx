"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import BackToTop from "@/components/panel/BackToTop";
import PageHeader from "@/components/panel/PageHeader";
import PanelBadge from "@/components/panel/ui/PanelBadge";
import PanelButton from "@/components/panel/ui/PanelButton";
import PanelCard from "@/components/panel/ui/PanelCard";
import type { AssetItem } from "@/lib/taller/media/types";
import {
  deleteSystemMediaClient,
  fetchSystemMediaClient,
  formatBytes,
  requestSystemAssetVariantClient,
  updateSystemMediaMetadataClient,
  uploadSystemMediaClient,
} from "@/lib/taller/media/service";

type KindFilter = "all" | AssetItem["kind"];
type ScopeFilter = "all" | AssetItem["scope"];
type RestrictionFilter = "all" | "restricted" | "open";

const ALLOWED_IN_OPTIONS = [
  "hero.background",
  "hero.logo",
  "hero.media",
  "navbar.logo",
  "footer.logo",
  "footer.background",
  "card.media",
  "popup.media",
  "banner.media",
  "social.media",
  "pdf.media",
] as const;

const VISUAL_CATEGORY_OPTIONS = [
  "logo",
  "texture",
  "photo",
  "icon",
  "illustration",
] as const;
const STYLE_OPTIONS = ["minimal", "corporate", "editorial", "premium", "playful"] as const;
const COLOR_OPTIONS = ["light", "dark", "monochrome", "colorful"] as const;
const INTENTION_OPTIONS = ["hero", "footer", "brand", "marketing", "social"] as const;
const OWNERSHIP_SCOPE_OPTIONS = ["system", "tenant"] as const;
const OWNERSHIP_VISIBILITY_OPTIONS = ["shared", "private"] as const;
const OWNERSHIP_SECTOR_OPTIONS = [
  "general",
  "barberia",
  "peluqueria",
  "dental",
  "taller",
  "estetica",
  "inmobiliaria",
] as const;

type VisualCategory = (typeof VISUAL_CATEGORY_OPTIONS)[number];
type TaxonomyStyle = (typeof STYLE_OPTIONS)[number];
type TaxonomyColor = (typeof COLOR_OPTIONS)[number];
type TaxonomyIntention = (typeof INTENTION_OPTIONS)[number];
type OwnershipScope = (typeof OWNERSHIP_SCOPE_OPTIONS)[number];
type OwnershipVisibility = (typeof OWNERSHIP_VISIBILITY_OPTIONS)[number];
type OwnershipSector = (typeof OWNERSHIP_SECTOR_OPTIONS)[number];
type ManualVariantKey = Exclude<AssetItem["variantKey"], "original">;

type AssetGroup = {
  original: AssetItem;
  variantsByKey: Partial<Record<ManualVariantKey, AssetItem>>;
  extraVariants: AssetItem[];
};

type UploadFeedbackState = "idle" | "uploading" | "success" | "error";
type VariantFeedbackTone = "idle" | "processing" | "success" | "error";
type VariantFeedback = {
  tone: VariantFeedbackTone;
  title: string;
  detail: string;
};

const MIN_UPLOAD_FEEDBACK_MS = 450;

const MANUAL_VARIANT_SLOTS: Array<{
  key: ManualVariantKey;
  title: string;
  actionLabel: string;
}> = [
  { key: "thumbnail", title: "thumbnail", actionLabel: "Generar thumbnail" },
  { key: "optimized", title: "optimized", actionLabel: "Generar optimized" },
  { key: "vectorized-svg", title: "SVG", actionLabel: "Generar SVG" },
];

const UPLOAD_FEEDBACK_META: Record<
  Exclude<UploadFeedbackState, "idle">,
  {
    label: string;
    description: string;
    tone: "processing" | "success" | "danger";
  }
> = {
  uploading: {
    label: "Subiendo asset base...",
    description: "Guardando archivo en la librería del sistema.",
    tone: "processing",
  },
  success: {
    label: "Asset base guardado.",
    description: 'Puedes generar variantes desde "Ver variantes".',
    tone: "success",
  },
  error: {
    label: "Error al subir.",
    description: "Revisa el archivo e inténtalo de nuevo.",
    tone: "danger",
  },
};

const VARIANT_PROCESS_PHASES = [
  "Preparando variante...",
  "Procesando recurso...",
  "Optimizando resultado...",
] as const;

function splitTagInput(value: string): string[] {
  return String(value || "")
    .split(/[,\s]+/g)
    .map((token) => token.trim())
    .filter(Boolean)
    .slice(0, 30);
}

function toggleSelection<T extends string>(current: T[], value: T, max: number): T[] {
  if (current.includes(value)) {
    return current.filter((item) => item !== value);
  }
  if (current.length >= max) return current;
  return [...current, value];
}

function buildGuidedTags(args: {
  visualCategory: VisualCategory;
  styles: TaxonomyStyle[];
  colors: TaxonomyColor[];
  intentions: TaxonomyIntention[];
  scope: OwnershipScope;
  visibility: OwnershipVisibility;
  sector: OwnershipSector;
}): string[] {
  // Taxonomía guiada provisional (Sprint UX): mantenemos compatibilidad serializando en tags.
  return [
    `visual:${args.visualCategory}`,
    ...args.styles.map((value) => `style:${value}`),
    ...args.colors.map((value) => `color:${value}`),
    ...args.intentions.map((value) => `intent:${value}`),
    `scope:${args.scope}`,
    `visibility:${args.visibility}`,
    `sector:${args.sector}`,
  ];
}

function mergeUploadTags(args: {
  freeTagsInput: string;
  visualCategory: VisualCategory;
  styles: TaxonomyStyle[];
  colors: TaxonomyColor[];
  intentions: TaxonomyIntention[];
  scope: OwnershipScope;
  visibility: OwnershipVisibility;
  sector: OwnershipSector;
}): string {
  const free = splitTagInput(args.freeTagsInput);
  const guided = buildGuidedTags({
    visualCategory: args.visualCategory,
    styles: args.styles,
    colors: args.colors,
    intentions: args.intentions,
    scope: args.scope,
    visibility: args.visibility,
    sector: args.sector,
  });
  return Array.from(new Set([...free, ...guided])).join(", ");
}

function parseGuidedTags(tags: string[]): {
  freeTags: string[];
  visualCategory: VisualCategory;
  styles: TaxonomyStyle[];
  colors: TaxonomyColor[];
  intentions: TaxonomyIntention[];
  scope: OwnershipScope;
  visibility: OwnershipVisibility;
  sector: OwnershipSector;
} {
  const parsed = {
    freeTags: [] as string[],
    visualCategory: "photo" as VisualCategory,
    styles: [] as TaxonomyStyle[],
    colors: [] as TaxonomyColor[],
    intentions: [] as TaxonomyIntention[],
    scope: "system" as OwnershipScope,
    visibility: "shared" as OwnershipVisibility,
    sector: "general" as OwnershipSector,
  };

  tags.forEach((rawTag) => {
    const tag = rawTag.trim();
    if (!tag) return;

    if (tag.startsWith("visual:")) {
      const value = tag.slice("visual:".length).trim();
      if (VISUAL_CATEGORY_OPTIONS.includes(value as VisualCategory)) {
        parsed.visualCategory = value as VisualCategory;
        return;
      }
    }

    if (tag.startsWith("style:")) {
      const value = tag.slice("style:".length).trim();
      if (STYLE_OPTIONS.includes(value as TaxonomyStyle)) {
        if (!parsed.styles.includes(value as TaxonomyStyle)) {
          parsed.styles.push(value as TaxonomyStyle);
        }
        return;
      }
    }

    if (tag.startsWith("color:")) {
      const value = tag.slice("color:".length).trim();
      if (COLOR_OPTIONS.includes(value as TaxonomyColor)) {
        if (!parsed.colors.includes(value as TaxonomyColor)) {
          parsed.colors.push(value as TaxonomyColor);
        }
        return;
      }
    }

    if (tag.startsWith("intent:")) {
      const value = tag.slice("intent:".length).trim();
      if (INTENTION_OPTIONS.includes(value as TaxonomyIntention)) {
        if (!parsed.intentions.includes(value as TaxonomyIntention)) {
          parsed.intentions.push(value as TaxonomyIntention);
        }
        return;
      }
    }

    if (tag.startsWith("scope:")) {
      const value = tag.slice("scope:".length).trim();
      if (OWNERSHIP_SCOPE_OPTIONS.includes(value as OwnershipScope)) {
        parsed.scope = value as OwnershipScope;
        return;
      }
    }

    if (tag.startsWith("visibility:")) {
      const value = tag.slice("visibility:".length).trim();
      if (OWNERSHIP_VISIBILITY_OPTIONS.includes(value as OwnershipVisibility)) {
        parsed.visibility = value as OwnershipVisibility;
        return;
      }
    }

    if (tag.startsWith("sector:")) {
      const value = tag.slice("sector:".length).trim();
      if (OWNERSHIP_SECTOR_OPTIONS.includes(value as OwnershipSector)) {
        parsed.sector = value as OwnershipSector;
        return;
      }
    }

    parsed.freeTags.push(tag);
  });

  return parsed;
}

function splitAllowedInForEdit(allowedIn: string[]): { known: string[]; extra: string[] } {
  const known: string[] = [];
  const extra: string[] = [];

  allowedIn.forEach((rawValue) => {
    const value = rawValue.trim();
    if (!value) return;

    if (ALLOWED_IN_OPTIONS.includes(value as (typeof ALLOWED_IN_OPTIONS)[number])) {
      if (!known.includes(value)) known.push(value);
      return;
    }

    if (!extra.includes(value)) extra.push(value);
  });

  return { known, extra };
}

function isOriginalAsset(item: AssetItem): boolean {
  if (item.sourceAssetId !== null) return false;
  return (
    item.variantKey !== "thumbnail" &&
    item.variantKey !== "optimized" &&
    item.variantKey !== "vectorized-svg"
  );
}

export default function TallerMediaPage() {
  const [items, setItems] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [rowBusyId, setRowBusyId] = useState<string | null>(null);
  const [variantBusyKey, setVariantBusyKey] = useState<string | null>(null);
  const [variantProgressStep, setVariantProgressStep] = useState(0);
  const [uploadFeedbackState, setUploadFeedbackState] = useState<UploadFeedbackState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [searchFilter, setSearchFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");
  const [restrictionFilter, setRestrictionFilter] = useState<RestrictionFilter>("all");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [expandedVariantsByAssetId, setExpandedVariantsByAssetId] = useState<
    Record<string, true>
  >({});
  const [thumbFallbackById, setThumbFallbackById] = useState<Record<string, true>>({});

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editFreeTags, setEditFreeTags] = useState("");
  const [editVisualCategory, setEditVisualCategory] = useState<VisualCategory>("photo");
  const [editStyleSelection, setEditStyleSelection] = useState<TaxonomyStyle[]>([]);
  const [editColorSelection, setEditColorSelection] = useState<TaxonomyColor[]>([]);
  const [editIntentionSelection, setEditIntentionSelection] = useState<TaxonomyIntention[]>([]);
  const [editScope, setEditScope] = useState<OwnershipScope>("system");
  const [editVisibility, setEditVisibility] = useState<OwnershipVisibility>("shared");
  const [editSector, setEditSector] = useState<OwnershipSector>("general");
  const [editAllowedInSelection, setEditAllowedInSelection] = useState<string[]>([]);
  const [editAllowedInExtra, setEditAllowedInExtra] = useState<string[]>([]);

  const [isUploadSheetOpen, setIsUploadSheetOpen] = useState(false);
  const [desktopSelectedFileName, setDesktopSelectedFileName] = useState("");
  const [mobileSelectedFileName, setMobileSelectedFileName] = useState("");
  const [variantFeedbackByAssetId, setVariantFeedbackByAssetId] = useState<
    Record<string, VariantFeedback>
  >({});

  const fileRef = useRef<HTMLInputElement | null>(null);
  const mobileFileRef = useRef<HTMLInputElement | null>(null);
  const uploadResetTimerRef = useRef<number | null>(null);
  const uploadCloseSheetTimerRef = useRef<number | null>(null);
  const [label, setLabel] = useState("");
  const [tags, setTags] = useState("");
  const [allowedInSelection, setAllowedInSelection] = useState<string[]>([]);
  const [visualCategory, setVisualCategory] = useState<VisualCategory>("photo");
  const [styleSelection, setStyleSelection] = useState<TaxonomyStyle[]>([]);
  const [colorSelection, setColorSelection] = useState<TaxonomyColor[]>([]);
  const [intentionSelection, setIntentionSelection] = useState<TaxonomyIntention[]>([]);
  const [uploadScope, setUploadScope] = useState<OwnershipScope>("system");
  const [uploadVisibility, setUploadVisibility] = useState<OwnershipVisibility>("shared");
  const [uploadSector, setUploadSector] = useState<OwnershipSector>("general");

  function clearUploadFeedbackTimers() {
    if (uploadResetTimerRef.current) {
      window.clearTimeout(uploadResetTimerRef.current);
      uploadResetTimerRef.current = null;
    }
    if (uploadCloseSheetTimerRef.current) {
      window.clearTimeout(uploadCloseSheetTimerRef.current);
      uploadCloseSheetTimerRef.current = null;
    }
  }

  async function load(options?: { silent?: boolean }) {
    const isSilentRefresh = options?.silent === true;
    if (!isSilentRefresh) {
      setLoading(true);
    }
    setError(null);
    try {
      const nextItems = await fetchSystemMediaClient("");
      setItems(nextItems);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error loading assets");
    } finally {
      if (!isSilentRefresh) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const shouldLockBody = isUploadSheetOpen || Boolean(editingId);
    if (!shouldLockBody) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [editingId, isUploadSheetOpen]);

  useEffect(() => {
    return () => {
      if (uploadResetTimerRef.current) {
        window.clearTimeout(uploadResetTimerRef.current);
      }
      if (uploadCloseSheetTimerRef.current) {
        window.clearTimeout(uploadCloseSheetTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!variantBusyKey) return;
    const timer = window.setInterval(() => {
      setVariantProgressStep((prev) => (prev + 1) % VARIANT_PROCESS_PHASES.length);
    }, 1100);
    return () => {
      window.clearInterval(timer);
    };
  }, [variantBusyKey]);

  const tagStats = useMemo(() => {
    const counter = new Map<string, number>();
    items.forEach((item) => {
      item.tags.forEach((tag) => {
        const clean = tag.trim();
        if (!clean) return;
        counter.set(clean, (counter.get(clean) ?? 0) + 1);
      });
    });

    return Array.from(counter.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.tag.localeCompare(b.tag);
      });
  }, [items]);

  const filteredItems = useMemo(() => {
    const search = searchFilter.trim().toLowerCase();
    const tag = tagFilter.trim().toLowerCase();

    return items.filter((item) => {
      if (kindFilter !== "all" && item.kind !== kindFilter) return false;
      if (scopeFilter !== "all" && item.scope !== scopeFilter) return false;

      if (restrictionFilter === "restricted" && item.allowedIn.length === 0) return false;
      if (restrictionFilter === "open" && item.allowedIn.length > 0) return false;

      if (search && !item.label.toLowerCase().includes(search)) return false;

      if (tag) {
        const tagsText = item.tags.join(" ").toLowerCase();
        if (!tagsText.includes(tag)) return false;
      }

      return true;
    });
  }, [items, searchFilter, tagFilter, kindFilter, scopeFilter, restrictionFilter]);

  const groupedAssets = useMemo<AssetGroup[]>(() => {
    const originals = filteredItems.filter((item) => isOriginalAsset(item));
    const variantsBySource = new Map<string, AssetItem[]>();

    filteredItems.forEach((item) => {
      if (!item.sourceAssetId) return;
      const current = variantsBySource.get(item.sourceAssetId) ?? [];
      current.push(item);
      variantsBySource.set(item.sourceAssetId, current);
    });

    const consumedVariantIds = new Set<string>();
    const groups = originals.map((original) => {
      const variantsByKey: Partial<Record<ManualVariantKey, AssetItem>> = {};
      const extraVariants: AssetItem[] = [];

      (variantsBySource.get(original._id) ?? []).forEach((variant) => {
        if (
          variant.variantKey === "thumbnail" ||
          variant.variantKey === "optimized" ||
          variant.variantKey === "vectorized-svg"
        ) {
          if (!variantsByKey[variant.variantKey]) {
            variantsByKey[variant.variantKey] = variant;
          } else {
            extraVariants.push(variant);
          }
          consumedVariantIds.add(variant._id);
          return;
        }

        extraVariants.push(variant);
        consumedVariantIds.add(variant._id);
      });

      return {
        original,
        variantsByKey,
        extraVariants,
      };
    });

    const orphanGroups = filteredItems
      .filter((item) => {
        if (isOriginalAsset(item)) return false;
        if (item.sourceAssetId) return !consumedVariantIds.has(item._id);
        return true;
      })
      .map((item) => ({
        original: item,
        variantsByKey: {},
        extraVariants: [] as AssetItem[],
      }));

    return [...groups, ...orphanGroups];
  }, [filteredItems]);

  const hasActiveFilters = Boolean(
    searchFilter.trim() ||
      tagFilter.trim() ||
      kindFilter !== "all" ||
      scopeFilter !== "all" ||
      restrictionFilter !== "all"
  );

  const editingItem = useMemo(
    () => items.find((item) => item._id === editingId) ?? null,
    [editingId, items]
  );

  const selectedTagFromCatalog = tagStats.some((entry) => entry.tag === tagFilter) ? tagFilter : "";

  async function onUpload(e: React.FormEvent) {
    e.preventDefault();
    clearUploadFeedbackTimers();
    const uploadStartedAt = Date.now();
    setBusy(true);
    setError(null);
    setNotice(null);
    setUploadFeedbackState("uploading");
    const closeSheetAfterSave = isUploadSheetOpen;

    try {
      const file = fileRef.current?.files?.[0] ?? mobileFileRef.current?.files?.[0];
      if (!file) throw new Error("Selecciona un archivo.");

      const mergedTags = mergeUploadTags({
        freeTagsInput: tags,
        visualCategory,
        styles: styleSelection,
        colors: colorSelection,
        intentions: intentionSelection,
        scope: uploadScope,
        visibility: uploadVisibility,
        sector: uploadSector,
      });

      await uploadSystemMediaClient({
        file,
        label,
        tags: mergedTags,
        allowedIn: allowedInSelection.join(", "),
      });
      await load();

      const elapsedMs = Date.now() - uploadStartedAt;
      if (elapsedMs < MIN_UPLOAD_FEEDBACK_MS) {
        await new Promise<void>((resolve) => {
          window.setTimeout(resolve, MIN_UPLOAD_FEEDBACK_MS - elapsedMs);
        });
      }

      if (fileRef.current) fileRef.current.value = "";
      if (mobileFileRef.current) mobileFileRef.current.value = "";
      setDesktopSelectedFileName("");
      setMobileSelectedFileName("");
      setLabel("");
      setTags("");
      setAllowedInSelection([]);
      setVisualCategory("photo");
      setStyleSelection([]);
      setColorSelection([]);
      setIntentionSelection([]);
      setUploadScope("system");
      setUploadVisibility("shared");
      setUploadSector("general");
      setUploadFeedbackState("success");
      setNotice('Asset base subido ✓. Genera derivadas desde "Ver variantes" cuando lo necesites.');
      if (closeSheetAfterSave) {
        uploadCloseSheetTimerRef.current = window.setTimeout(() => {
          setIsUploadSheetOpen(false);
        }, 900);
      }
      uploadResetTimerRef.current = window.setTimeout(() => {
        setUploadFeedbackState("idle");
      }, 2800);
    } catch (e: unknown) {
      setUploadFeedbackState("error");
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(item: AssetItem) {
    const parsedTags = parseGuidedTags(item.tags || []);
    const parsedAllowedIn = splitAllowedInForEdit(item.allowedIn || []);

    setEditingId(item._id);
    setEditLabel(item.label);
    setEditFreeTags(parsedTags.freeTags.join(", "));
    setEditVisualCategory(parsedTags.visualCategory);
    setEditStyleSelection(parsedTags.styles.slice(0, 2));
    setEditColorSelection(parsedTags.colors.slice(0, 2));
    setEditIntentionSelection(parsedTags.intentions.slice(0, 3));
    setEditScope(parsedTags.scope);
    setEditVisibility(parsedTags.visibility);
    setEditSector(parsedTags.sector);
    setEditAllowedInSelection(parsedAllowedIn.known);
    setEditAllowedInExtra(parsedAllowedIn.extra);
    setError(null);
    setNotice(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditLabel("");
    setEditFreeTags("");
    setEditVisualCategory("photo");
    setEditStyleSelection([]);
    setEditColorSelection([]);
    setEditIntentionSelection([]);
    setEditScope("system");
    setEditVisibility("shared");
    setEditSector("general");
    setEditAllowedInSelection([]);
    setEditAllowedInExtra([]);
  }

  async function saveEdit() {
    if (!editingId) return;

    setRowBusyId(editingId);
    setError(null);
    setNotice(null);

    try {
      const mergedTags = mergeUploadTags({
        freeTagsInput: editFreeTags,
        visualCategory: editVisualCategory,
        styles: editStyleSelection,
        colors: editColorSelection,
        intentions: editIntentionSelection,
        scope: editScope,
        visibility: editVisibility,
        sector: editSector,
      });

      await updateSystemMediaMetadataClient({
        id: editingId,
        label: editLabel,
        tags: mergedTags,
        allowedIn: [...editAllowedInSelection, ...editAllowedInExtra].join(", "),
      });
      cancelEdit();
      setNotice("Asset actualizado ✓");
      await load({ silent: true });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setRowBusyId(null);
    }
  }

  async function removeAsset(item: AssetItem) {
    const confirmed = window.confirm(
      `¿Borrar asset "${item.label}"? Esta acción elimina el archivo y su metadata.`
    );
    if (!confirmed) return;

    setRowBusyId(item._id);
    setError(null);
    setNotice(null);

    try {
      await deleteSystemMediaClient(item._id);
      if (editingId === item._id) {
        cancelEdit();
      }
      setNotice("Asset eliminado ✓");
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setRowBusyId(null);
    }
  }

  async function generateVariant(original: AssetItem, variantKey: ManualVariantKey) {
    if (!isOriginalAsset(original)) {
      setVariantFeedbackByAssetId((prev) => ({
        ...prev,
        [original._id]: {
          tone: "error",
          title: "No se pudo iniciar la variante.",
          detail: "Solo se pueden generar variantes desde un asset raíz.",
        },
      }));
      return;
    }

    const actionKey = `${original._id}:${variantKey}`;
    setVariantBusyKey(actionKey);
    setError(null);
    setNotice(null);
    setVariantFeedbackByAssetId((prev) => ({
      ...prev,
      [original._id]: {
        tone: "processing",
        title: "Generando variante...",
        detail: `Slot en curso: ${
          MANUAL_VARIANT_SLOTS.find((slot) => slot.key === variantKey)?.title ?? variantKey
        }.`,
      },
    }));

    try {
      const message = await requestSystemAssetVariantClient({
        sourceAssetId: original._id,
        variantKey,
      });
      setVariantFeedbackByAssetId((prev) => ({
        ...prev,
        [original._id]: {
          tone: "success",
          title: "Variante generada.",
          detail: message,
        },
      }));
      await load({ silent: true });
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : "No se pudo solicitar la variante";
      setVariantFeedbackByAssetId((prev) => ({
        ...prev,
        [original._id]: {
          tone: "error",
          title: "Error al generar variante.",
          detail: errorMessage,
        },
      }));
    } finally {
      setVariantBusyKey(null);
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice("URL copiada ✓");
    } catch {
      setNotice("No se pudo copiar la URL");
    }
  }

  function openInNewTab(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function clearFilters() {
    setSearchFilter("");
    setTagFilter("");
    setKindFilter("all");
    setScopeFilter("all");
    setRestrictionFilter("all");
  }

  function toggleVariantsVisibility(assetId: string) {
    setExpandedVariantsByAssetId((prev) => {
      if (prev[assetId]) {
        const next = { ...prev };
        delete next[assetId];
        return next;
      }
      return { ...prev, [assetId]: true };
    });
  }

  function markThumbFallback(id: string) {
    setThumbFallbackById((prev) => {
      if (prev[id]) return prev;
      return { ...prev, [id]: true };
    });
  }

  function renderThumb(item: AssetItem) {
    if (item.kind === "video") {
      return (
        <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold [background:var(--surface-3,var(--muted))] [color:var(--text-subtle)]">
          VIDEO
        </div>
      );
    }

    if (thumbFallbackById[item._id]) {
      return (
        <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold [background:var(--surface-3,var(--muted))] [color:var(--text-subtle)]">
          {item.kind.toUpperCase()}
        </div>
      );
    }

    const thumbClass =
      item.kind === "svg" ? "h-full w-full object-contain p-1.5" : "h-full w-full object-cover";

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.url}
        alt={`Preview de ${item.label}`}
        className={thumbClass}
        loading="lazy"
        onError={() => markThumbFallback(item._id)}
      />
    );
  }

  const inputClass =
    "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors duration-180 focus:ring-2 focus:ring-ring";
  const selectClass =
    "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors duration-180 focus:ring-2 focus:ring-ring";
  const uploadInputClass =
    "h-10 w-full rounded-lg border border-border/85 px-3 text-sm text-foreground outline-none shadow-none transition-colors duration-180 [background:var(--surface-1,var(--background))] focus:ring-2 focus:ring-ring";
  const uploadSelectClass = uploadInputClass;

  const uploadFeedbackMeta =
    uploadFeedbackState === "idle" ? null : UPLOAD_FEEDBACK_META[uploadFeedbackState];
  const uploadFeedbackTone = uploadFeedbackMeta?.tone ?? "processing";
  const uploadFeedbackIndicatorClass =
    uploadFeedbackTone === "processing"
      ? "inline-flex h-2.5 w-2.5 shrink-0 animate-pulse rounded-full [background:var(--processing)]"
      : uploadFeedbackTone === "success"
        ? "inline-flex h-2.5 w-2.5 shrink-0 rounded-full [background:var(--success)]"
        : "inline-flex h-2.5 w-2.5 shrink-0 rounded-full [background:var(--danger)]";
  const uploadFeedback = (
    <div className="min-h-[78px] w-full rounded-xl border border-border/70 p-3 [background:var(--surface-1,var(--background))]">
      <div
        aria-live="polite"
        className={`transition-opacity duration-200 ${uploadFeedbackMeta ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex w-full items-center gap-2">
          <PanelBadge
            tone={uploadFeedbackTone}
            className="h-5 min-w-[164px] justify-center px-2 text-[10px]"
          >
            {uploadFeedbackMeta?.label ?? " "}
          </PanelBadge>
          <span className={uploadFeedbackIndicatorClass} />
        </div>
        <p className="mt-1 min-h-[14px] truncate text-[11px] text-muted-foreground">
          {uploadFeedbackMeta?.description ?? " "}
        </p>
      </div>
    </div>
  );

  const globalFeedbackTone = error ? "danger" : notice ? "success" : "idle";
  const globalFeedbackMessage = error ?? notice ?? " ";
  const globalFeedbackChip =
    globalFeedbackTone === "danger"
      ? "Error"
      : globalFeedbackTone === "success"
        ? "Listo"
        : "Estado";
  const globalFeedbackClass =
    globalFeedbackTone === "idle"
      ? "opacity-0"
      : "opacity-100 border border-border [background:var(--surface-2,var(--background))]";

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-6 px-3 pb-4 sm:px-4 lg:px-0">
      <PageHeader
        title="Media Center (Taller)"
        description="Gestiona libreria de assets del sistema con filtros, restricciones y metadatos operativos."
        actions={
          <div className="flex items-center gap-2">
            <PanelButton type="button" onClick={() => load()} className="h-10">
              Recargar
            </PanelButton>
            <PanelButton
              variant="primary"
              type="button"
              onClick={() => {
                clearUploadFeedbackTimers();
                setUploadFeedbackState("idle");
                setDesktopSelectedFileName("");
                setMobileSelectedFileName("");
                setIsUploadSheetOpen(true);
              }}
              className="h-10 lg:hidden"
            >
              Nuevo asset
            </PanelButton>
          </div>
        }
      />

      <div className="min-h-[64px]">
        <div className={`rounded-xl p-3 text-sm transition-opacity duration-180 ${globalFeedbackClass}`}>
          <div className="flex items-center gap-2">
            <PanelBadge
              tone={globalFeedbackTone === "idle" ? "neutral" : globalFeedbackTone}
              className="h-5 px-2 text-[10px]"
            >
              {globalFeedbackChip}
            </PanelBadge>
            <span className="text-xs [color:var(--text-subtle)]">
              {globalFeedbackMessage}
            </span>
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-border p-5 shadow-sm [background:var(--surface-3,var(--card))]">
        <div className="flex items-center justify-between lg:hidden">
          <span className="text-sm font-semibold text-foreground">Filtros</span>
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen((prev) => !prev)}
            className="inline-flex h-8 items-center justify-center rounded-md border border-border px-3 text-xs font-semibold transition-colors duration-180 [background:var(--cta-secondary)] [color:var(--cta-secondary-foreground)] hover:[background:var(--cta-secondary-hover)]"
          >
            {isMobileFiltersOpen ? "Ocultar filtros" : "Ver filtros"}
          </button>
        </div>

        <div
          className={`${isMobileFiltersOpen ? "mt-3" : "hidden"} space-y-3 lg:mt-0 lg:block lg:space-y-0`}
        >
          <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]">
          <label className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Buscar por label</span>
            <input
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className={inputClass}
              placeholder="Ej: hero, footer, logo"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Tag libre</span>
            <input
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className={inputClass}
              placeholder="Ej: hero:background"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Tag guiado</span>
            <select
              value={selectedTagFromCatalog}
              onChange={(e) => setTagFilter(e.target.value)}
              className={selectClass}
            >
              <option value="">Todos los tags</option>
              {tagStats.map((entry) => (
                <option key={entry.tag} value={entry.tag}>
                  {entry.tag} ({entry.count})
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Tipo</span>
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value as KindFilter)}
              className={selectClass}
            >
              <option value="all">Todos</option>
              <option value="image">Imagen</option>
              <option value="svg">SVG</option>
              <option value="video">Video</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Scope</span>
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value as ScopeFilter)}
              className={selectClass}
            >
              <option value="all">Todos</option>
              <option value="system">System</option>
              <option value="tenant">Tenant</option>
            </select>
          </label>

          <div className="flex items-end">
            <PanelButton type="button" onClick={clearFilters} className="h-10 w-full">
              Limpiar
            </PanelButton>
          </div>
        </div>

        {tagStats.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {tagStats.slice(0, 10).map((entry) => (
              <button
                key={entry.tag}
                type="button"
                onClick={() => setTagFilter(entry.tag)}
                className="inline-flex items-center rounded-full border border-border px-2 py-1 text-xs transition-colors duration-180 [background:var(--badge-bg)] [color:var(--badge-fg)] [border-color:var(--badge-bg)] hover:opacity-90"
              >
                {entry.tag} · {entry.count}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Uso:</span>
          <button
            type="button"
            onClick={() => setRestrictionFilter("all")}
            className="rounded-full border border-border px-2 py-1 text-xs [background:var(--surface-2,var(--background))] [color:var(--text-subtle)]"
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setRestrictionFilter("restricted")}
            className="rounded-full border border-border px-2 py-1 text-xs [background:var(--surface-2,var(--background))] [color:var(--text-subtle)]"
          >
            Restringidos (`allowedIn`)
          </button>
          <button
            type="button"
            onClick={() => setRestrictionFilter("open")}
            className="rounded-full border border-border px-2 py-1 text-xs [background:var(--surface-2,var(--background))] [color:var(--text-subtle)]"
          >
            Uso libre
          </button>
        </div>
      </div>

        <div className="mt-4 rounded-lg border border-border px-3 py-2 text-xs shadow-sm [background:var(--surface-2,var(--background))] [color:var(--text-subtle)]">
          {loading
            ? "Cargando assets..."
            : `${filteredItems.length} visibles de ${items.length} activos · filtro de restriccion: ${restrictionFilter}`}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <PanelCard className="hidden p-5 lg:block">
          <div className="text-sm font-semibold">Subir nuevo asset</div>
          <p className="mt-1 text-sm text-muted-foreground">
            Alta guiada para libreria del sistema (Capa 1), con taxonomía controlada.
          </p>

          <form onSubmit={onUpload} className="mt-4 grid gap-3">
            <PanelCard variant="task" className="p-3">
              <p className="text-xs font-semibold text-foreground">Bloque 1 · Asset base</p>
              <div className="mt-2 grid gap-3">
                <label className="grid gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Archivo</span>
                  <input
                    id="taller-media-file-desktop"
                    ref={fileRef}
                    type="file"
                    className="sr-only"
                    accept="image/*,video/*,.svg"
                    onChange={(e) => setDesktopSelectedFileName(e.target.files?.[0]?.name ?? "")}
                  />
                  <PanelButton
                    variant="primary"
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="h-10 w-full justify-center"
                  >
                    {desktopSelectedFileName ? "Cambiar archivo" : "Seleccionar archivo"}
                  </PanelButton>
                  <span className="min-h-[1rem] text-[11px] [color:var(--text-subtle)]">
                    {desktopSelectedFileName || "Aún no has seleccionado un archivo."}
                  </span>
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Label (opcional)</span>
                  <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className={uploadInputClass}
                    placeholder="Ej: Footer silueta"
                  />
                </label>
              </div>
            </PanelCard>

            <div className="rounded-xl border border-border/70 p-3 [background:var(--surface-1,var(--background))]">
              <p className="text-xs font-semibold text-foreground">Bloque 2 · Clasificación base</p>
              <div className="mt-2 grid gap-3">
                <label className="grid gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Categoría visual</span>
                  <select
                    value={visualCategory}
                    onChange={(e) => setVisualCategory(e.target.value as VisualCategory)}
                    className={uploadSelectClass}
                  >
                    {VISUAL_CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Tags libres (opcional)</span>
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className={uploadInputClass}
                    placeholder="hero:background footer:shape"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 p-3 [background:var(--surface-1,var(--background))]">
              <p className="text-xs font-semibold text-foreground">Bloque 3 · Perfil visual</p>
              <div className="mt-2 grid gap-3">
                <div className="grid gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Estilo (máx. 2)</span>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_OPTIONS.map((option) => {
                      const selected = styleSelection.includes(option);
                      const disabled = styleSelection.length >= 2 && !selected;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setStyleSelection((prev) => toggleSelection(prev, option, 2))
                          }
                          disabled={disabled}
                          aria-pressed={selected}
                          className={[
                            "rounded-full border px-2 py-1 text-xs transition-colors",
                            selected
                              ? "border-border [background:var(--badge-bg)] [color:var(--badge-fg)]"
                              : "border-border [background:var(--surface-2,var(--background))] [color:var(--text-subtle)]",
                            disabled ? "opacity-50" : "",
                          ].join(" ")}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Color (máx. 2)</span>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map((option) => {
                      const selected = colorSelection.includes(option);
                      const disabled = colorSelection.length >= 2 && !selected;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setColorSelection((prev) => toggleSelection(prev, option, 2))
                          }
                          disabled={disabled}
                          aria-pressed={selected}
                          className={[
                            "rounded-full border px-2 py-1 text-xs transition-colors",
                            selected
                              ? "border-border [background:var(--badge-bg)] [color:var(--badge-fg)]"
                              : "border-border [background:var(--surface-2,var(--background))] [color:var(--text-subtle)]",
                            disabled ? "opacity-50" : "",
                          ].join(" ")}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Intención (máx. 3)</span>
                  <div className="flex flex-wrap gap-2">
                    {INTENTION_OPTIONS.map((option) => {
                      const selected = intentionSelection.includes(option);
                      const disabled = intentionSelection.length >= 3 && !selected;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setIntentionSelection((prev) => toggleSelection(prev, option, 3))
                          }
                          disabled={disabled}
                          aria-pressed={selected}
                          className={[
                            "rounded-full border px-2 py-1 text-xs transition-colors",
                            selected
                              ? "border-border [background:var(--badge-bg)] [color:var(--badge-fg)]"
                              : "border-border [background:var(--surface-2,var(--background))] [color:var(--text-subtle)]",
                            disabled ? "opacity-50" : "",
                          ].join(" ")}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 p-3 [background:var(--surface-1,var(--background))]">
              <p className="text-xs font-semibold text-foreground">Bloque 4 · Ownership / alcance</p>
              <div className="mt-2 grid gap-3">
                <label className="grid gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Scope</span>
                  <select
                    value={uploadScope}
                    onChange={(e) => setUploadScope(e.target.value as OwnershipScope)}
                    className={uploadSelectClass}
                  >
                    {OWNERSHIP_SCOPE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Visibility / reuse policy</span>
                  <select
                    value={uploadVisibility}
                    onChange={(e) =>
                      setUploadVisibility(e.target.value as OwnershipVisibility)
                    }
                    className={uploadSelectClass}
                  >
                    {OWNERSHIP_VISIBILITY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Sector</span>
                  <select
                    value={uploadSector}
                    onChange={(e) => setUploadSector(e.target.value as OwnershipSector)}
                    className={uploadSelectClass}
                  >
                    {OWNERSHIP_SECTOR_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-xs font-medium text-muted-foreground">Business / client (siguiente fase)</span>
                  <select disabled className={`${uploadSelectClass} opacity-60`} value="">
                    <option value="">No conectado aún</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 p-3 [background:var(--surface-1,var(--background))]">
              <p className="text-xs font-semibold text-foreground">Bloque 5 · Restricción de uso (`allowedIn`)</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Si no seleccionas nada, el asset queda en uso libre.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {ALLOWED_IN_OPTIONS.map((option) => {
                  const selected = allowedInSelection.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        setAllowedInSelection((prev) =>
                          prev.includes(option)
                            ? prev.filter((value) => value !== option)
                            : [...prev, option]
                        )
                      }
                      aria-pressed={selected}
                      className={[
                        "rounded-full border px-2 py-1 text-xs transition-colors",
                        selected
                          ? "border-border [background:var(--badge-bg)] [color:var(--badge-fg)]"
                          : "border-border [background:var(--surface-2,var(--background))] [color:var(--text-subtle)]",
                      ].join(" ")}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <PanelButton
              variant="primary"
              type="submit"
              disabled={busy}
              className="h-10 w-full justify-center"
            >
              {busy ? "Subiendo asset base..." : "Subir asset"}
            </PanelButton>
            {uploadFeedback}
          </form>
        </PanelCard>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Biblioteca de assets</h2>
            <span className="text-xs text-muted-foreground">Desktop-optimized, responsive-safe</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              <div className="h-32 animate-pulse rounded-xl border border-border [background:var(--surface-2,var(--card))]" />
              <div className="h-32 animate-pulse rounded-xl border border-border [background:var(--surface-2,var(--card))]" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-xl border border-border p-5 text-sm text-muted-foreground shadow-sm [background:var(--surface-2,var(--card))]">
              {hasActiveFilters
                ? "No hay assets que coincidan con los filtros actuales."
                : "No hay assets todavia. Crea el primero desde Nuevo asset."}
            </div>
          ) : (
            <div className="space-y-4">
              {groupedAssets.map((group) => {
                const original = group.original;
                const isVariantsExpanded = Boolean(expandedVariantsByAssetId[original._id]);
                const isRestricted = original.allowedIn.length > 0;
                const metadataBadgeClass =
                  "inline-flex h-5 items-center rounded-full border border-border px-1.5 text-[10px] leading-none whitespace-normal break-words [background:var(--surface-3,var(--muted))] [color:var(--text-subtle)]";
                const summaryVariantBadgeClass =
                  "inline-flex h-5 items-center rounded-full border border-border px-1.5 text-[10px] leading-none whitespace-normal break-words [background:var(--surface-2,var(--background))] [color:var(--text-subtle)]";
                const availableVariantSlots = MANUAL_VARIANT_SLOTS.filter((slot) =>
                  Boolean(group.variantsByKey[slot.key])
                );
                const missingVariantSlots = MANUAL_VARIANT_SLOTS.filter(
                  (slot) => !group.variantsByKey[slot.key]
                );
                const availableVariantKeys = availableVariantSlots.map((slot) => slot.title);
                const busyVariantParts = variantBusyKey?.split(":") ?? [];
                const busySourceAssetId = busyVariantParts[0] ?? null;
                const busyVariantKey = busyVariantParts[1] as ManualVariantKey | undefined;
                const isVariantBusyForOriginal = busySourceAssetId === original._id;
                const busyVariantSlot = busyVariantKey
                  ? MANUAL_VARIANT_SLOTS.find((slot) => slot.key === busyVariantKey)
                  : undefined;
                const pipelineBadgeClass =
                  original.pipelineStatus === "failed"
                    ? "inline-flex h-5 items-center rounded-full border border-border px-1.5 text-[10px] leading-none whitespace-normal break-words [background:var(--accent-soft,var(--muted))] [color:var(--accent-strong,var(--foreground))]"
                    : metadataBadgeClass;
                const generatedCount = availableVariantSlots.length + group.extraVariants.length;
                const variantFeedbackState = variantFeedbackByAssetId[original._id];
                const feedbackTone: VariantFeedbackTone = isVariantBusyForOriginal
                  ? "processing"
                  : variantFeedbackState?.tone ?? "idle";
                const isSvgWarning =
                  feedbackTone === "error" && /svg/i.test(variantFeedbackState?.detail ?? "");
                const semanticFeedbackTone: "idle" | "processing" | "success" | "warning" | "danger" =
                  feedbackTone === "processing"
                    ? "processing"
                    : feedbackTone === "success"
                      ? "success"
                      : feedbackTone === "error"
                        ? isSvgWarning
                          ? "warning"
                          : "danger"
                        : "idle";
                const feedbackBadgeTone: "neutral" | "processing" | "success" | "warning" | "danger" =
                  semanticFeedbackTone === "idle" ? "neutral" : semanticFeedbackTone;
                const feedbackIndicatorClass =
                  semanticFeedbackTone === "processing"
                    ? "inline-flex h-2.5 w-2.5 shrink-0 animate-pulse rounded-full [background:var(--processing)]"
                    : semanticFeedbackTone === "success"
                      ? "inline-flex h-2.5 w-2.5 shrink-0 rounded-full [background:var(--success)]"
                      : semanticFeedbackTone === "warning"
                        ? "inline-flex h-2.5 w-2.5 shrink-0 rounded-full [background:var(--warning)]"
                        : semanticFeedbackTone === "danger"
                          ? "inline-flex h-2.5 w-2.5 shrink-0 rounded-full [background:var(--danger)]"
                          : "inline-flex h-2.5 w-2.5 shrink-0 rounded-full [background:var(--text-subtle)]";
                const processingPhase = VARIANT_PROCESS_PHASES[variantProgressStep];
                const feedbackTitle = feedbackTone === "processing"
                  ? processingPhase
                  : semanticFeedbackTone === "success"
                    ? "Variante creada"
                    : semanticFeedbackTone === "warning"
                      ? "No vectorizable"
                      : semanticFeedbackTone === "danger"
                        ? "Error al generar"
                        : variantFeedbackState?.title ??
                    (missingVariantSlots.length > 0
                      ? "Generación manual de variantes"
                      : "Variantes completas");
                const feedbackDetail = feedbackTone === "processing"
                  ? `Trabajando en ${busyVariantSlot?.title ?? "la variante"}...`
                  : semanticFeedbackTone === "success"
                    ? "Puedes revisarla en esta misma fila."
                    : semanticFeedbackTone === "warning"
                      ? "Este asset no cumple condiciones para SVG."
                      : semanticFeedbackTone === "danger"
                        ? "Reintenta desde el slot correspondiente."
                        : variantFeedbackState?.detail ??
                    (missingVariantSlots.length > 0
                      ? `Selecciona un slot para generar: ${missingVariantSlots
                          .map((slot) => slot.title)
                          .join(", ")}.`
                      : "Todas las variantes principales están generadas.");
                const compactVariantMetaBadgeClass =
                  "inline-flex h-4 min-w-0 items-center rounded-full border border-border px-1 text-[9px] leading-none whitespace-nowrap [background:var(--surface-3,var(--muted))] [color:var(--text-subtle)]";
                const variantSlotShellClass =
                  "h-[128px] min-w-0 rounded-md border border-border p-1 [background:var(--surface-1,var(--background))] flex flex-col";
                const variantSlotHeaderClass = "flex h-[50px] items-start gap-1";
                const variantSlotMetaRowClass =
                  "mt-0.5 flex h-4 items-center gap-0.5 overflow-x-hidden overflow-y-visible";
                const variantActionRowClass =
                  "mt-1.5 grid min-h-[24px] grid-cols-2 gap-0.5 pt-0.5 sm:flex sm:flex-nowrap sm:gap-0.5";
                const variantActionButtonClass =
                  "h-6 min-w-0 rounded-md px-1 text-[10px] whitespace-nowrap sm:flex-1";

                return (
                  <article key={group.original._id}>
                    <PanelCard variant="task" className="p-2.5 sm:p-3">
                    <div className="rounded-xl border border-border/80 p-3 [background:var(--surface-1,var(--background))] sm:p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border [background:var(--surface-2,var(--card))] sm:h-18 sm:w-18">
                          {renderThumb(original)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-semibold text-foreground">{original.label}</h3>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {formatBytes(original.bytes)} · {original.mime || original.kind}
                              </p>
                            </div>

                            <div className="mt-0.5 space-y-1 sm:mt-0">
                              <div className="flex flex-wrap gap-1">
                                <span className="inline-flex h-5 items-center rounded-full border border-border px-1.5 text-[10px] leading-none whitespace-normal break-words [background:var(--badge-bg)] [color:var(--badge-fg)] [border-color:var(--badge-bg)]">
                                  {original.kind}
                                </span>
                                <span className={metadataBadgeClass}>{original.scope}</span>
                                <span className={metadataBadgeClass}>
                                  {isRestricted ? "restringido" : "uso libre"}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                <span className={pipelineBadgeClass}>
                                  pipeline: {original.pipelineStatus}
                                </span>
                                <span className={metadataBadgeClass}>variant: {original.variantKey}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-2 truncate text-[11px] [color:var(--text-subtle)]">{original.url}</div>

                          <div className="mt-2 flex flex-wrap gap-1">
                            {original.tags.length > 0 ? (
                              original.tags.slice(0, 6).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex h-5 items-center rounded-full border border-border px-1.5 text-[10px] leading-none [background:var(--badge-bg)] [color:var(--badge-fg)] [border-color:var(--badge-bg)]"
                                >
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted-foreground">Sin tags</span>
                            )}
                            {original.tags.length > 6 ? (
                              <span className="text-xs text-muted-foreground">
                                +{original.tags.length - 6}
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-1 text-[11px] [color:var(--text-subtle)]">
                            Destinos permitidos:{" "}
                            {isRestricted ? original.allowedIn.slice(0, 3).join(", ") : "cualquier slot"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 space-y-2 border-t border-border/70 pt-2.5">
                        {isVariantsExpanded ? (
                          <div className="grid min-h-[64px] gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(240px,320px)_116px] sm:items-center sm:gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground">
                                Variantes derivadas ({generatedCount})
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {availableVariantKeys.length > 0 ? (
                                  availableVariantKeys.map((variantKey) => (
                                    <span
                                      key={`${original._id}-summary-${variantKey}`}
                                      className={summaryVariantBadgeClass}
                                    >
                                      {variantKey}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[11px] text-muted-foreground">
                                    Sin variantes generadas
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="min-h-[56px] min-w-0 rounded-md border border-border/70 px-2.5 py-1.5 [background:var(--surface-2,var(--card))] sm:max-w-[320px]">
                              <div className="flex items-center gap-1.5">
                                <PanelBadge
                                  tone={feedbackBadgeTone}
                                  className="h-5 w-[150px] justify-center px-2 text-[10px]"
                                >
                                  {feedbackTitle}
                                </PanelBadge>
                                <span className={feedbackIndicatorClass} />
                              </div>
                              <p className="mt-1 h-[14px] truncate text-[10px] text-muted-foreground">
                                {feedbackDetail}
                              </p>
                            </div>

                            <PanelButton
                              type="button"
                              onClick={() => toggleVariantsVisibility(original._id)}
                              className="h-8 w-full rounded-md px-2.5 text-[11px] sm:w-[116px] sm:justify-center"
                            >
                              Ocultar variantes
                            </PanelButton>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground">
                                Variantes derivadas ({generatedCount})
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {availableVariantKeys.length > 0 ? (
                                  availableVariantKeys.map((variantKey) => (
                                    <span
                                      key={`${original._id}-summary-${variantKey}`}
                                      className={summaryVariantBadgeClass}
                                    >
                                      {variantKey}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[11px] text-muted-foreground">
                                    Sin variantes generadas
                                  </span>
                                )}
                              </div>
                            </div>
                            <PanelButton
                              type="button"
                              onClick={() => toggleVariantsVisibility(original._id)}
                              className="h-8 rounded-md px-2.5 text-[11px]"
                            >
                              Ver variantes
                            </PanelButton>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1.5">
                          <PanelButton
                            type="button"
                            onClick={() => openInNewTab(original.url)}
                            className="h-8 rounded-md px-2.5 text-[11px]"
                          >
                            Ver
                          </PanelButton>
                          <PanelButton
                            type="button"
                            onClick={() => copy(original.url)}
                            className="h-8 rounded-md px-2.5 text-[11px]"
                          >
                            Copiar URL
                          </PanelButton>
                          <PanelButton
                            type="button"
                            onClick={() => startEdit(original)}
                            disabled={rowBusyId === original._id}
                            className="h-8 rounded-md px-2.5 text-[11px]"
                          >
                            Editar
                          </PanelButton>
                          <PanelButton
                            type="button"
                            onClick={() => removeAsset(original)}
                            disabled={rowBusyId === original._id}
                            className="h-8 rounded-md px-2.5 text-[11px] [background:var(--accent-soft,var(--muted))] [color:var(--accent-strong,var(--foreground))] hover:[background:var(--accent-soft,var(--muted))]"
                          >
                            Borrar
                          </PanelButton>
                        </div>
                      </div>
                    </div>

                    {isVariantsExpanded ? (
                      <div className="mt-1 rounded-lg border border-border/70 p-1 [background:var(--surface-2,var(--card))]">
                        <div className="grid gap-0.5 sm:grid-cols-2 xl:grid-cols-3">
                          {MANUAL_VARIANT_SLOTS.map((slot) => {
                            const variant = group.variantsByKey[slot.key];
                            const isSlotBusy = isVariantBusyForOriginal && busyVariantKey === slot.key;

                            if (!variant) {
                              return (
                                <div
                                  key={slot.key}
                                  className={`${variantSlotShellClass} border-dashed border-border [background:var(--surface-3,var(--muted))]`}
                                >
                                  <div className={variantSlotHeaderClass}>
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border [background:var(--surface-1,var(--background))]">
                                      <span className="h-1.5 w-1.5 rounded-full [background:var(--text-subtle)] opacity-70" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="truncate text-[11px] font-semibold text-foreground">
                                        {slot.title}
                                      </div>
                                      <div className="truncate text-[10px] text-muted-foreground">
                                        Pendiente de generar.
                                      </div>
                                      <div className={`${variantSlotMetaRowClass} rounded-sm border border-dashed border-border/80 px-1 [background:var(--surface-1,var(--background))]`}>
                                        <PanelBadge tone="neutral" className="h-4 px-1 text-[9px]">
                                          slot reservado
                                        </PanelBadge>
                                      </div>
                                    </div>
                                  </div>

                                  <div className={variantActionRowClass}>
                                    <PanelButton
                                      type="button"
                                      onClick={() => generateVariant(original, slot.key)}
                                      disabled={isVariantBusyForOriginal}
                                      className={`${variantActionButtonClass} col-span-2 sm:col-span-1`}
                                    >
                                      {isSlotBusy ? "Solicitando..." : slot.actionLabel}
                                    </PanelButton>
                                  </div>
                                </div>
                              );
                            }

                            const isVariantRestricted = variant.allowedIn.length > 0;
                            const slotPipelineBadgeClass =
                              variant.pipelineStatus === "failed"
                                ? "inline-flex h-4 min-w-0 items-center rounded-full border border-border px-1 text-[9px] leading-none whitespace-nowrap [background:var(--danger-soft,var(--surface-3,var(--muted)))] [color:var(--danger-foreground,var(--foreground))]"
                                : compactVariantMetaBadgeClass;

                            return (
                              <div
                                key={slot.key}
                                className={variantSlotShellClass}
                              >
                                <div className={variantSlotHeaderClass}>
                                  <div className="h-7 w-7 shrink-0 overflow-hidden rounded-md border border-border [background:var(--surface-2,var(--card))]">
                                    {renderThumb(variant)}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="truncate text-[11px] font-semibold text-foreground">
                                      {slot.title}
                                    </div>
                                    <div className="truncate text-[10px] text-muted-foreground">
                                      {variant.label}
                                    </div>
                                    <div className={variantSlotMetaRowClass}>
                                      <span className={`${compactVariantMetaBadgeClass} shrink-0`}>
                                        {variant.kind}
                                      </span>
                                      <span className={`${slotPipelineBadgeClass} min-w-0 truncate`}>
                                        pipeline: {variant.pipelineStatus}
                                      </span>
                                      <span className={`${compactVariantMetaBadgeClass} shrink-0`}>
                                        {isVariantRestricted ? "restringido" : "uso libre"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className={variantActionRowClass}>
                                  <PanelButton
                                    type="button"
                                    onClick={() => openInNewTab(variant.url)}
                                    className={variantActionButtonClass}
                                  >
                                    Ver
                                  </PanelButton>
                                  <PanelButton
                                    type="button"
                                    onClick={() => copy(variant.url)}
                                    className={variantActionButtonClass}
                                  >
                                    Copiar
                                  </PanelButton>
                                  <PanelButton
                                    type="button"
                                    onClick={() => startEdit(variant)}
                                    disabled={rowBusyId === variant._id}
                                    className={variantActionButtonClass}
                                  >
                                    Editar
                                  </PanelButton>
                                  <PanelButton
                                    type="button"
                                    onClick={() => removeAsset(variant)}
                                    disabled={rowBusyId === variant._id}
                                    className={`${variantActionButtonClass} [background:var(--accent-soft,var(--muted))] [color:var(--accent-strong,var(--foreground))] hover:[background:var(--accent-soft,var(--muted))]`}
                                  >
                                    Borrar
                                  </PanelButton>
                                </div>
                              </div>
                            );
                          })}

                          {group.extraVariants.map((variant) => {
                            const isVariantRestricted = variant.allowedIn.length > 0;
                            const compactPipelineBadgeClass =
                              variant.pipelineStatus === "failed"
                                ? "inline-flex h-4 min-w-0 items-center rounded-full border border-border px-1 text-[9px] leading-none whitespace-nowrap [background:var(--danger-soft,var(--surface-3,var(--muted)))] [color:var(--danger-foreground,var(--foreground))]"
                                : compactVariantMetaBadgeClass;

                            return (
                              <div
                                key={variant._id}
                                className={variantSlotShellClass}
                              >
                                <div className={variantSlotHeaderClass}>
                                  <div className="h-7 w-7 shrink-0 overflow-hidden rounded-md border border-border [background:var(--surface-2,var(--card))]">
                                    {renderThumb(variant)}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="truncate text-[11px] font-semibold text-foreground">
                                      {variant.variantKey}
                                    </div>
                                    <div className="truncate text-[10px] text-muted-foreground">
                                      {variant.label}
                                    </div>
                                    <div className={variantSlotMetaRowClass}>
                                      <span className={`${compactVariantMetaBadgeClass} shrink-0`}>
                                        {variant.kind}
                                      </span>
                                      <span className={`${compactPipelineBadgeClass} min-w-0 truncate`}>
                                        pipeline: {variant.pipelineStatus}
                                      </span>
                                      <span className={`${compactVariantMetaBadgeClass} shrink-0`}>
                                        {isVariantRestricted ? "restringido" : "uso libre"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className={variantActionRowClass}>
                                  <PanelButton
                                    type="button"
                                    onClick={() => openInNewTab(variant.url)}
                                    className={variantActionButtonClass}
                                  >
                                    Ver
                                  </PanelButton>
                                  <PanelButton
                                    type="button"
                                    onClick={() => copy(variant.url)}
                                    className={variantActionButtonClass}
                                  >
                                    Copiar
                                  </PanelButton>
                                  <PanelButton
                                    type="button"
                                    onClick={() => startEdit(variant)}
                                    disabled={rowBusyId === variant._id}
                                    className={variantActionButtonClass}
                                  >
                                    Editar
                                  </PanelButton>
                                  <PanelButton
                                    type="button"
                                    onClick={() => removeAsset(variant)}
                                    disabled={rowBusyId === variant._id}
                                    className={`${variantActionButtonClass} [background:var(--accent-soft,var(--muted))] [color:var(--accent-strong,var(--foreground))] hover:[background:var(--accent-soft,var(--muted))]`}
                                  >
                                    Borrar
                                  </PanelButton>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <p className="mt-2 min-h-[16px] text-[11px] text-muted-foreground">
                          {missingVariantSlots.length > 0
                            ? `Slots pendientes: ${missingVariantSlots
                                .map((slot) => slot.title)
                                .join(", ")}`
                            : " "}
                        </p>
                      </div>
                    ) : null}
                    </PanelCard>
                  </article>
                );
              })}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Nota: para upload en Vercel necesitas `BLOB_READ_WRITE_TOKEN`.
          </p>
        </section>
      </div>
      <BackToTop threshold={320} />

      {isUploadSheetOpen ? (
        <div className="fixed inset-0 z-110 bg-black/35 px-3 pb-3 pt-6 lg:hidden sm:px-4 sm:pb-4">
          <button
            type="button"
            aria-label="Cerrar alta de asset"
            className="absolute inset-0"
            onClick={() => setIsUploadSheetOpen(false)}
          />

            <PanelCard className="absolute inset-x-3 bottom-3 max-h-[calc(100vh-1.5rem)] overflow-hidden p-0 lg:hidden sm:inset-x-4 sm:bottom-4">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold">Nuevo asset</h3>
              <PanelButton type="button" onClick={() => setIsUploadSheetOpen(false)} className="h-9 px-3 text-xs">
                Cerrar
              </PanelButton>
            </div>

            <div className="max-h-[calc(88vh-64px)] overflow-y-auto p-4">
              <form onSubmit={onUpload} className="grid gap-3">
                <PanelCard variant="task" className="p-3">
                  <p className="text-xs font-semibold text-foreground">Bloque 1 · Asset base</p>
                  <div className="mt-2 grid gap-3">
                    <label className="grid gap-1">
                      <span className="text-xs font-medium text-muted-foreground">Archivo</span>
                      <input
                        id="taller-media-file-mobile"
                        ref={mobileFileRef}
                        type="file"
                        className="sr-only"
                        accept="image/*,video/*,.svg"
                        onChange={(e) => setMobileSelectedFileName(e.target.files?.[0]?.name ?? "")}
                      />
                      <PanelButton
                        variant="primary"
                        type="button"
                        onClick={() => mobileFileRef.current?.click()}
                        className="h-10 w-full justify-center"
                      >
                        {mobileSelectedFileName ? "Cambiar archivo" : "Seleccionar archivo"}
                      </PanelButton>
                      <span className="min-h-[1rem] text-[11px] [color:var(--text-subtle)]">
                        {mobileSelectedFileName || "Aún no has seleccionado un archivo."}
                      </span>
                    </label>

                    <label className="grid gap-1">
                      <span className="text-xs font-medium text-muted-foreground">Label (opcional)</span>
                      <input
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        className={uploadInputClass}
                        placeholder="Ej: Hero ilustracion"
                      />
                    </label>
                  </div>
                </PanelCard>

                <div className="rounded-xl border border-border/70 p-3 [background:var(--surface-1,var(--background))]">
                  <p className="text-xs font-semibold text-foreground">Bloque 2 · Clasificación base</p>
                  <div className="mt-2 grid gap-3">
                    <label className="grid gap-1">
                      <span className="text-xs font-medium text-muted-foreground">Categoría visual</span>
                      <select
                        value={visualCategory}
                        onChange={(e) => setVisualCategory(e.target.value as VisualCategory)}
                        className={uploadSelectClass}
                      >
                        {VISUAL_CATEGORY_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-1">
                      <span className="text-xs font-medium text-muted-foreground">Tags libres (opcional)</span>
                      <input
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className={uploadInputClass}
                        placeholder="hero:background"
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 p-3 [background:var(--surface-1,var(--background))]">
                  <p className="text-xs font-semibold text-foreground">Bloque 3 · Perfil visual</p>
                  <div className="mt-2 grid gap-3">
                    <div className="grid gap-1">
                      <span className="text-xs font-medium text-muted-foreground">Estilo (máx. 2)</span>
                      <div className="flex flex-wrap gap-2">
                        {STYLE_OPTIONS.map((option) => {
                          const selected = styleSelection.includes(option);
                          const disabled = styleSelection.length >= 2 && !selected;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() =>
                                setStyleSelection((prev) => toggleSelection(prev, option, 2))
                              }
                              disabled={disabled}
                              aria-pressed={selected}
                              className={[
                                "rounded-full border px-2 py-1 text-xs transition-colors",
                                selected
                                  ? "border-border [background:var(--badge-bg)] [color:var(--badge-fg)]"
                                  : "border-border [background:var(--surface-2,var(--background))] [color:var(--text-subtle)]",
                                disabled ? "opacity-50" : "",
                              ].join(" ")}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid gap-1">
                      <span className="text-xs font-medium text-muted-foreground">Color (máx. 2)</span>
                      <div className="flex flex-wrap gap-2">
                        {COLOR_OPTIONS.map((option) => {
                          const selected = colorSelection.includes(option);
                          const disabled = colorSelection.length >= 2 && !selected;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() =>
                                setColorSelection((prev) => toggleSelection(prev, option, 2))
                              }
                              disabled={disabled}
                              aria-pressed={selected}
                              className={[
                                "rounded-full border px-2 py-1 text-xs transition-colors",
                                selected
                                  ? "border-border [background:var(--badge-bg)] [color:var(--badge-fg)]"
                                  : "border-border [background:var(--surface-2,var(--background))] [color:var(--text-subtle)]",
                                disabled ? "opacity-50" : "",
                              ].join(" ")}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid gap-1">
                      <span className="text-xs font-medium text-muted-foreground">Intención (máx. 3)</span>
                      <div className="flex flex-wrap gap-2">
                        {INTENTION_OPTIONS.map((option) => {
                          const selected = intentionSelection.includes(option);
                          const disabled = intentionSelection.length >= 3 && !selected;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() =>
                                setIntentionSelection((prev) => toggleSelection(prev, option, 3))
                              }
                              disabled={disabled}
                              aria-pressed={selected}
                              className={[
                                "rounded-full border px-2 py-1 text-xs transition-colors",
                                selected
                                  ? "border-border [background:var(--badge-bg)] [color:var(--badge-fg)]"
                                  : "border-border [background:var(--surface-2,var(--background))] [color:var(--text-subtle)]",
                                disabled ? "opacity-50" : "",
                              ].join(" ")}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 p-3 [background:var(--surface-1,var(--background))]">
                  <p className="text-xs font-semibold text-foreground">Bloque 4 · Ownership / alcance</p>
                  <div className="mt-2 grid gap-3">
                    <label className="grid gap-1">
                      <span className="text-xs font-medium text-muted-foreground">Scope</span>
                      <select
                        value={uploadScope}
                        onChange={(e) => setUploadScope(e.target.value as OwnershipScope)}
                        className={uploadSelectClass}
                      >
                        {OWNERSHIP_SCOPE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-1">
                      <span className="text-xs font-medium text-muted-foreground">Visibility / reuse policy</span>
                      <select
                        value={uploadVisibility}
                        onChange={(e) =>
                          setUploadVisibility(e.target.value as OwnershipVisibility)
                        }
                        className={uploadSelectClass}
                      >
                        {OWNERSHIP_VISIBILITY_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-1">
                      <span className="text-xs font-medium text-muted-foreground">Sector</span>
                      <select
                        value={uploadSector}
                        onChange={(e) => setUploadSector(e.target.value as OwnershipSector)}
                        className={uploadSelectClass}
                      >
                        {OWNERSHIP_SECTOR_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-1">
                      <span className="text-xs font-medium text-muted-foreground">Business / client (siguiente fase)</span>
                      <select disabled className={`${uploadSelectClass} opacity-60`} value="">
                        <option value="">No conectado aún</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 p-3 [background:var(--surface-1,var(--background))]">
                  <p className="text-xs font-semibold text-foreground">Bloque 5 · Restricción de uso (`allowedIn`)</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Si no seleccionas nada, el asset queda en uso libre.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ALLOWED_IN_OPTIONS.map((option) => {
                      const selected = allowedInSelection.includes(option);
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() =>
                            setAllowedInSelection((prev) =>
                              prev.includes(option)
                                ? prev.filter((value) => value !== option)
                                : [...prev, option]
                            )
                          }
                          aria-pressed={selected}
                          className={[
                            "rounded-full border px-2 py-1 text-xs transition-colors",
                            selected
                              ? "border-border [background:var(--badge-bg)] [color:var(--badge-fg)]"
                              : "border-border [background:var(--surface-2,var(--background))] [color:var(--text-subtle)]",
                          ].join(" ")}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <PanelButton
                  variant="primary"
                  type="submit"
                  disabled={busy}
                  className="h-10 w-full justify-center"
                >
                  {busy ? "Subiendo asset base..." : "Subir asset"}
                </PanelButton>
                {uploadFeedback}
              </form>
            </div>
          </PanelCard>
        </div>
      ) : null}

      {editingItem ? (
        <div className="fixed inset-0 z-120 flex items-end bg-black/40 lg:items-stretch lg:justify-end">
          <button
            type="button"
            aria-label="Cerrar edicion"
            className="absolute inset-0"
            onClick={cancelEdit}
          />

          <section className="relative flex max-h-[90vh] w-full flex-col rounded-t-2xl border border-border [background:var(--surface-2,var(--card))] lg:h-full lg:max-h-none lg:w-[460px] lg:rounded-none lg:border-l">
            <div className="border-b border-border px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="truncate text-sm font-semibold">Editar asset</h3>
                <PanelButton type="button" onClick={cancelEdit} className="h-9 px-3 text-xs">
                  Cerrar
                </PanelButton>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">{editingItem.label}</p>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              <div className="flex items-start gap-3 rounded-lg border border-border p-3 [background:var(--surface-1,var(--background))]">
                <div className="h-14 w-14 overflow-hidden rounded-md border border-border">
                  {renderThumb(editingItem)}
                </div>
                <div className="min-w-0 text-xs [color:var(--text-subtle)]">
                  <div className="truncate">kind: {editingItem.kind}</div>
                  <div className="truncate">scope: {editingItem.scope}</div>
                  <div className="truncate">
                    uso: {editingItem.allowedIn.length > 0 ? "restringido" : "libre"}
                  </div>
                </div>
              </div>

              <label className="grid gap-1">
                <span className="text-xs font-medium text-muted-foreground">Label</span>
                <input
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className={inputClass}
                />
              </label>

              <div className="rounded-xl border border-border/70 p-3 [background:var(--surface-1,var(--background))]">
                <p className="text-xs font-semibold text-foreground">Clasificación</p>
                <div className="mt-2 grid gap-3">
                  <label className="grid gap-1">
                    <span className="text-xs font-medium text-muted-foreground">Categoría visual</span>
                    <select
                      value={editVisualCategory}
                      onChange={(e) => setEditVisualCategory(e.target.value as VisualCategory)}
                      className={selectClass}
                    >
                      {VISUAL_CATEGORY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-medium text-muted-foreground">Tags libres (opcional)</span>
                    <input
                      value={editFreeTags}
                      onChange={(e) => setEditFreeTags(e.target.value)}
                      className={inputClass}
                      placeholder="hero:background, campaña:abril"
                    />
                  </label>

                  <div className="grid gap-1">
                    <span className="text-xs font-medium text-muted-foreground">Estilo (máx. 2)</span>
                    <div className="flex flex-wrap gap-2">
                      {STYLE_OPTIONS.map((option) => {
                        const selected = editStyleSelection.includes(option);
                        const disabled = editStyleSelection.length >= 2 && !selected;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              setEditStyleSelection((prev) => toggleSelection(prev, option, 2))
                            }
                            disabled={disabled}
                            aria-pressed={selected}
                            className={[
                              "rounded-full border px-2 py-1 text-xs transition-colors",
                              selected
                                ? "border-border [background:var(--badge-bg)] [color:var(--badge-fg)]"
                                : "border-border [background:var(--surface-2,var(--background))] [color:var(--text-subtle)]",
                              disabled ? "opacity-50" : "",
                            ].join(" ")}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-1">
                    <span className="text-xs font-medium text-muted-foreground">Color (máx. 2)</span>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map((option) => {
                        const selected = editColorSelection.includes(option);
                        const disabled = editColorSelection.length >= 2 && !selected;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              setEditColorSelection((prev) => toggleSelection(prev, option, 2))
                            }
                            disabled={disabled}
                            aria-pressed={selected}
                            className={[
                              "rounded-full border px-2 py-1 text-xs transition-colors",
                              selected
                                ? "border-border [background:var(--badge-bg)] [color:var(--badge-fg)]"
                                : "border-border [background:var(--surface-2,var(--background))] [color:var(--text-subtle)]",
                              disabled ? "opacity-50" : "",
                            ].join(" ")}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-1">
                    <span className="text-xs font-medium text-muted-foreground">Intención (máx. 3)</span>
                    <div className="flex flex-wrap gap-2">
                      {INTENTION_OPTIONS.map((option) => {
                        const selected = editIntentionSelection.includes(option);
                        const disabled = editIntentionSelection.length >= 3 && !selected;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              setEditIntentionSelection((prev) => toggleSelection(prev, option, 3))
                            }
                            disabled={disabled}
                            aria-pressed={selected}
                            className={[
                              "rounded-full border px-2 py-1 text-xs transition-colors",
                              selected
                                ? "border-border [background:var(--badge-bg)] [color:var(--badge-fg)]"
                                : "border-border [background:var(--surface-2,var(--background))] [color:var(--text-subtle)]",
                              disabled ? "opacity-50" : "",
                            ].join(" ")}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/70 p-3 [background:var(--surface-1,var(--background))]">
                <p className="text-xs font-semibold text-foreground">Ownership / alcance</p>
                <div className="mt-2 grid gap-3">
                  <label className="grid gap-1">
                    <span className="text-xs font-medium text-muted-foreground">Scope</span>
                    <select
                      value={editScope}
                      onChange={(e) => setEditScope(e.target.value as OwnershipScope)}
                      className={selectClass}
                    >
                      {OWNERSHIP_SCOPE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-medium text-muted-foreground">Visibility / reuse policy</span>
                    <select
                      value={editVisibility}
                      onChange={(e) => setEditVisibility(e.target.value as OwnershipVisibility)}
                      className={selectClass}
                    >
                      {OWNERSHIP_VISIBILITY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1">
                    <span className="text-xs font-medium text-muted-foreground">Sector</span>
                    <select
                      value={editSector}
                      onChange={(e) => setEditSector(e.target.value as OwnershipSector)}
                      className={selectClass}
                    >
                      {OWNERSHIP_SECTOR_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="rounded-xl border border-border/70 p-3 [background:var(--surface-1,var(--background))]">
                <p className="text-xs font-semibold text-foreground">Restricción de uso (`allowedIn`)</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Si no seleccionas nada, el asset queda en uso libre.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ALLOWED_IN_OPTIONS.map((option) => {
                    const selected = editAllowedInSelection.includes(option);
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() =>
                          setEditAllowedInSelection((prev) =>
                            prev.includes(option)
                              ? prev.filter((value) => value !== option)
                              : [...prev, option]
                          )
                        }
                        aria-pressed={selected}
                        className={[
                          "rounded-full border px-2 py-1 text-xs transition-colors",
                          selected
                            ? "border-border [background:var(--badge-bg)] [color:var(--badge-fg)]"
                            : "border-border [background:var(--surface-2,var(--background))] [color:var(--text-subtle)]",
                        ].join(" ")}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                {editAllowedInExtra.length > 0 ? (
                  <p className="mt-2 text-[11px] [color:var(--text-subtle)]">
                    Se conservan restricciones legacy no catalogadas: {editAllowedInExtra.join(", ")}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-border px-4 py-3 [background:var(--surface-3,var(--card))]">
              <div className="flex items-center justify-end gap-2">
                <PanelButton
                  type="button"
                  onClick={cancelEdit}
                  disabled={rowBusyId === editingItem._id}
                  className="h-10"
                >
                  Cancelar
                </PanelButton>
                <PanelButton
                  variant="primary"
                  type="button"
                  onClick={saveEdit}
                  disabled={rowBusyId === editingItem._id}
                  className="h-10"
                >
                  {rowBusyId === editingItem._id ? "Guardando..." : "Guardar cambios"}
                </PanelButton>
              </div>
            </div>
          </section>
        </div>
      ) : null}

    </div>
  );
}
