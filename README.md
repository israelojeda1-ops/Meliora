# Meliora Advisory

Sitio web público de Meliora Advisory — firma boutique de asesoría
financiera, contable y de gestión para PyMEs en Chile.

Dominio: [melioraadvisory.cl](https://melioraadvisory.cl)

## Stack

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Tailwind CSS 4

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura de páginas

- `/` — Inicio (hero, pilares, problema/solución, servicios, resultados, CTA)
- `/servicios` — Detalle de las tres líneas de servicio
- `/nosotros` — Historia y trayectoria de la firma
- `/planes` — Planes y precios de referencia
- `/contacto` — Formulario de contacto y agendamiento

El Portal Clientes vive en un subdominio aparte (`portal.melioraadvisory.cl`)
y se enlaza desde el header y footer.

## Build de producción

```bash
npm run build
npm run start
```

## Deploy

Pensado para desplegarse en Vercel bajo el dominio `melioraadvisory.cl`.
