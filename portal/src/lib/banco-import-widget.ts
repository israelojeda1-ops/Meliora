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
