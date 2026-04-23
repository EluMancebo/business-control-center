"use client";

import { useEffect, useMemo, useState } from "react";
import PanelBadge from "@/components/panel/ui/PanelBadge";
import PanelButton from "@/components/panel/ui/PanelButton";
import PanelCard from "@/components/panel/ui/PanelCard";
import { fetchSystemMediaClientByQuery, formatBytes } from "@/lib/taller/media/service";
import type {
  AssetItem,
  AssetScope,
  AssetStatus,
  AssetVariantKey,
  MediaAllowedComponent,
  MediaAssetRole,
  MediaFormatKind,
  MediaOrientation,
  MediaPreferredUsage,
  MediaReviewStatus,
} from "@/lib/taller/media/types";

type PickerFilterValue<T extends string> = T | "all";

type AssetPickerMode = "universal" | "contextual";

export type AssetPickerInitialFilters = {
  assetRole?: MediaAssetRole;
  formatKind?: MediaFormatKind;
  allowedComponent?: MediaAllowedComponent;
  preferredUsage?: MediaPreferredUsage;
  reviewStatus?: MediaReviewStatus;
  orientation?: MediaOrientation;
};

export type AssetPickerProps = {
  value?: string | null;
  onSelect: (asset: AssetItem) => void;
  onSelectId?: (assetId: string) => void;
  title?: string;
  description?: string;
  className?: string;
  mode?: AssetPickerMode;
  initialFilters?: AssetPickerInitialFilters;
  requireConfirm?: boolean;
  confirmLabel?: string;
  emptyMessage?: string;
  status?: AssetStatus | "all";
  scope?: AssetScope | "all";
  variantPreference?: AssetVariantKey;
  allowedVariantKeys?: AssetVariantKey[];
  hideNonPreferredVariants?: boolean;
};

const MEDIA_FORMAT_KIND_OPTIONS: MediaFormatKind[] = ["image", "svg", "video", "pdf"];
const MEDIA_ASSET_ROLE_OPTIONS: MediaAssetRole[] = [
  "logo",
  "icon",
  "photo",
  "illustration",
  "texture",
  "document",
  "video",
];
const MEDIA_ALLOWED_COMPONENT_OPTIONS: MediaAllowedComponent[] = [
  "hero",
  "banner",
  "header",
  "footer",
  "popup",
  "card",
  "gallery",
  "social",
  "document",
];
const MEDIA_REVIEW_STATUS_OPTIONS: MediaReviewStatus[] = [
  "draft",
  "reviewed",
  "approved",
  "rejected",
  "deprecated",
];
const MEDIA_PREFERRED_USAGE_OPTIONS: MediaPreferredUsage[] = [
  "hero-background",
  "hero-logo",
  "navbar-logo",
  "footer-mark",
  "banner-background",
  "popup-media",
  "gallery-item",
  "social-asset",
  "card-media",
  "document-embed",
];
const MEDIA_ORIENTATION_OPTIONS: MediaOrientation[] = [
  "landscape",
  "portrait",
  "square",
  "unknown",
];
const ASSET_VARIANT_KEY_OPTIONS: AssetVariantKey[] = [
  "original",
  "optimized",
  "vectorized-svg",
  "thumbnail",
];

function getAssetFamilyId(item: AssetItem) {
  return item.sourceAssetId ?? item._id;
}

function getAssetTimestamp(item: AssetItem) {
  const value = Date.parse(item.updatedAt || item.createdAt || "");
  return Number.isFinite(value) ? value : 0;
}

function getVariantRank(variantKey: AssetVariantKey, variantPreference?: AssetVariantKey) {
  if (variantPreference && variantKey === variantPreference) return -1;
  const index = ASSET_VARIANT_KEY_OPTIONS.indexOf(variantKey);
  return index === -1 ? ASSET_VARIANT_KEY_OPTIONS.length : index;
}

