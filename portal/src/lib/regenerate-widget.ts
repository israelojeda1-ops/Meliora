export function buildRegenerateWidget(basePath: string): string {
  return `
<div id="meliora-regen-widget" style="display:flex;align-items:center;gap:10px;font-family:system-ui,-apple-system,sans-serif;">
  <button id="meliora-regen-btn" style="display:flex;align-items:center;gap:6px;background:#10B981;color:#053B2C;border:none;border-radius:999px;padding:8px 16px;font-size:12.5px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2);white-space:nowrap;transition:background-color 0.2s;">
    <span aria-hidden="true">&#8635;</span> Regenerar dashboard
  </button>
</div>
<script>
(function(){
  var basePath = ${JSON.stringify(basePath)};
  var btn = document.getElementById('meliora-regen-btn');
  var widget = document.getElementById('meliora-regen-widget');
  var polling = null;

  var topBar = document.querySelector('.top-bar');
  if (topBar) { topBar.appendChild(widget); }

  var COLOR_IDLE = '#10B981';
  var COLOR_IDLE_TEXT = '#053B2C';
  var COLOR_PROGRESS = '#F59E0B';
  var COLOR_PROGRESS_TEXT = '#4A2E03';
  var COLOR_ERROR = '#EF4444';
  var COLOR_ERROR_TEXT = '#ffffff';

  function setIdle(){
    btn.disabled = false;
    btn.style.background = COLOR_IDLE;
    btn.style.color = COLOR_IDLE_TEXT;
    btn.innerHTML = '<span aria-hidden="true">&#8635;</span> Regenerar dashboard';
  }

  function setInProgress(){
    btn.disabled = true;
    btn.style.background = COLOR_PROGRESS;
    btn.style.color = COLOR_PROGRESS_TEXT;
    btn.textContent = 'En proceso...';
  }

  function setError(){
    btn.disabled = false;
    btn.style.background = COLOR_ERROR;
    btn.style.color = COLOR_ERROR_TEXT;
    btn.textContent = 'Error, reintentar';
    setTimeout(setIdle, 4000);
  }

  function setDone(){
    btn.disabled = true;
    btn.style.background = COLOR_IDLE;
    btn.style.color = COLOR_IDLE_TEXT;
    btn.textContent = '✓ Listo';
  }

  function stopPolling(){
    if (polling) { clearInterval(polling); polling = null; }
  }

  btn.addEventListener('click', function(){
    if (btn.disabled) return;
    setInProgress();

    fetch(basePath + '/regenerate', { method: 'POST' })
      .then(function(r){ return r.json(); })
      .then(function(data){
        if (!data.ok) {
          setError();
          return;
        }
        var since = data.triggeredAt;
        var attempts = 0;

        polling = setInterval(function(){
          attempts++;
          if (attempts > 90) {
            stopPolling();
            setError();
            return;
          }

          fetch(basePath + '/regenerate/status?since=' + encodeURIComponent(since))
            .then(function(r){ return r.json(); })
            .then(function(s){
              if (!s.found) return;

              if (s.status === 'completed') {
                stopPolling();
                if (s.conclusion === 'success') {
                  setDone();
                  setTimeout(function(){ window.location.reload(); }, 1500);
                } else {
                  setError();
                }
              }
            })
            .catch(function(){ /* ignore transient polling errors */ });
        }, 5000);
      })
      .catch(function(){
        setError();
      });
  });
})();
</script>`;
}
