import { initials } from "@/lib/format";
import { cn } from "@/lib/cn";

const SIZES = {
  xs: "size-7 text-[10px]",
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-16 text-lg",
};

export function Avatar({
  name,
  size = "sm",
  color,
  className,
}: {
  name: string;
  size?: keyof typeof SIZES;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        SIZES[size],
        className
      )}
      style={
        color
          ? { background: color, color: "#fff" }
          : { background: "var(--color-primary-soft)", color: "var(--color-primary-ink)" }
      }
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
