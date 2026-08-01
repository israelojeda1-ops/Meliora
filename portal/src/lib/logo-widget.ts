// Insignia con el logo de Meliora para dashboards que son HTML estático
// traído tal cual de un repo externo (ej. Nuprotec) — ese HTML no pasa por
// nuestro layout.tsx, así que la marca hay que inyectarla acá. No depende
// de ninguna clase/estructura del HTML de destino: se ancla a `body` con
// posición fija, así funciona sin importar cómo esté armado el dashboard.
export function buildLogoWidget(): string {
  return `
<a
  id="meliora-logo-badge"
  href="https://melioraadvisory.cl"
  target="_blank"
  rel="noopener noreferrer"
  style="position:fixed;left:16px;bottom:16px;z-index:2147483000;display:flex;align-items:center;gap:6px;background:rgba(27,42,74,0.92);color:#fff;border-radius:999px;padding:6px 12px 6px 8px;font-family:system-ui,-apple-system,sans-serif;font-size:11px;font-weight:600;letter-spacing:0.02em;text-decoration:none;box-shadow:0 2px 8px rgba(0,0,0,0.25);"
>
  <svg width="16" height="13" viewBox="0 0 72 56" fill="none" aria-hidden="true">
    <rect x="0" y="30" width="16" height="26" fill="#F8FAFC"/>
    <rect x="28" y="16" width="16" height="40" fill="#F8FAFC"/>
    <rect x="56" y="0" width="16" height="56" fill="#0E7C66"/>
  </svg>
  Portal Meliora Advisory
</a>`;
}
