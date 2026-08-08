# Auditoría de seguridad — Portal Meliora

Alcance: `/workspace/meliora/portal` completo, con foco en la zona nueva
`/Privado`. Solo lectura.

## Resumen

El portal está, en lo esencial, bien construido: los JWT se firman/verifican con
`jose` fijando `alg: HS256` (sin confusión de algoritmos), las cookies de sesión
llevan `httpOnly/secure/sameSite`, el render de la cartelera usa React
(auto-escape) frente a datos hostiles de API-Sports/ESPN, las zonas privadas
están `noindex`, y los parámetros externos que arman rutas (`fecha`, `deporte`,
`dias`) están validados o en lista blanca. `src/proxy.ts` es middleware activo
(Next.js 16 renombró `middleware`→`proxy`), así que la puerta por slug funciona.

No hay vulnerabilidades críticas ni altas. Los hallazgos son media/baja.

## Hallazgos por severidad

### Media

**M1 — `/demo/access` público: escribe en GitHub y dispara correos sin rate-limit ni sanitización.**
`src/app/demo/access/route.ts:52`. El gate de la demo es solo `localStorage`. Un
bot puede generar commits en el repo privado, bombardear correo vía
`formsubmit.co`, e inyectar fórmulas CSV (`nombre/correo/empresa` sin neutralizar
`= + - @`; `toCSVField` en `src/lib/csv.ts:63` solo entrecomilla por coma). IP de
`x-forwarded-for` cruda y persistida. *Arreglo:* token/origin check + rate-limit,
y prefijar `'` a celdas que empiecen por `= + - @`.

**M2 — Los proxies catch-all reenvían `Cookie` y `Authorization` a orígenes externos.**
`src/app/condores/[[...path]]/route.ts:33`, `src/app/nuprotecV2/[[...path]]/route.ts:33`.
La cookie de sesión del portal (JWT de 30 días) viaja íntegra a las apps
externas. *Arreglo:* quitar `cookie` y `authorization` antes del fetch upstream.

**M3 — XSS de DOM en el widget de importación de banco.**
`src/lib/banco-import-widget.ts:98-100,118`. `fecha/rut/banco` de la planilla se
concatenan sin escapar en `innerHTML`. Mayormente self-XSS (lo sube el cliente
autenticado), de ahí media. *Arreglo:* escapar HTML o usar `textContent`.

**M4 — `GITHUB_TOKEN` reutilizado como token del almacén deportivo.**
`src/lib/deportes/almacen.ts:33`: `ALMACEN_TOKEN ?? GITHUB_TOKEN`. Si falta
`ALMACEN_TOKEN`, `/Privado` opera con un PAT que alcanza los repos de clientes.
*Arreglo:* exigir `ALMACEN_TOKEN` dedicado (fine-grained, solo `datos-deportes`)
y no caer nunca a `GITHUB_TOKEN`. **Ya resuelto en operación**: el usuario
configuró un token acotado; falta cerrar el fallback en código.

### Baja

- **B1 — Login de cliente sin comparación de tiempo constante.** `src/lib/auth-actions.ts:23`. `/Privado` sí la usa. *Arreglo:* `timingSafeEqual`.
- **B2 — JWT sin revocación; logout solo borra la cookie.** Token capturado vale 30 días. *Arreglo:* acortar expiración / id de sesión revocable.
- **B3 — Errores reflejan el cuerpo crudo de la API de GitHub.** `nuprotec/regenerate/route.ts:46` y `banco/*`. No filtra el token pero expone estructura del repo. *Arreglo:* log en servidor, mensaje genérico al cliente.
- **B4 — Prefijos públicos del middleware sin límite de segmento.** `src/proxy.ts:9,14`: `startsWith` deja pasar `/Privado-x`. *Arreglo:* comparar por segmento (`===` o `+ "/"`).
- **B5 — CSRF de logout en `/Privado/salir`; mutaciones dependen solo de SameSite.** *Arreglo:* token anti-CSRF o verificación de `Origin`.
- **B6 — Sin rate-limit en `/Privado/refrescar` (forzar=1 gasta cuota) ni `/Privado/poblar` (escribe a GitHub).** El abusador ya tendría la clave; conviene limitar igual.

## Áreas revisadas sin hallazgos

Confinamiento de algoritmo JWT (HS256 fijo); imposible reusar token de cliente en
`/Privado` y viceversa (formas de payload disjuntas); flags de cookie correctos;
sin XSS en la cartelera (React auto-escape, sin `dangerouslySetInnerHTML`); sin
SSRF en proxies (host destino fijo); sin inyección de path en el almacén (`d.id`
de catálogo, `fecha` validada, `dias` acotado 1–45); `CRON_SECRET` ausente no
abre acceso (cae a verificación por cookie); ningún secreto se serializa al
cliente; sin open redirect; zonas privadas `noindex`; parsers CSV/JSON robustos.
