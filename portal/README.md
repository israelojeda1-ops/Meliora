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

Es una versión simple (una contraseña compartida por cliente, no cuentas
individuales por usuario todavía). Pensada para evolucionar: agregar un
cliente nuevo es agregar una entrada en `clients.ts` + su variable de
contraseña en el entorno.

## Variables de entorno

Ver `.env.example`. En Vercel, configúralas en Project Settings →
Environment Variables:

- `SESSION_SECRET` — secreto para firmar las cookies de sesión.
- `NUPROTEC_PASSWORD` — contraseña compartida de Nuprotec.
- `GITHUB_TOKEN` — token con acceso de lectura al repo privado
  `nuprotec-informes` (y a los de futuros clientes).

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # y completa los valores
npm run dev
```
