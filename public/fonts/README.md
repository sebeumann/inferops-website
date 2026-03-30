# Self-Hosted Fonts

Place WOFF2 font files here for GDPR-compliant font loading (no Google Fonts CDN calls).

## Recommended: Inter (variable)

Download from https://rsms.me/inter/ and place:

- `Inter-Variable.woff2`
- `Inter-Variable-Italic.woff2` (optional)

Then reference in `src/styles/global.css`:

```css
@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("/fonts/Inter-Variable.woff2") format("woff2");
}
```

## Alternative: System font stack

If you prefer zero font downloads, use the system stack (already configured as fallback).
No files needed in this directory.
