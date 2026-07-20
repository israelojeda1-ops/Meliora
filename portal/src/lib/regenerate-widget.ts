export function buildRegenerateWidget(basePath: string): string {
  return `
<div id="meliora-regen-widget" style="position:fixed;bottom:20px;right:20px;z-index:999999;font-family:system-ui,-apple-system,sans-serif;">
  <button id="meliora-regen-btn" style="display:flex;align-items:center;gap:8px;background:#1B2A4A;color:#fff;border:none;border-radius:999px;padding:12px 20px;font-size:13px;font-weight:600;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,0.25);">
    <span aria-hidden="true">&#128260;</span> Regenerar dashboard
  </button>
  <div id="meliora-regen-console" style="display:none;margin-top:10px;width:380px;max-width:calc(100vw - 40px);max-height:320px;background:#0F172A;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,0.35);overflow:hidden;">
    <div style="padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.08);color:#94A3B8;font-size:11px;font-weight:600;letter-spacing:0.05em;text-transform:uppercase;">
      Actualizando dashboard
    </div>
    <div id="meliora-regen-log" style="padding:12px 14px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;line-height:1.6;color:#E2E8F0;overflow-y:auto;max-height:270px;"></div>
  </div>
</div>
<script>
(function(){
  var basePath = ${JSON.stringify(basePath)};
  var btn = document.getElementById('meliora-regen-btn');
  var consoleEl = document.getElementById('meliora-regen-console');
  var logEl = document.getElementById('meliora-regen-log');
  var polling = null;

  var STEP_LABELS = {
    'Checkout repositorio': 'Descargando repositorio',
    'Instalar ODBC Driver para SQL Server': 'Instalando driver de base de datos',
    'Instalar dependencias Python': 'Instalando dependencias',
    'Generar Dashboard y enviar mail': 'Generando dashboard desde base de datos',
    'Publicar HTML en el repositorio': 'Publicando dashboard actualizado'
  };

  function log(msg, color){
    var line = document.createElement('div');
    var ts = new Date().toLocaleTimeString('es-CL', { hour12: false });
    line.textContent = '[' + ts + '] ' + msg;
    if (color) line.style.color = color;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function resetButton(){
    btn.disabled = false;
    btn.innerHTML = '<span aria-hidden="true">&#128260;</span> Regenerar dashboard';
  }

  function stopPolling(){
    if (polling) { clearInterval(polling); polling = null; }
  }

  btn.addEventListener('click', function(){
    if (btn.disabled) return;
    btn.disabled = true;
    btn.textContent = 'Iniciando...';
    consoleEl.style.display = 'block';
    logEl.innerHTML = '';
    var loggedSteps = {};
    var loggedQueued = false;

    log('Solicitando actualización del dashboard...');

    fetch(basePath + '/regenerate', { method: 'POST' })
      .then(function(r){ return r.json(); })
      .then(function(data){
        if (!data.ok) {
          log('Error al disparar la actualización: ' + (data.error || 'desconocido'), '#f87171');
          resetButton();
          return;
        }
        log('Actualización disparada, esperando a GitHub Actions...');
        var since = data.triggeredAt;
        var attempts = 0;

        polling = setInterval(function(){
          attempts++;
          if (attempts > 90) {
            stopPolling();
            log('Tiempo de espera agotado. Revisa el estado en GitHub Actions.', '#f87171');
            resetButton();
            return;
          }

          fetch(basePath + '/regenerate/status?since=' + encodeURIComponent(since))
            .then(function(r){ return r.json(); })
            .then(function(s){
              if (!s.found) return;

              if (s.status === 'queued' && !loggedQueued) {
                loggedQueued = true;
                log('En cola en GitHub Actions...');
              }

              (s.steps || []).forEach(function(step){
                var label = STEP_LABELS[step.name] || step.name;
                if (step.status === 'completed' && !loggedSteps[step.name]) {
                  loggedSteps[step.name] = true;
                  if (step.conclusion === 'success') log('✓ ' + label, '#34d399');
                  else if (step.conclusion === 'skipped') log('– ' + label + ' (omitido)', '#94a3b8');
                  else log('✗ ' + label + ' falló', '#f87171');
                } else if (step.status === 'in_progress' && !loggedSteps[step.name + ':start']) {
                  loggedSteps[step.name + ':start'] = true;
                  log('… ' + label);
                }
              });

              if (s.status === 'completed') {
                stopPolling();
                if (s.conclusion === 'success') {
                  log('✅ Dashboard actualizado. Recargando en 3 segundos...', '#34d399');
                  setTimeout(function(){ window.location.reload(); }, 3000);
                } else {
                  log('❌ La actualización terminó con errores (' + s.conclusion + ').', '#f87171');
                  resetButton();
                }
              }
            })
            .catch(function(){ /* ignore transient polling errors */ });
        }, 5000);
      })
      .catch(function(e){
        log('Error de red: ' + e.message, '#f87171');
        resetButton();
      });
  });
})();
</script>`;
}
