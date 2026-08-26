# Auditoría de UX — Sitio público melioraadvisory.cl

Fecha: 2026-08-26. Foco pedido por el dueño: **"se ve muy IA generada — ¿qué
podríamos hacer?"**. La auditoría del portal del 2026-08-08 queda en el
historial git.

## Diagnóstico: por qué se ve "generado"

La percepción es correcta y tiene causas concretas y medibles. No es un
problema de fealdad — el sitio es limpio y consistente — sino de **ausencia de
evidencia humana**. Todo lo que se ve podría existir sin que la empresa
exista.

### D1 — Cero imágenes reales (el hallazgo principal)
En todo el sitio no hay **ni una fotografía ni una captura de pantalla**: solo
íconos de librería (Heroicons) y un diagrama SVG. No hay foto del fundador, ni
del portal de clientes funcionando, ni de un dashboard real. Los sitios
armados con plantilla o IA se ven exactamente así: hero + íconos + tarjetas.
Es la señal #1 y la más barata de corregir.

### D2 — El fundador es anónimo
`/nosotros` habla de "un Gerente de Administración y Finanzas, Contador
Auditor y MBA" **sin nombre ni rostro**. Para una boutique cuyo pitch es
"trato directo con quien hace el análisis", el anonimato contradice la
promesa central y dispara la sospecha de sitio fabricado. Nombre + foto +
LinkedIn convierten la página más débil del sitio en la más fuerte.

### D3 — Métricas sin atribución
Los "resultados reales" (40%, 30%, 20%, 25%) aparecen dos veces (home y
nosotros) sin cliente, rubro ni contexto verificable. Números redondos sin
dueño se leen como inventados — aunque sean ciertos. Con una línea de
contexto cada uno ("distribuidora farmacéutica, 60 personas") pasan de
sospechosos a creíbles. Y no hay ningún testimonio ni logo de cliente en todo
el sitio.

### D4 — Monotonía estructural
Todas las páginas repiten el mismo esqueleto: banda navy con eyebrow verde en
mayúsculas → H1 → grillas de tarjetas `rounded-2xl` con ícono → banda CTA
navy. Medido: 31 usos del mismo patrón de tarjeta en 8 archivos. La
consistencia es buena; la uniformidad total es lo que huele a plantilla.
Basta romperla 2–3 veces con secciones de otra naturaleza (una foto a sangre,
una captura del producto, una cita grande).

### D5 — Tics de redacción de IA
El copy tiene los patrones reconocibles: **43 guiones largos (—)** en las
páginas, tríadas constantes ("Contabilidad, remuneraciones y finanzas"),
preguntas retóricas como títulos ("¿Te suena familiar?"), y CTAs con la misma
fórmula en cada página. Ningún párrafo tiene voz personal (anécdota, opinión,
primera persona singular).

### D6 — Tipografía genérica
Inter en todo. Es la tipografía por defecto de la era IA. Un solo cambio — una
serif o display con carácter para los títulos — desmarca el sitio del 90% de
las landing generadas.

## Defectos menores (no relacionados al foco)

- El menú "Herramientas" del header se abre por hover/clic pero no cierra con
  tecla Escape ni al navegar con teclado (accesibilidad).
- En móvil, las tablas de desglose de las calculadoras quedan apretadas bajo
  360px de ancho.
- `/contacto/gracias` no ofrece siguiente paso (enlace a recursos o
  calculadoras) — página muerta tras la conversión.

## Preferencias (no defectos)

- El verde `emerald` sobre navy tiene contraste justo en textos pequeños;
  subir un paso de luminosidad ayudaría, pero pasa.
- Los artículos de recursos podrían llevar fecha visible de publicación.

## Qué haría, en orden de impacto sobre esfuerzo

1. **Nombre y foto del fundador en `/nosotros`** + una línea en primera
   persona. (Requiere: 1 foto y la decisión de firmar.)
2. **2–3 capturas reales del portal/dashboards** en home y `/servicios` — el
   producto existe, mostrarlo. (Requiere: sacar screenshots, difuminar datos.)
3. **Anclar las 4 métricas** con rubro y tamaño de empresa, o reducirlas a las
   2 defendibles. 1–2 testimonios aunque sean anónimos con cargo.
4. **Pasada de copy anti-plantilla**: reducir guiones largos a la mitad,
   variar los CTAs, agregar 2–3 frases con voz propia por página.
5. **Tipografía display para títulos** (una fuente con carácter, manteniendo
   Inter para texto).
6. Romper el patrón de tarjetas en home con una sección visualmente distinta.
