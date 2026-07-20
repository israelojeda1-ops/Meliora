export function buildRegenerateWidget(basePath: string): string {
  return `
<div id="meliora-regen-widget" style="display:flex;align-items:center;gap:10px;font-family:system-ui,-apple-system,sans-serif;">
  <button id="meliora-regen-btn" style="display:flex;align-items:center;gap:6px;background:#10B981;color:#053B2C;border:none;border-radius:999px;padding:8px 16px;font-size:12.5px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2);white-space:nowrap;">
    <span aria-hidden="true">&#8635;</span> Regenerar dashboard
  </button>
  <span id="meliora-regen-status" style="display:none;font-size:12px;font-weight:600;color:#fff;background:rgba(255,255,255,0.14);padding:7px 14px;border-radius:999px;white-space:nowrap;max-width:320px;overflow:hidden;text-overflow:ellipsis;"></span>
</div>
<script>
(function(){
  var basePath = ${JSON.stringify(basePath)};
  var btn = document.getElementById('meliora-regen-btn');
  var statusEl = document.getElementById('meliora-regen-status');
  var widget = document.getElementById('meliora-regen-widget');
  var polling = null;

  var topBar = document.querySelector('.top-bar');
  if (topBar) { topBar.appendChild(widget); }

  var STEP_LABELS = {
    'Checkout repositorio': 'Descargando repositorio',
    'Instalar ODBC Driver para SQL Server': 'Instalando driver de base de datos',
    'Instalar dependencias Python': 'Instalando dependencias',
    'Generar Dashboard': 'Generando dashboard desde base de datos',
    'Generar Dashboard y enviar mail': 'Generando dashboard desde base de datos',
    'Publicar HTML en el repositorio': 'Publicando dashboard actualizado'
  };

  function setStatus(msg, color){
    statusEl.style.display = 'inline-block';
    statusEl.textContent = msg;
    statusEl.style.color = color || '#fff';
  }

  function resetButton(){
    btn.disabled = false;
    btn.innerHTML = '<span aria-hidden="true">&#8635;</span> Regenerar dashboard';
  }

  function stopPolling(){
    if (polling) { clearInterval(polling); polling = null; }
  }

  btn.addEventListener('click', function(){
    if (btn.disabled) return;
    btn.disabled = true;
    btn.textContent = 'Iniciando...';
    setStatus('Solicitando actualización...');
    var lastStep = '';

    fetch(basePath + '/regenerate', { method: 'POST' })
      .then(function(r){ return r.json(); })
      .then(function(data){
        if (!data.ok) {
          setStatus('Error al iniciar: ' + (data.error || 'desconocido'), '#fca5a5');
          resetButton();
          return;
        }
        setStatus('En cola en GitHub Actions...');
        var since = data.triggeredAt;
        var attempts = 0;

        polling = setInterval(function(){
          attempts++;
          if (attempts > 90) {
            stopPolling();
            setStatus('Tiempo de espera agotado. Revisa GitHub Actions.', '#fca5a5');
            resetButton();
            return;
          }

          fetch(basePath + '/regenerate/status?since=' + encodeURIComponent(since))
            .then(function(r){ return r.json(); })
            .then(function(s){
              if (!s.found) return;

              var current = (s.steps || []).slice().reverse().find(function(st){ return st.status === 'in_progress'; })
                || (s.steps || []).slice().reverse().find(function(st){ return st.status === 'completed'; });
              if (current) {
                var label = STEP_LABELS[current.name] || current.name;
                if (current.name !== lastStep) {
                  lastStep = current.name;
                  setStatus((current.status === 'in_progress' ? '⏳ ' : '✓ ') + label);
                }
              }

              if (s.status === 'completed') {
                stopPolling();
                if (s.conclusion === 'success') {
                  setStatus('✅ Dashboard actualizado. Recargando...', '#6ee7b7');
                  setTimeout(function(){ window.location.reload(); }, 2000);
                } else {
                  setStatus('❌ Falló la actualización (' + s.conclusion + ').', '#fca5a5');
                  resetButton();
                }
              }
            })
            .catch(function(){ /* ignore transient polling errors */ });
        }, 5000);
      })
      .catch(function(e){
        setStatus('Error de red: ' + e.message, '#fca5a5');
        resetButton();
      });
  });
})();
</script>`;
}
