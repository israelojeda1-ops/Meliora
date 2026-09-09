<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:meliora-contexto -->

# Meliora Advisory — contexto del proyecto

Lee esto antes de trabajar. Está escrito para que una sesión nueva no tenga que
redescubrir el proyecto leyendo archivos ni re-preguntando decisiones ya tomadas.

## Consumo de recursos: reglas primero

Una sesión anterior gastó 12 millones de tokens en subagentes (263 agentes en
tres oleadas) revisando el portal. Encontró defectos reales, pero el mismo
resultado se conseguía con un tercio. Para evitar repetirlo:

- **Trabaja directo por defecto.** Editar, compilar y verificar en el navegador
  no necesita subagentes. La mayoría de las tareas de este repo son de una o dos
  ediciones más `npm run lint && npm run build`.
- **No lances workflows con agentes salvo que el usuario los pida explícitamente.**
  Si crees que una tarea los amerita, dile cuántos agentes levantarías y espera
  su respuesta.
- **Si revisas con agentes, no multipliques.** Máximo 3 o 4 revisores y **un**
  verificador por hallazgo, no dos. Verificar 71 hallazgos con 2 agentes cada uno
  son 142 agentes por una sola orden.
- **Los screenshots son caros de leer.** Captura solo las vistas que cambiaste y
  míralas tú; no mandes el set completo a varios agentes a la vez.
- Prefiere un script de verificación (`npm run test:demo`) sobre un agente que
  revise números a ojo: cuesta una fracción y no se equivoca.

## Qué es Meliora

Asesoría financiera boutique para pymes chilenas, de Israel Ojeda (Contador
Auditor INACAP, MBA U. de Chile, Magíster en BI en curso, 15+ años en finanzas,
los últimos 8 como gerente de administración y finanzas).

**El dolor que ataca**: el contador tradicional registra y declara, pero nadie
entrega la información como la necesita quien dirige la empresa.

**Posicionamiento** (corregido varias veces por Israel, respétalo):
- Reportería **en tiempo y forma**, **especializada**, con **personalización** y
  **acompañamiento** mes a mes.
- «Sobre tu sistema o el nuestro».
- **NUNCA** escribir la enumeración «contabilidad, remuneraciones y reportería»
  (o «y finanzas»): eso lo ofrece cualquier contador y anula la diferencia. Los
  nombres de servicios o módulos sí pueden llamarse así por separado.
- Nada de «el análisis lo hace Israel» ni «pool de analistas».
- Sin precios por plan en el sitio público: solo «cotización a la medida tras el
  diagnóstico». La versión con precios vive oculta en `/planes-detalle`.

**Estilo de copy**: es-CL, sin guiones largos (usa «:» o «,»), sin «X min de
lectura», sin negritas en nombres de herramientas, comillas angulares « » en JSX
(el lint prohíbe las rectas). Frases directas, sin relleno de marketing.

## Los dos proyectos del repo

### 1. Sitio público (raíz) — melioraadvisory.cl
Next.js 16 + Tailwind 4, **export estático** a GitHub Pages (`output: "export"`).
- Herramientas de captación: `/diagnostico`, `/calculadora` (sueldos),
  `/calculadora-honorarios`, `/calculadora-finiquito`, `/indicadores`.
- Motor de remuneraciones en `src/lib/remuneraciones/`, validado al peso contra
  liquidaciones reales. **Verifica con `npm run test:remuneraciones` (77 asserts)
  antes de tocar cualquier cálculo.** Los parámetros legales viven por mes en
  `parametros/` y hay que actualizarlos cuando cambian (UF, UTM, IMM, topes,
  tasas de la reforma previsional Ley 21.735).
- Formularios: FormSubmit a israelojeda1@gmail.com.

### 2. Portal de clientes (`portal/`) — portal.melioraadvisory.cl
Next.js 16 en Vercel (SSR). La demo pública está en `portal/src/app/demo/`:
- `data.ts` datos ficticios, `charts.tsx` gráficos SVG propios, `ui.tsx`
  primitivos, `icons.tsx`, `DemoDashboard.tsx` orquestador.
- **Cero dependencias de gráficos**: todo es SVG a mano. No agregues recharts.
- 10 pestañas en 5 grupos. Israel pidió expresamente menos pestañas: no las
  vuelvas a multiplicar.
- **`npm run test:demo` verifica 22 cuadraturas del modelo ficticio** (ventas =
  líneas = productos, caja = flujo indirecto, CAPEX, EBITDA vs operacional,
  deudores dentro de su tramo). Si cambias un número, corre el test.
- La demo también sirve de argumento de venta: si los datos no cuadran entre
  pestañas, un cliente lo nota.

## Flujo de trabajo

Rama `claude/fortalecer-negocio-meliora-z41agm`, siempre desde `origin/main`:

```
git fetch origin main && git checkout -B claude/fortalecer-negocio-meliora-z41agm origin/main
# cambios; luego lint + build (+ tests si tocaste cálculos o datos del demo)
git add … && git commit && git push -u origin … --force-with-lease
```
Luego PR con cuerpo en español y merge por squash. Israel autorizó crear y
mergear PRs sin preguntar. El sitio despliega por GitHub Actions y el portal por
Vercel (solo si cambió `portal/`).

**Verificar el deploy**: el contenido de páginas cliente vive en los chunks de
JavaScript, no en el HTML. `curl` al HTML no basta; busca el texto dentro de
`/_next/static/chunks/*.js`.

**Navegador**: Playwright en `/opt/pw-browsers/chromium` sirve para revisar
localhost, pero **no alcanza sitios externos** (el proxy los corta).

## Pendientes que dependen de Israel

- **contacto@melioraadvisory.cl rebota**: falta Email Routing en Cloudflare y la
  dirección ya está publicada en el sitio.
- Los accesos a la demo se guardan en `data/demo_access_log.csv` **dentro del
  repositorio**, con nombre y correo. Si el repo es público, esos leads quedan
  expuestos. Cambiar el destino requiere su confirmación.
- Comentarios del bot de Vercel: se apagan en el panel de cada proyecto
  (Settings → Git → Comments), no por código.
- Testimonios de clientes: dijo «no aún».

<!-- END:meliora-contexto -->
