/**
 * Destino de los seis formularios del sitio: contacto, diagnóstico y las cuatro
 * calculadoras. La ruta vive en el portal, que manda el correo desde
 * contacto@melioraadvisory.cl y deja el registro en su tabla `formularios`.
 *
 * Es la URL absoluta del portal y no una ruta relativa del propio sitio porque
 * el sitio es un export estático: no tiene backend que responda /api. Para que
 * /api/formularios funcionara bajo melioraadvisory.cl haría falta un bloque en
 * Caddy que la reenvíe al portal (127.0.0.1:3011). Mientras no exista, la ruta
 * relativa devuelve 404 y ningún formulario llega a destino.
 *
 * Esto no necesita CORS: es un POST de formulario HTML, o sea una navegación
 * del navegador, no un fetch. El endpoint responde 303 y solo acepta redirigir
 * a URLs de melioraadvisory.cl, así que la persona termina en la página de
 * gracias del sitio.
 */
export const FORM_ENDPOINT = "https://portal.melioraadvisory.cl/api/formularios";
