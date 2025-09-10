type IconSize = "xs" | "sm" | "md" | "lg";

const SIZE_MAP: Record<IconSize, string> = {
  xs: "var(--icon-size-xs)",
  sm: "var(--icon-size-sm)",
  md: "var(--icon-size-md)",
  lg: "var(--icon-size-lg)",
};

export function Icon({
  name,
  size = "md",
  className = "",
  ariaLabel,
}: {
  name: string;
  size?: IconSize;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <img
      src={`/dieter/icons/${name}.svg`}
      width={SIZE_MAP[size]}
      height={SIZE_MAP[size]}
      className={className}
      role="img"
      aria-label={ariaLabel ?? name}
      alt=""
    />
  );
}


