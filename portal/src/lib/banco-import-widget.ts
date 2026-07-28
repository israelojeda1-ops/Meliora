export function buildBancoImportWidget(basePath: string): string {
  return `
<script>
(function(){
  var basePath = ${JSON.stringify(basePath)};
  var host = document.getElementById('banco-content');
  if (!host) return;

  var HEADERS = ['Fecha','ID Transferencia','Rut Origen/Destino','Banco Origen/Destino','Cuenta Origen/Destino','Valor','Estado','DESCRIPCION','Factura / Boleta','Observacion'];

  var panel = document.createElement('div');
  panel.className = 'card';
  panel.style.cssText = 'margin-bottom:14px;padding:14px 16px;';
  panel.innerHTML =
    '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">' +
      '<button id="banco-tpl-btn" class="btn-export" style="cursor:pointer">&#11015; Descargar plantilla</button>' +
      '<label for="banco-file-input" class="btn-export primary" style="cursor:pointer">&#11014; Cargar planilla</label>' +
      '<input type="file" id="banco-file-input" accept=".xlsx,.xls" style="display:none">' +
      '<span id="banco-import-status" style="font-size:12px;color:#6B7280"></span>' +
    '</div>' +
    '<div style="font-size:11px;color:#9CA3AF;margin-top:6px">Descarga la plantilla, complétala con los movimientos nuevos y súbela — se agregan al historial sin duplicar los que ya existen.</div>';
  host.insertBefore(panel, host.firstChild);

  var statusEl = document.getElementById('banco-import-status');
  function setStatus(msg, isError){
    statusEl.textContent = msg;
    statusEl.style.color = isError ? '#DC2626' : '#6B7280';
  }

  var tplBtn = document.getElementById('banco-tpl-btn');
  tplBtn.addEventListener('click', function(){
    if (typeof XLSX === 'undefined') { setStatus('Librería Excel no cargada aún.', true); return; }
    var ws = XLSX.utils.aoa_to_sheet([HEADERS]);
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Banco');
    XLSX.writeFile(wb, 'Plantilla_Banco_NUPROTEC.xlsx');
  });

  function subir(rows){
    setStatus('Subiendo ' + rows.length + ' filas...');
    fetch(basePath + '/banco/import', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({rows: rows}),
    }).then(function(r){ return r.json(); }).then(function(data){
      fileInput.value = '';
      if (!data.ok) { setStatus('Error: ' + data.error, true); return; }
      setStatus('Listo — ' + data.added + ' movimientos nuevos (de ' + data.received + ' filas leídas). Regenerando...');
      setTimeout(function(){ window.location.reload(); }, 5000);
    }).catch(function(){ fileInput.value=''; setStatus('Error de red al subir.', true); });
  }

  function mostrarConfirmacion(rows, invalidas){
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(17,24,39,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
    var box = document.createElement('div');
    box.style.cssText = 'background:#fff;border-radius:12px;padding:20px;max-width:560px;width:100%;max-height:82vh;overflow:auto;font-size:13px;color:#111827;box-shadow:0 10px 40px rgba(0,0,0,.25)';
    var validCount = rows.length - invalidas.length;
    var html = '<h3 style="margin:0 0 10px;font-size:16px">Confirmar importación</h3>';
    html += '<p style="margin:0 0 12px">Se detectaron <b>' + rows.length + '</b> filas. <b style="color:#059669">' + validCount + '</b> se van a importar.</p>';
    if (invalidas.length) {
      html += '<p style="margin:0 0 6px;color:#DC2626"><b>' + invalidas.length + '</b> NO se importarán (falta Fecha y/o Valor):</p>';
      html += '<div style="max-height:220px;overflow:auto;border:1px solid #E5E7EB;border-radius:8px;margin-bottom:14px">';
      html += '<table style="width:100%;border-collapse:collapse;font-size:11.5px">';
      html += '<tr style="background:#F9FAFB;position:sticky;top:0"><th style="text-align:left;padding:4px 8px">Fila</th><th style="text-align:left;padding:4px 8px">Fecha</th><th style="text-align:left;padding:4px 8px">Valor</th><th style="text-align:left;padding:4px 8px">Motivo</th></tr>';
      invalidas.forEach(function(r){
        html += '<tr><td style="padding:4px 8px">'+r.fila+'</td><td style="padding:4px 8px">'+(r.fecha||'&mdash;')+'</td><td style="padding:4px 8px">'+(r.valor||'&mdash;')+'</td><td style="padding:4px 8px;color:#DC2626">'+r.motivo+'</td></tr>';
      });
      html += '</table></div>';
    }
    html += '<div style="display:flex;gap:10px;justify-content:flex-end">';
    html += '<button id="banco-modal-cancel" class="btn-export" style="cursor:pointer">Cancelar</button>';
    if (validCount > 0) {
      html += '<button id="banco-modal-confirm" class="btn-export primary" style="cursor:pointer">Confirmar e importar (' + validCount + ')</button>';
    }
    html += '</div>';
    box.innerHTML = html;
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    function cerrar(){ document.body.removeChild(overlay); }
    document.getElementById('banco-modal-cancel').addEventListener('click', function(){ cerrar(); fileInput.value=''; setStatus(''); });
    var confirmBtn = document.getElementById('banco-modal-confirm');
    if (confirmBtn) confirmBtn.addEventListener('click', function(){ cerrar(); subir(rows); });
  }

  var fileInput = document.getElementById('banco-file-input');
  fileInput.addEventListener('change', function(e){
    var file = e.target.files[0];
    if (!file) return;
    if (typeof XLSX === 'undefined') { setStatus('Librería Excel no cargada aún.', true); return; }
    setStatus('Leyendo archivo...');
    var reader = new FileReader();
    reader.onload = function(ev){
      try {
        var data = new Uint8Array(ev.target.result);
        var wb = XLSX.read(data, {type:'array', cellDates:true});
        var ws = wb.Sheets[wb.SheetNames[0]];
        var rows = XLSX.utils.sheet_to_json(ws, {defval:'', raw:false, dateNF:'dd/mm/yyyy'});
        if (!rows.length) { setStatus('El archivo no tiene filas.', true); fileInput.value=''; return; }
        var invalidas = [];
        rows.forEach(function(r, idx){
          var falta = [];
          if (!String(r['Fecha']||'').trim()) falta.push('Fecha');
          if (!String(r['Valor']||'').trim()) falta.push('Valor');
          if (falta.length) invalidas.push({fila: idx+2, fecha: r['Fecha'], valor: r['Valor'], motivo: 'Falta ' + falta.join(' y ')});
        });
        setStatus('');
        mostrarConfirmacion(rows, invalidas);
      } catch (err) {
        fileInput.value = '';
        setStatus('No se pudo leer el archivo: ' + err.message, true);
      }
    };
    reader.readAsArrayBuffer(file);
  });
})();
</script>`;
}
