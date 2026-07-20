const PDF_FUNCTIONS = ["pdfCotizacion", "pdfNotaVenta", "pdfEstadoCuenta"];

const EXCEL_FUNCTIONS = [
  "exportPendExcel",
  "exportFactExcel",
  "exportStockMovExcel",
  "exportClienteDetalle",
  "exportNVExcel",
  "exportSFExcel",
  "exportArqueoExcel",
  "exportBudgetExcel",
  "exportDeudaExcel",
  "exportAnticExcel",
];

export function buildAnalyticsScript(clientSlug: string): string {
  return `
<script>window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };</script>
<script defer src="/_vercel/insights/script.js"></script>
<script>
(function(){
  var client = ${JSON.stringify(clientSlug)};

  function fire(name, data){
    try { if (window.va) window.va('event', { name: name, data: Object.assign({ client: client }, data || {}) }); }
    catch(e){}
  }

  function wrap(fnName, eventName, mapArgs){
    var orig = window[fnName];
    if (typeof orig !== 'function') return;
    window[fnName] = function(){
      try { fire(eventName, mapArgs ? mapArgs(arguments) : {}); } catch(e){}
      return orig.apply(this, arguments);
    };
  }

  wrap('switchTab', 'tab_view', function(args){ return { tab: args[1] }; });

  ${JSON.stringify(PDF_FUNCTIONS)}.forEach(function(fn){
    wrap(fn, 'pdf_download', function(){ return { fn: fn }; });
  });

  ${JSON.stringify(EXCEL_FUNCTIONS)}.forEach(function(fn){
    wrap(fn, 'excel_download', function(){ return { fn: fn }; });
  });
})();
</script>`;
}
