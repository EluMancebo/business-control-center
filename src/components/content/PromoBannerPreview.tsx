import { deriveSurfaceTokens } from "@/lib/brand/surfaces";
import { OVERLAY_PRESETS } from "@/lib/overlay/presets";

type Props = {
  title?: string;
  description?: string;
  overlayPresetId?: string;
  mediaUrl?: string;
};

function getOverlayClass(strength: "none" | "soft" | "medium" | "strong") {
  if (strength === "none") return "";
  if (strength === "soft") return "bg-black/20";
  if (strength === "medium") return "bg-black/40";
  return "bg-black/55";
}

export default function PromoBannerPreview({ title, description, overlayPresetId, mediaUrl }: Props) {
  const surfaces = deriveSurfaceTokens();
  const preset = OVERLAY_PRESETS.find((item) => item.id === overlayPresetId) ?? OVERLAY_PRESETS[0];
  const overlayClass = getOverlayClass(preset?.strength ?? "none");
  const textColor = preset?.textPolicy === "dark" ? surfaces.textPrimary : surfaces.textOnInverse;

  return (
    <article
      className="relative aspect-[21/9] w-full overflow-hidden rounded-xl border border-border"
      style={{ backgroundColor: surfaces.bgBase, borderColor: surfaces.borderDefault }}
    >
      {mediaUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0" style={{ backgroundColor: surfaces.bgSubtle }} />
      )}

      {overlayClass ? <div className={`absolute inset-0 ${overlayClass}`} /> : null}

      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="space-y-2" style={{ color: textColor }}>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-90">
            Promo Banner · {preset?.label ?? "None"}
          </p>
          <h3 className="text-xl font-bold leading-tight sm:text-2xl">
            {title?.trim() || "Tu proxima promo empieza aqui"}
          </h3>
          <p className="max-w-2xl text-sm opacity-95">
            {description?.trim() ||
              "Describe una oferta, evento o incentivo para activar conversion en este bloque."}
          </p>
        </div>
      </div>
    </article>
  );
}
