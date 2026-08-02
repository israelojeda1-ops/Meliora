export function buildBrandWidget(): string {
  return `
<div id="meliora-brand-logo" style="display:inline-flex;align-items:center;gap:6px;margin-left:10px;">
  <svg width="22" height="17" viewBox="0 0 72 56" fill="none" aria-hidden="true">
    <rect x="0" y="30" width="16" height="26" fill="#F8FAFC"/>
    <rect x="28" y="16" width="16" height="40" fill="#F8FAFC"/>
    <rect x="56" y="0" width="16" height="56" fill="#10B981"/>
  </svg>
  <span style="font-size:12px;font-weight:600;color:#F8FAFC;letter-spacing:0.01em;white-space:nowrap;">Meliora</span>
</div>
<footer id="meliora-footer" style="text-align:center;padding:16px 12px;font-size:11px;color:#94A3B8;font-family:system-ui,-apple-system,sans-serif;">
  Powered by <strong style="color:#1B2A4A;">Meliora Advisory</strong>
</footer>
<script>
(function(){
  var topBar = document.querySelector('.top-bar');
  var logo = document.getElementById('meliora-brand-logo');
  if (topBar && logo) { topBar.appendChild(logo); }

  var footer = document.getElementById('meliora-footer');
  if (footer) { document.body.appendChild(footer); }
})();
</script>`;
}
