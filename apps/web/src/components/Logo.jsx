/**
 * Shared jot. wordmark with size and color variants.
 */
export function Logo({ size = "medium", variant = "default", className = "" }) {
  const sizes = {
    small: "text-4xl",
    medium: "text-6xl",
    large: "text-8xl",
    xlarge: "text-9xl",
  };

  const variants = {
    default: "text-teal-700",
    light: "text-cream",
    dark: "text-teal-900",
  };

  return (
    <div className={`font-logo font-medium leading-none ${sizes[size]} ${className}`}>
      <span className={variants[variant]}>jot</span>
      <span className="text-orange-sunset">.</span>
    </div>
  );
}
