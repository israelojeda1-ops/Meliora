export function buildBancoImportWidget(basePath: string): string {
  return `
<script>
(function(){
 try {
  var basePath = ${JSON.stringify(basePath)};
  var host = document.getElementById('banco-content');
  if (!host) {
    var warn = document.createElement('div');
    warn.style.cssText = 'background:#FEF3C7;color:#92400E;padding:10px 14px;margin:10px 0;border-radius:8px;font-family:monospace;font-size:12px';
    warn.textContent = '[banco-widget] no se encontró #banco-content en la página';
    document.body.insertBefore(warn, document.body.firstChild);
    return;
  }

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

  function clp(v){
    var n = Math.round(Number(v)||0);
    return '$' + n.toLocaleString('es-CL');
  }

  function mostrarRevision(rows, items){
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(17,24,39,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
    var box = document.createElement('div');
    box.style.cssText = 'background:#fff;border-radius:12px;padding:20px;max-width:920px;width:100%;max-height:88vh;overflow:auto;font-size:13px;color:#111827;box-shadow:0 10px 40px rgba(0,0,0,.25)';

    var validCount = items.filter(function(it){ return it.valida; }).length;
    var invalidCount = items.length - validCount;

    var html = '<h3 style="margin:0 0 6px;font-size:16px">Revisar antes de importar</h3>';
    html += '<p style="margin:0 0 12px;color:#6B7280">Revisa la Factura/Boleta de cada fila (se sugiere automáticamente cuando falta). Puedes editarla antes de confirmar.</p>';
    html += '<div style="max-height:52vh;overflow:auto;border:1px solid #E5E7EB;border-radius:8px;margin-bottom:14px">';
    html += '<table style="width:100%;border-collapse:collapse;font-size:11.5px;white-space:nowrap">';
    html += '<thead><tr style="background:#F9FAFB;position:sticky;top:0">' +
      '<th style="text-align:left;padding:5px 8px">Fecha</th>' +
      '<th style="text-align:left;padding:5px 8px">RUT</th>' +
      '<th style="text-align:left;padding:5px 8px">Banco</th>' +
      '<th style="text-align:right;padding:5px 8px">Valor</th>' +
      '<th style="text-align:left;padding:5px 8px">Factura / Boleta</th>' +
      '<th style="text-align:left;padding:5px 8px">Estado</th>' +
      '</tr></thead><tbody>';

    items.forEach(function(it){
      var badge, badgeColor, badgeBg;
      if (!it.valida) { badge = 'Falta Fecha/Valor'; badgeColor = '#DC2626'; badgeBg = '#FEE2E2'; }
      else if (it.yaExiste) { badge = 'Ya existe'; badgeColor = '#6B7280'; badgeBg = '#F3F4F6'; }
      else { badge = 'Se importará'; badgeColor = '#059669'; badgeBg = '#D1FAE5'; }

      var valorFactura = it.facturaOriginal || it.facturaSugerida || '';
      var esSugerida = !it.facturaOriginal && !!it.facturaSugerida;
      var inputStyle = 'width:120px;padding:3px 6px;border:1px solid ' + (esSugerida ? '#F59E0B' : '#D1D5DB') + ';border-radius:5px;font-size:11.5px' + (it.valida ? '' : ';background:#F3F4F6;color:#9CA3AF');

      html += '<tr data-idx="' + it.idx + '" style="border-top:1px solid #F3F4F6">' +
        '<td style="padding:4px 8px">' + (it.fecha || '&mdash;') + '</td>' +
        '<td style="padding:4px 8px">' + (it.rut || '&mdash;') + '</td>' +
        '<td style="padding:4px 8px">' + (it.banco || '&mdash;') + '</td>' +
        '<td style="padding:4px 8px;text-align:right">' + clp(it.valor) + '</td>' +
        '<td style="padding:4px 8px">' +
          '<input type="text" class="banco-rev-factura" data-idx="' + it.idx + '" value="' + valorFactura.replace(/"/g,'&quot;') + '" style="' + inputStyle + '"' + (it.valida ? '' : ' disabled') + '>' +
          (esSugerida ? '<span style="font-size:10px;color:#B45309;margin-left:4px" title="Sugerido por RUT + monto contra Arqueo, sin confirmar">sugerido</span>' : '') +
        '</td>' +
        '<td style="padding:4px 8px"><span style="background:' + badgeBg + ';color:' + badgeColor + ';border-radius:8px;padding:2px 8px;font-size:10.5px;font-weight:600">' + badge + '</span></td>' +
      '</tr>';
    });

    html += '</tbody></table></div>';
    html += '<p style="margin:0 0 12px"><b style="color:#059669">' + validCount + '</b> fila(s) se importarán' + (invalidCount ? ', <b style="color:#DC2626">' + invalidCount + '</b> se omiten (falta Fecha y/o Valor)' : '') + '.</p>';
    html += '<div style="display:flex;gap:10px;justify-content:flex-end">';
    html += '<button id="banco-modal-cancel" class="btn-export" style="cursor:pointer">Cancelar</button>';
    if (validCount > 0) {
      html += '<button id="banco-modal-confirm" class="btn-export primary" style="cursor:pointer">Confirmar e importar</button>';
    }
    html += '</div>';
    box.innerHTML = html;
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    function cerrar(){ document.body.removeChild(overlay); }
    document.getElementById('banco-modal-cancel').addEventListener('click', function(){ cerrar(); fileInput.value=''; setStatus(''); });
    var confirmBtn = document.getElementById('banco-modal-confirm');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', function(){
        // Vuelca lo que quedó en cada input (aprobado o editado) de vuelta a las filas.
        var inputs = box.querySelectorAll('.banco-rev-factura');
        inputs.forEach(function(inp){
          var idx = Number(inp.getAttribute('data-idx'));
          rows[idx]['Factura / Boleta'] = inp.value;
        });
        var aImportar = items.filter(function(it){ return it.valida; }).map(function(it){ return rows[it.idx]; });
        cerrar();
        subir(aImportar);
      });
    }
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
        setStatus('Calculando sugerencias...');
        fetch(basePath + '/banco/preview', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({rows: rows}),
        }).then(function(r){ return r.json(); }).then(function(data){
          if (!data.ok) { setStatus('Error: ' + data.error, true); fileInput.value=''; return; }
          setStatus('');
          mostrarRevision(rows, data.items);
        }).catch(function(){ setStatus('Error de red al calcular sugerencias.', true); fileInput.value=''; });
      } catch (err) {
        fileInput.value = '';
        setStatus('No se pudo leer el archivo: ' + err.message, true);
      }
    };
    reader.readAsArrayBuffer(file);
  });

  // Ventana para editar la fila completa (todos los campos visibles) de un
  // movimiento de banco.
  function mostrarEdicionFila(row, cols, onGuardado){
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(17,24,39,.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px';
    var box = document.createElement('div');
    box.style.cssText = 'background:#fff;border-radius:12px;padding:20px;max-width:460px;width:100%;font-size:13px;color:#111827;box-shadow:0 10px 40px rgba(0,0,0,.25)';

    var campos = [
      { key: 'fecha', label: 'Fecha', idx: cols.iFecha },
      { key: 'idTransferencia', label: 'ID Transferencia', idx: cols.iId },
      { key: 'banco', label: 'Banco', idx: cols.iBanco },
      { key: 'rut', label: 'RUT', idx: cols.iRut },
      { key: 'valor', label: 'Valor', idx: cols.iValor },
      { key: 'descripcion', label: 'Descripción', idx: cols.iDesc },
      { key: 'factura', label: 'Factura / Boleta', idx: cols.iFactura },
    ];

    var html = '<h3 style="margin:0 0 14px;font-size:16px">Editar movimiento</h3>';
    campos.forEach(function(c){
      if (c.idx < 0) return;
      var val = (row[c.idx] == null ? '' : row[c.idx]).toString().replace(/"/g, '&quot;');
      html += '<div style="margin-bottom:10px">' +
        '<label style="display:block;font-size:11px;color:#6B7280;margin-bottom:3px">' + c.label + '</label>' +
        '<input type="text" data-campo="' + c.key + '" value="' + val + '" ' +
          'style="width:100%;box-sizing:border-box;padding:6px 8px;border:1px solid #D1D5DB;border-radius:6px;font-size:13px">' +
      '</div>';
    });
    html += '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:6px">';
    html += '<button id="banco-editfila-cancel" class="btn-export" style="cursor:pointer">Cancelar</button>';
    html += '<button id="banco-editfila-guardar" class="btn-export primary" style="cursor:pointer">Guardar</button>';
    html += '</div>';
    box.innerHTML = html;
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    function cerrar(){ document.body.removeChild(overlay); }
    document.getElementById('banco-editfila-cancel').addEventListener('click', cerrar);
    document.getElementById('banco-editfila-guardar').addEventListener('click', function(){
      var cambios = {};
      box.querySelectorAll('input[data-campo]').forEach(function(inp){
        cambios[inp.getAttribute('data-campo')] = inp.value.trim();
      });
      cerrar();
      onGuardado(cambios);
    });
  }

  // Selección por casilla de verificación a la izquierda + botones de acción
  // (Editar/Eliminar) arriba de la tabla, sobre la fila seleccionada. Se
  // engancha via MutationObserver porque renderBanco() reconstruye el tbody
  // entero en cada filtro/orden, y el thead/toolbar se inyectan una sola vez.
  function setupBancoSeleccion(){
    var tbody = document.getElementById('banco-tbody');
    var thead = document.getElementById('banco-thead');
    var barra = document.querySelector('#banco-content .stock-search-bar');
    if (!tbody || !thead || !barra || typeof window.bancoFiltrar !== 'function' || typeof window.BANCO === 'undefined') return;

    var cols = {
      iFecha: window.BANCO_IDX_FECHA,
      iId: window.BANCO.columnas.indexOf('ID Transferencia'),
      iBanco: window.BANCO.columnas.indexOf('Banco'),
      iRut: window.BANCO_IDX_RUT,
      iValor: window.BANCO_IDX_MONTO,
      iDesc: window.BANCO.columnas.indexOf('Descripción'),
      iFactura: window.BANCO_IDX_DOC,
    };

    var seleccionados = new Set();
    var editBtn, delBtn, selectAllChk;

    function agregarToolbar(){
      if (document.getElementById('banco-editar-sel')) return;
      editBtn = document.createElement('button');
      editBtn.id = 'banco-editar-sel';
      editBtn.className = 'btn-export';
      editBtn.textContent = '✎ Editar';
      editBtn.disabled = true;
      editBtn.style.cursor = 'pointer';
      delBtn = document.createElement('button');
      delBtn.id = 'banco-eliminar-sel';
      delBtn.className = 'btn-export';
      delBtn.textContent = '🗑 Eliminar';
      delBtn.disabled = true;
      delBtn.style.cssText = 'cursor:pointer;color:#DC2626';
      barra.insertBefore(delBtn, barra.firstChild);
      barra.insertBefore(editBtn, barra.firstChild);

      editBtn.addEventListener('click', function(){
        if (seleccionados.size !== 1) return;
        var row = seleccionados.values().next().value;
        mostrarEdicionFila(row, cols, function(cambios){ guardarCambios(row, cambios); });
      });
      delBtn.addEventListener('click', function(){
        if (!seleccionados.size) return;
        var filas = Array.from(seleccionados);
        if (!window.confirm('¿Eliminar ' + filas.length + ' movimiento(s)? Esta acción no se puede deshacer.')) return;
        eliminarFilas(filas);
      });
    }

    function actualizarToolbar(){
      if (!editBtn) return;
      editBtn.disabled = seleccionados.size !== 1;
      delBtn.disabled = seleccionados.size === 0;
      if (selectAllChk) {
        var visibles = tbody.querySelectorAll('input[data-banco-chk]');
        var marcados = 0;
        visibles.forEach(function(c){ if (c.checked) marcados++; });
        selectAllChk.checked = visibles.length > 0 && marcados === visibles.length;
        selectAllChk.indeterminate = marcados > 0 && marcados < visibles.length;
      }
    }

    function agregarHeaderCheckbox(){
      var headerRow = thead.querySelector('tr');
      if (!headerRow || headerRow.getAttribute('data-banco-sel-ready') === '1') return;
      headerRow.setAttribute('data-banco-sel-ready', '1');
      var th = document.createElement('th');
      th.style.cssText = 'width:26px;padding:4px 6px';
      selectAllChk = document.createElement('input');
      selectAllChk.type = 'checkbox';
      selectAllChk.title = 'Seleccionar todos los visibles';
      selectAllChk.addEventListener('change', function(){
        // Captura el valor deseado ANTES del loop: cada fila dispara su propio
        // 'change' -> actualizarToolbar(), que recalcula y reescribe
        // selectAllChk.checked a mitad de camino (con solo algunas filas
        // marcadas todavía) si se sigue leyendo en vivo dentro del loop.
        var marcarTodos = selectAllChk.checked;
        var boxes = tbody.querySelectorAll('input[data-banco-chk]');
        boxes.forEach(function(c){
          c.checked = marcarTodos;
          c.dispatchEvent(new Event('change'));
        });
      });
      th.appendChild(selectAllChk);
      headerRow.insertBefore(th, headerRow.firstChild);
    }

    function guardarCambios(row, cambios){
      var original = {
        fecha: row[cols.iFecha],
        idTransferencia: cols.iId > -1 ? row[cols.iId] : '',
        valor: row[cols.iValor],
        factura: row[cols.iFactura],
      };
      fetch(basePath + '/banco/edit', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ original: original, cambios: cambios }),
      }).then(function(r){ return r.json(); }).then(function(data){
        if (!data.ok) { alert('Error: ' + data.error); return; }
        if (cols.iFecha > -1 && cambios.fecha !== undefined) row[cols.iFecha] = cambios.fecha;
        if (cols.iId > -1 && cambios.idTransferencia !== undefined) row[cols.iId] = cambios.idTransferencia;
        if (cols.iBanco > -1 && cambios.banco !== undefined) row[cols.iBanco] = cambios.banco;
        if (cols.iRut > -1 && cambios.rut !== undefined) row[cols.iRut] = cambios.rut;
        if (cols.iValor > -1 && cambios.valor !== undefined) row[cols.iValor] = cambios.valor;
        if (cols.iDesc > -1 && cambios.descripcion !== undefined) row[cols.iDesc] = cambios.descripcion;
        if (cols.iFactura > -1 && cambios.factura !== undefined) row[cols.iFactura] = cambios.factura;
        seleccionados.clear();
        window.renderBanco();
      }).catch(function(){ alert('Error de red al guardar.'); });
    }

    function eliminarFilas(filas){
      delBtn.disabled = true;
      editBtn.disabled = true;
      var i = 0;
      function siguiente(){
        if (i >= filas.length) {
          seleccionados.clear();
          window.renderBanco();
          return;
        }
        var row = filas[i];
        fetch(basePath + '/banco/delete', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            fecha: row[cols.iFecha],
            idTransferencia: cols.iId > -1 ? row[cols.iId] : '',
            valor: row[cols.iValor],
            factura: row[cols.iFactura],
          }),
        }).then(function(r){ return r.json(); }).then(function(data){
          if (!data.ok) { alert('Error eliminando una fila: ' + data.error); return; }
          var masterIdx = window.BANCO.filas.indexOf(row);
          if (masterIdx > -1) window.BANCO.filas.splice(masterIdx, 1);
        }).catch(function(){ alert('Error de red al eliminar.'); }).then(function(){
          i++; siguiente();
        });
      }
      siguiente();
    }

    function enrich(){
      agregarHeaderCheckbox();
      agregarToolbar();
      var filtered = window.bancoFiltrar();
      var trs = tbody.querySelectorAll('tr');
      filtered.forEach(function(row, idx){
        var tr = trs[idx];
        if (!tr || tr.getAttribute('data-banco-sel-ready') === '1') return;
        tr.setAttribute('data-banco-sel-ready', '1');

        var td = document.createElement('td');
        td.style.cssText = 'padding:4px 6px';
        var chk = document.createElement('input');
        chk.type = 'checkbox';
        chk.setAttribute('data-banco-chk', '1');
        chk.checked = seleccionados.has(row);
        chk.addEventListener('click', function(ev){ ev.stopPropagation(); });
        chk.addEventListener('change', function(){
          if (chk.checked) seleccionados.add(row); else seleccionados.delete(row);
          actualizarToolbar();
        });
        td.appendChild(chk);
        tr.insertBefore(td, tr.firstChild);
      });
      actualizarToolbar();
    }

    new MutationObserver(enrich).observe(tbody, { childList: true });
    enrich();
  }
  setupBancoSeleccion();
 } catch (e) {
  var err = document.createElement('div');
  err.style.cssText = 'background:#FEE2E2;color:#DC2626;padding:10px 14px;margin:10px 0;border-radius:8px;font-family:monospace;font-size:11px;white-space:pre-wrap;word-break:break-all';
  err.textContent = '[banco-widget] error: ' + (e && e.message ? e.message : e) + (e && e.stack ? ('\\n' + e.stack) : '');
  document.body.insertBefore(err, document.body.firstChild);
 }
})();
</script>`;
}
