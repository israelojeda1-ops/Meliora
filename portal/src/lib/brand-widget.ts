export function buildBrandWidget(): string {
  return `
<div id="meliora-brand-logo" style="display:inline-flex;align-items:center;gap:8px;margin-left:10px;">
  <svg width="30" height="23" viewBox="0 0 72 56" fill="none" aria-hidden="true">
    <rect x="0" y="30" width="16" height="26" fill="#F8FAFC"/>
    <rect x="28" y="16" width="16" height="40" fill="#F8FAFC"/>
    <rect x="56" y="0" width="16" height="56" fill="#10B981"/>
  </svg>
  <span style="font-size:15px;font-weight:600;color:#F8FAFC;letter-spacing:0.01em;white-space:nowrap;">Meliora</span>
</div>
<footer id="meliora-footer" style="text-align:center;padding:20px 12px;font-size:13px;color:#94A3B8;font-family:system-ui,-apple-system,sans-serif;">
  Powered by <a href="https://melioraadvisory.cl" target="_blank" rel="noopener noreferrer" style="color:#1B2A4A;font-weight:600;text-decoration:none;">Meliora Advisory</a>
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
