# Meliora Portal Clientes

Portal privado con login para que cada cliente de Meliora Advisory vea su
reportería (dashboard financiero) protegida por contraseña.

Deploy: `portal.melioraadvisory.cl` en Vercel (necesita servidor — no es
compatible con GitHub Pages, a diferencia del sitio principal).

## Cómo funciona

- Cada cliente es una entrada en `src/lib/clients.ts` (slug, nombre,
  variable de entorno con su contraseña, y ubicación del repo/archivo con
  su dashboard HTML).
- `/login?client=<slug>` — formulario de contraseña para ese cliente.
- Al validar, se guarda una sesión firmada (JWT, `jose`) en una cookie
  httpOnly.
- `/<slug>` (ej. `/nuprotec`) — ruta protegida por `src/proxy.ts`; el
  Route Handler vuelve a verificar la sesión y trae el dashboard HTML
  directo desde el repo privado de GitHub del cliente (vía API,
  autenticado con `GITHUB_TOKEN`), sirviéndolo tal cual.
- `/logout` — cierra sesión.

Hay dos tipos de cliente en `clients.ts`:

1. **`repo`** (ej. Nuprotec): un dashboard HTML estático que se regenera
   periódicamente y se sirve tal cual, traído del repo privado del cliente.
2. **`proxyTarget`** (ej. Cóndores): el cliente es una app propia (con su
   propio backend/BD), no un archivo estático. En vez de traer un HTML, la
   ruta catch-all en `src/app/<slug>/[[...path]]/route.ts` reenvía la
   request completa (método, headers, body) al origen indicado y devuelve
   la respuesta tal cual. La app de destino debe estar desplegada con
   `basePath: "/<slug>"` en su propio `next.config`, así sus assets y rutas
   internas ya calzan con el prefijo bajo el que el portal la expone —
   el proxy no reescribe rutas, solo reenvía.

Es una versión simple (una contraseña compartida por cliente, no cuentas
individuales por usuario todavía — para clientes tipo `proxyTarget`, la
app de destino puede implementar su propia autenticación interna además
de esta puerta compartida). Pensada para evolucionar: agregar un
cliente nuevo es agregar una entrada en `clients.ts` + su variable de
contraseña en el entorno.

## Variables de entorno

Ver `.env.example`. En Vercel, configúralas en Project Settings →
Environment Variables:

- `SESSION_SECRET` — secreto para firmar las cookies de sesión.
- `NUPROTEC_PASSWORD` — contraseña compartida de Nuprotec.
- `CONDORES_PASSWORD` — contraseña compartida de PreU Cóndores.
- `GITHUB_TOKEN` — token con acceso de lectura al repo privado
  `nuprotec-informes` (y a los de futuros clientes con dashboard estático).

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # y completa los valores
npm run dev
```
