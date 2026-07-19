type LogoProps = {
  variant?: "full" | "icon";
  theme?: "light" | "dark";
  className?: string;
};

export function Logo({ variant = "full", theme = "light", className = "" }: LogoProps) {
  const barColor = theme === "dark" ? "#F8FAFC" : "#1B2A4A";
  const accentColor = "#0E7C66";
  const textColor = theme === "dark" ? "#ffffff" : "#1B2A4A";
  const captionColor = theme === "dark" ? "#CBD5E1" : "#64748B";

  const icon = (
    <svg
      width={variant === "icon" ? 28 : 30}
      height={variant === "icon" ? 22 : 23}
      viewBox="0 0 72 56"
      fill="none"
      aria-hidden="true"
    >
      <rect x="0" y="30" width="16" height="26" rx="2" fill={barColor} />
      <rect x="28" y="16" width="16" height="40" rx="2" fill={barColor} />
      <rect x="56" y="0" width="16" height="56" rx="2" fill={accentColor} />
    </svg>
  );

  if (variant === "icon") {
    return <span className={className}>{icon}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {icon}
      <span className="flex flex-col leading-none">
        <span
          className="text-lg font-bold tracking-tight"
          style={{ color: textColor }}
        >
          Mel<span style={{ color: accentColor }}>io</span>ra
        </span>
        <span
          className="text-[9px] font-semibold tracking-[0.25em] mt-0.5"
          style={{ color: captionColor }}
        >
          ADVISORY
        </span>
      </span>
    </span>
  );
}