function compareByVariantPriority(
  left: AssetItem,
  right: AssetItem,
  variantPreference?: AssetVariantKey
) {
  const rankDiff = getVariantRank(left.variantKey, variantPreference) - getVariantRank(right.variantKey, variantPreference);
  if (rankDiff !== 0) return rankDiff;
  return getAssetTimestamp(right) - getAssetTimestamp(left);
}

function getReviewTone(reviewStatus: MediaReviewStatus) {
  if (reviewStatus === "approved") return "success" as const;
  if (reviewStatus === "reviewed") return "processing" as const;
  if (reviewStatus === "rejected" || reviewStatus === "deprecated") return "danger" as const;
  return "neutral" as const;
}

function Thumb({ item }: { item: AssetItem }) {
  if (item.formatKind === "video") {
    return (
      <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-muted-foreground">
        VIDEO
      </div>
    );
  }
  if (item.formatKind === "pdf") {
    return (
      <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-muted-foreground">
        PDF
      </div>
    );
  }

  const thumbClass =
    item.formatKind === "svg" ? "h-full w-full object-contain p-1.5" : "h-full w-full object-cover";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={item.url} alt={item.label} className={thumbClass} loading="lazy" />
  );
}

export default function AssetPicker({
  value,
  onSelect,
  onSelectId,
  title = "Selector de assets",
  description = "Seleccion visual desde Media con contrato canonico.",
  className,
  mode = "universal",
  initialFilters,
  requireConfirm = true,
  confirmLabel = "Usar seleccionado",
  emptyMessage = "No hay assets para los filtros activos.",
  status = "active",
  scope = "system",
  variantPreference,
  allowedVariantKeys,
  hideNonPreferredVariants = false,
}: AssetPickerProps) {
  const [items, setItems] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(value ?? "");

  const [assetRoleFilter, setAssetRoleFilter] = useState<PickerFilterValue<MediaAssetRole>>(
    initialFilters?.assetRole ?? "all"
  );
  const [formatKindFilter, setFormatKindFilter] = useState<PickerFilterValue<MediaFormatKind>>(
    initialFilters?.formatKind ?? "all"
  );
  const [allowedComponentFilter, setAllowedComponentFilter] = useState<
    PickerFilterValue<MediaAllowedComponent>
  >(initialFilters?.allowedComponent ?? "all");
  const [reviewStatusFilter, setReviewStatusFilter] = useState<PickerFilterValue<MediaReviewStatus>>(
    initialFilters?.reviewStatus ?? "all"
  );
  const [preferredUsageFilter, setPreferredUsageFilter] = useState<
    PickerFilterValue<MediaPreferredUsage>
  >(initialFilters?.preferredUsage ?? "all");
  const [orientationFilter, setOrientationFilter] = useState<PickerFilterValue<MediaOrientation>>(
    initialFilters?.orientation ?? "all"
  );

  useEffect(() => {
    setSelectedId(value ?? "");
  }, [value]);

  useEffect(() => {
    setAssetRoleFilter(initialFilters?.assetRole ?? "all");
    setFormatKindFilter(initialFilters?.formatKind ?? "all");
    setAllowedComponentFilter(initialFilters?.allowedComponent ?? "all");
    setReviewStatusFilter(initialFilters?.reviewStatus ?? "all");
    setPreferredUsageFilter(initialFilters?.preferredUsage ?? "all");
    setOrientationFilter(initialFilters?.orientation ?? "all");
  }, [
    initialFilters?.assetRole,
    initialFilters?.formatKind,
    initialFilters?.allowedComponent,
    initialFilters?.reviewStatus,
    initialFilters?.preferredUsage,
    initialFilters?.orientation,
  ]);

  const pinnedFilters = useMemo(
    () => ({
      assetRole: Boolean(initialFilters?.assetRole),
      formatKind: Boolean(initialFilters?.formatKind),
      allowedComponent: Boolean(initialFilters?.allowedComponent),
      reviewStatus: Boolean(initialFilters?.reviewStatus),
      preferredUsage: Boolean(initialFilters?.preferredUsage),
      orientation: Boolean(initialFilters?.orientation),
    }),
    [
      initialFilters?.assetRole,
      initialFilters?.formatKind,
      initialFilters?.allowedComponent,
      initialFilters?.reviewStatus,
      initialFilters?.preferredUsage,
      initialFilters?.orientation,
    ]
  );

  const allowedVariantKeysNormalized = useMemo(() => {
    if (!Array.isArray(allowedVariantKeys) || allowedVariantKeys.length === 0) return null;
    return Array.from(new Set(allowedVariantKeys));
  }, [allowedVariantKeys]);

  const allowedVariantKeySet = useMemo(() => {
    if (!allowedVariantKeysNormalized) return null;
    return new Set<AssetVariantKey>(allowedVariantKeysNormalized);
  }, [allowedVariantKeysNormalized]);

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const next = await fetchSystemMediaClientByQuery({
          scope,
          status,
          search: search.trim() || undefined,
          assetRole: assetRoleFilter === "all" ? undefined : assetRoleFilter,
          formatKind: formatKindFilter === "all" ? undefined : formatKindFilter,
          allowedComponent: allowedComponentFilter === "all" ? undefined : allowedComponentFilter,
          reviewStatus: reviewStatusFilter === "all" ? undefined : reviewStatusFilter,
          preferredUsage: preferredUsageFilter === "all" ? undefined : preferredUsageFilter,
          orientation: orientationFilter === "all" ? undefined : orientationFilter,
          variantKey:
            allowedVariantKeysNormalized && allowedVariantKeysNormalized.length === 1
              ? allowedVariantKeysNormalized[0]
              : undefined,
        });
        if (!active) return;
        setItems(next);
      } catch (nextError: unknown) {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "No se pudo cargar Media.");
        setItems([]);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [
    scope,
    status,
    search,
    assetRoleFilter,
    formatKindFilter,
    allowedComponentFilter,
    reviewStatusFilter,
    preferredUsageFilter,
    orientationFilter,
    allowedVariantKeysNormalized,
  ]);

  const displayItems = useMemo(() => {
    const groupedByFamily = new Map<string, AssetItem[]>();

    items.forEach((item) => {
      if (allowedVariantKeySet && !allowedVariantKeySet.has(item.variantKey)) return;
      const familyId = getAssetFamilyId(item);
      const current = groupedByFamily.get(familyId);
      if (current) {
        current.push(item);
        return;
      }
      groupedByFamily.set(familyId, [item]);
    });

    const orderedFamilies = Array.from(groupedByFamily.entries())
      .map(([familyId, familyItems]) => {
        const latestTimestamp = familyItems.reduce((acc, item) => {
          const timestamp = getAssetTimestamp(item);
          return timestamp > acc ? timestamp : acc;
        }, 0);
        return { familyId, familyItems, latestTimestamp };
      })
      .sort((left, right) => {
        if (right.latestTimestamp !== left.latestTimestamp) {
          return right.latestTimestamp - left.latestTimestamp;
        }
        return left.familyId.localeCompare(right.familyId);
      });

    const flattened: AssetItem[] = [];
    orderedFamilies.forEach(({ familyItems }) => {
      const sortedFamily = [...familyItems].sort((left, right) =>
        compareByVariantPriority(left, right, variantPreference)
      );

      if (hideNonPreferredVariants && variantPreference) {
        const preferred = sortedFamily.filter((item) => item.variantKey === variantPreference);
        if (preferred.length > 0) {
          flattened.push(...preferred);
          return;
        }
      }

      flattened.push(...sortedFamily);
    });

    return flattened;
  }, [allowedVariantKeySet, hideNonPreferredVariants, items, variantPreference]);

  useEffect(() => {
    if (!displayItems.length) {
      if (selectedId) setSelectedId("");
      return;
    }
    const isCurrentSelectionVisible = displayItems.some((item) => item._id === selectedId);
    if (!isCurrentSelectionVisible) {
      setSelectedId(displayItems[0]._id);
    }
  }, [displayItems, selectedId]);

  const selectedAsset = useMemo(
    () =>
      displayItems.find((item) => item._id === selectedId) ??
      items.find((item) => item._id === selectedId) ??
      null,
    [displayItems, items, selectedId]
  );

  const contextChips = useMemo(() => {
    const chips: string[] = [];
    if (initialFilters?.assetRole) chips.push(`Rol: ${initialFilters.assetRole}`);
    if (initialFilters?.formatKind) chips.push(`Formato: ${initialFilters.formatKind}`);
    if (initialFilters?.allowedComponent) chips.push(`Componente: ${initialFilters.allowedComponent}`);
    if (initialFilters?.preferredUsage) chips.push(`Uso: ${initialFilters.preferredUsage}`);
    if (initialFilters?.reviewStatus) chips.push(`Revision: ${initialFilters.reviewStatus}`);
    if (initialFilters?.orientation) chips.push(`Orientacion: ${initialFilters.orientation}`);
    if (variantPreference) chips.push(`Variante preferida: ${variantPreference}`);
    if (allowedVariantKeysNormalized && allowedVariantKeysNormalized.length > 0) {
      chips.push(`Variantes permitidas: ${allowedVariantKeysNormalized.join(", ")}`);
    }
    if (hideNonPreferredVariants && variantPreference) {
      chips.push("Ocultar variantes no preferidas");
    }
    return chips;
  }, [
    initialFilters?.assetRole,
    initialFilters?.formatKind,
    initialFilters?.allowedComponent,
    initialFilters?.preferredUsage,
    initialFilters?.reviewStatus,
    initialFilters?.orientation,
    variantPreference,
    allowedVariantKeysNormalized,
    hideNonPreferredVariants,
  ]);

  function selectAndMaybeCommit(item: AssetItem) {
    setSelectedId(item._id);
    if (!requireConfirm) {
      onSelect(item);
      onSelectId?.(item._id);
    }
  }

  function commitSelected() {
    if (!selectedAsset) return;
    onSelect(selectedAsset);
    onSelectId?.(selectedAsset._id);
  }

  const showAssetRoleFilter = mode === "universal" || !pinnedFilters.assetRole;
  const showFormatKindFilter = mode === "universal" || !pinnedFilters.formatKind;
  const showAllowedComponentFilter = mode === "universal" || !pinnedFilters.allowedComponent;
  const showReviewStatusFilter = mode === "universal" || !pinnedFilters.reviewStatus;
  const showPreferredUsageFilter = mode === "universal" || !pinnedFilters.preferredUsage;
  const showOrientationFilter = mode === "universal" || !pinnedFilters.orientation;

  return (
    <PanelCard variant="task" className={["p-4", className].filter(Boolean).join(" ")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <PanelBadge tone={mode === "contextual" ? "processing" : "neutral"}>{mode}</PanelBadge>
      </div>

      {contextChips.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {contextChips.map((chip) => (
            <PanelBadge key={chip} className="h-5 px-2 text-[10px]">
              {chip}
            </PanelBadge>
          ))}
        </div>
      ) : null}

      <div className="mt-3 grid gap-2 lg:grid-cols-3 xl:grid-cols-4">
        <label className="grid gap-1 lg:col-span-2 xl:col-span-1">
          <span className="text-xs font-medium text-muted-foreground">Buscar</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ej: logo, hero, cover"
            className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </label>

        {showFormatKindFilter ? (
          <label className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Formato</span>
            <select
              value={formatKindFilter}
              onChange={(event) =>
                setFormatKindFilter(event.target.value as PickerFilterValue<MediaFormatKind>)
              }
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Todos</option>
              {MEDIA_FORMAT_KIND_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {showAssetRoleFilter ? (
          <label className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Rol</span>
            <select
              value={assetRoleFilter}
              onChange={(event) =>
                setAssetRoleFilter(event.target.value as PickerFilterValue<MediaAssetRole>)
              }
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Todos</option>
              {MEDIA_ASSET_ROLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {showAllowedComponentFilter ? (
          <label className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Componente</span>
            <select
              value={allowedComponentFilter}
              onChange={(event) =>
                setAllowedComponentFilter(
                  event.target.value as PickerFilterValue<MediaAllowedComponent>
                )
              }
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Todos</option>
              {MEDIA_ALLOWED_COMPONENT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {showReviewStatusFilter ? (
          <label className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Revision</span>
            <select
              value={reviewStatusFilter}
              onChange={(event) =>
                setReviewStatusFilter(
                  event.target.value as PickerFilterValue<MediaReviewStatus>
                )
              }
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Todos</option>
              {MEDIA_REVIEW_STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {showPreferredUsageFilter ? (
          <label className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Uso</span>
            <select
              value={preferredUsageFilter}
              onChange={(event) =>
                setPreferredUsageFilter(
                  event.target.value as PickerFilterValue<MediaPreferredUsage>
                )
              }
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Todos</option>
              {MEDIA_PREFERRED_USAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {showOrientationFilter ? (
          <label className="grid gap-1">
            <span className="text-xs font-medium text-muted-foreground">Orientacion</span>
            <select
              value={orientationFilter}
              onChange={(event) =>
                setOrientationFilter(event.target.value as PickerFilterValue<MediaOrientation>)
              }
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">Todas</option>
              {MEDIA_ORIENTATION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div className="mt-3 rounded-md border border-border/70 [background:var(--surface-1,var(--background))]">
        {loading ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">Cargando assets...</p>
        ) : error ? (
          <p className="px-3 py-8 text-center text-xs text-red-600">{error}</p>
        ) : displayItems.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">{emptyMessage}</p>
        ) : (
          <div className="grid gap-2 p-2 sm:grid-cols-2 xl:grid-cols-3">
            {displayItems.map((item) => {
              const isSelected = item._id === selectedId;
              const variantIsPreferred = variantPreference === item.variantKey;
              return (
                <button
                  key={item._id}
                  type="button"
                  onClick={() => selectAndMaybeCommit(item)}
                  className={[
                    "rounded-lg border p-2 text-left transition-colors",
                    isSelected
                      ? "border-(--badge-bg) [background:color-mix(in_oklab,var(--badge-bg)_25%,var(--surface-1,var(--background)))]"
                      : "border-border/70 [background:var(--surface-2,var(--background))] hover:[background:var(--surface-3,var(--background))]",
                  ].join(" ")}
                >
                  <div className="h-20 overflow-hidden rounded-md border border-border/60 [background:var(--surface-1,var(--background))]">
                    <Thumb item={item} />
                  </div>
                  <p className="mt-2 truncate text-xs font-semibold text-foreground">{item.label}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {formatBytes(item.bytes)} - {item.formatKind}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <PanelBadge
                      tone={variantIsPreferred ? "processing" : "neutral"}
                      className="h-5 px-2 text-[10px]"
                    >
                      {item.variantKey}
                    </PanelBadge>
                    <PanelBadge className="h-5 px-2 text-[10px]">{item.assetRole}</PanelBadge>
                    <PanelBadge className="h-5 px-2 text-[10px]">{item.reviewStatus}</PanelBadge>
                    {item.preferredUsage ? (
                      <PanelBadge tone={getReviewTone(item.reviewStatus)} className="h-5 px-2 text-[10px]">
                        {item.preferredUsage}
                      </PanelBadge>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {selectedAsset ? `Seleccionado: ${selectedAsset.label}` : "No hay seleccion activa."}
        </p>
        {requireConfirm ? (
          <PanelButton
            type="button"
            variant="primary"
            className="h-9 px-3 text-xs"
            disabled={!selectedAsset}
            onClick={commitSelected}
          >
            {confirmLabel}
          </PanelButton>
        ) : null}
      </div>
    </PanelCard>
  );
}
