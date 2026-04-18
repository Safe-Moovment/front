interface BrandLogoProps {
  className?: string;
  imageClassName?: string;
  showText?: boolean;
  textClassName?: string;
  tone?: "light" | "dark";
}

export function BrandLogo({
  className = "",
  imageClassName = "h-10 w-10",
  showText = true,
  textClassName = "",
  tone = "dark",
}: BrandLogoProps) {
  const imageToneClass = tone === "dark" ? "brightness-0 saturate-100" : "";

  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      <img
        src="/SafeMoovmentLogo.svg"
        alt="Safe Moovment"
        className={`${imageClassName} ${imageToneClass}`.trim()}
      />
      {showText ? (
        <div className="leading-tight">
          <p className={`font-semibold text-inherit ${textClassName}`.trim()}>
            Safe Moovment
          </p>
          <p className="text-xs text-inherit/70">Sistema de Monitoreo</p>
        </div>
      ) : null}
    </div>
  );
}
