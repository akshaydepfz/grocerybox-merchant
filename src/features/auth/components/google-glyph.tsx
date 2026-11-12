type GoogleGlyphProps = {
  size?: number;
  className?: string;
};

/** Simplified Google "G" mark (mirrors Flutter `_GoogleLogoPainter`). */
export function GoogleGlyph({ size = 16, className }: GoogleGlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
    >
      <path
        fill="#EA4335"
        d="M22 12c0-.68-.06-1.34-.17-1.97H12v3.72h5.64a5.34 5.34 0 0 1-2.3 3.5v2.9h3.73c2.18-2 3.44-4.95 3.44-8.15z"
      />
      <path
        fill="#4285F4"
        d="M12 22c3.24 0 5.95-1.07 7.93-2.9l-3.73-2.9c-1.03.69-2.35 1.1-4.2 1.1-3.23 0-5.97-2.14-6.95-5.02H1.3v2.99C3.3 19.53 7.37 22 12 22z"
      />
      <path
        fill="#FBBC05"
        d="M5.05 13.28A6.56 6.56 0 0 1 4.6 12c0-.45.08-.88.22-1.28V7.73H1.3A10.96 10.96 0 0 0 1 12c0 1.78.43 3.45 1.18 4.97l3.87-2.69z"
      />
      <path
        fill="#34A853"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.17 15.24 0 12 0 7.37 0 3.3 2.47 1.3 6.23l3.75 2.99C5.97 6.89 8.71 4.75 12 4.75z"
      />
    </svg>
  );
}
