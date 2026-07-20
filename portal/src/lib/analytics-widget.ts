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

const GA_MEASUREMENT_ID = "G-1LW5SSCQ4F";

export function buildAnalyticsScript(clientSlug: string): string {
  return `
<script>window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };</script>
<script defer src="/_vercel/insights/script.js"></script>
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"></script>
<script>
(function(){
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', ${JSON.stringify(GA_MEASUREMENT_ID)});
})();
</script>
<script>
(function(){
  var client = ${JSON.stringify(clientSlug)};

  function fire(name, data){
    var payload = Object.assign({ client: client }, data || {});
    try { if (window.va) window.va('event', { name: name, data: payload }); } catch(e){}
    try { if (window.gtag) window.gtag('event', name, payload); } catch(e){}
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
