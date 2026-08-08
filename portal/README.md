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

## Zona privada de fútbol (`/Privado`)

Página propia, pensada para el celular: la cartelera del día en las ligas
seguidas, con los remates y córners proyectados de cada equipo y su historial
reciente. Todo se muestra en hora de Chile, sin importar el reloj del
dispositivo.

Tiene su propia clave y su propia cookie (`privado_session`), y no pasa por la
puerta de clientes del portal.

### Variables de entorno

| Variable | Para qué |
| --- | --- |
| `PRIVADO_PASSWORD` | Clave de acceso a `/Privado`. Sin ella la página no deja entrar. |
| `API_FOOTBALL_KEY` | Clave de API-Football (plan gratuito: 100 peticiones al día, 10 por minuto). |
| `SESSION_SECRET` | Ya usado por el portal; firma también la cookie de esta zona. |
| `CRON_SECRET` | Lo define Vercel; autoriza al cron a llamar `/Privado/refrescar`. |

### Cómo se gasta la cuota

- La cartelera del día es **una** petición para todas las ligas.
- El historial se pide **por liga, no por equipo**: una petición para la lista de
  los últimos 60 partidos y una cada 20 partidos para sus estadísticas. Son ~3
  peticiones por liga en vez de ~2 por equipo.
- Las estadísticas de un partido jugado no cambian nunca, así que se cachean
  aparte (`futbol-stats`) y el botón **Actualizar** no las vuelve a pedir: solo
  caduca las listas (`futbol-listas`).
- Cada invocación tiene un tope de peticiones para no chocar con el límite por
  minuto. Si quedan ligas sin cargar, la página lo dice y se completan en la
  siguiente pasada o con el cron.

El cron de `vercel.json` corre tres veces seguidas a las 05:00, 05:10 y 05:20 de
Chile para ir completando las ligas del día sin pasarse del límite por minuto.
