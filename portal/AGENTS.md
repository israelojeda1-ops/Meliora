<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:meliora-portal -->

# Portal Meliora

El contexto completo del proyecto está en el `AGENTS.md` de la raíz del
repositorio: léelo antes de trabajar aquí (incluye las reglas de consumo de
recursos y las decisiones de posicionamiento ya tomadas).

## Específico de este paquete

- Vercel, SSR. Solo despliega cuando cambia algo dentro de `portal/`.
- La demo pública vive en `src/app/demo/`, dividida en `data.ts` (datos
  ficticios), `charts.tsx` (gráficos SVG hechos a mano, sin librerías),
  `ui.tsx` (primitivos), `icons.tsx` y `DemoDashboard.tsx` (orquestador).
- **`npm run test:demo` verifica 22 cuadraturas del modelo ficticio.** Córrelo
  siempre que toques `data.ts`: los números tienen que cuadrar entre pestañas
  porque la demo es material de venta.
- 10 pestañas en 5 grupos, ya consolidadas a pedido de Israel. No las vuelvas a
  multiplicar.
- Reglas de gráficos que ya costaron una ronda de correcciones: los ticks del
  eje deben cubrir el máximo real (si no, las barras se recortan planas), leyenda
  solo con dos o más series, colores de estado reservados a estado, y ninguna
  pestaña puede desbordar horizontalmente a 390 px.
- El acceso a la demo se guarda en `data/demo_access_log.csv` en la raíz del
  repositorio; ver el pendiente de privacidad en el AGENTS.md raíz.

<!-- END:meliora-portal -->
