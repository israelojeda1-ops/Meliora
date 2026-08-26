export interface Articulo {
  slug: string;
  titulo: string;
  bajada: string;
  fecha: string;
  lectura: string;
  tag: string;
}

export const articulos: Articulo[] = [
  {
    slug: "cuanto-cuesta-contratar-trabajador-chile",
    titulo: "¿Cuánto cuesta realmente contratar un trabajador en Chile? (2026)",
    bajada:
      "El sueldo bruto es solo el comienzo: cesantía, seguro de accidentes y el nuevo aporte de la reforma previsional suman cerca de un 7% extra. Desglose completo con cifras vigentes.",
    fecha: "2026-08-26",
    lectura: "6 min",
    tag: "Remuneraciones",
  },
  {
    slug: "boleta-o-contrato-cuando-conviene",
    titulo: "¿Boleta de honorarios o contrato? Cuándo conviene cada uno",
    bajada:
      "Con la retención en 15,25% y subiendo a 17% en 2028, la brecha entre boletear y contratar se achica cada año. Los números y los riesgos que debes mirar antes de decidir.",
    fecha: "2026-08-26",
    lectura: "5 min",
    tag: "Tributario",
  },
  {
    slug: "reforma-previsional-2026-empleadores",
    titulo: "Reforma previsional: lo que cambia para tu empresa desde agosto 2026",
    bajada:
      "El aporte del empleador saltó de 1% a 3,5% y llegará a 8,5%. Qué se paga, sobre qué base, y cómo planificar el mayor costo laboral de la década.",
    fecha: "2026-08-26",
    lectura: "5 min",
    tag: "Reforma previsional",
  },
  {
    slug: "como-proyectar-flujo-de-caja-pyme",
    titulo: "Cómo proyectar el flujo de caja de tu pyme (método simple de 8–12 semanas)",
    bajada:
      "La mayoría de las pymes que quiebran son rentables en el papel: mueren por caja. Un método concreto para anticipar déficits con semanas de ventaja.",
    fecha: "2026-08-26",
    lectura: "7 min",
    tag: "Finanzas",
  },
  {
    slug: "indicadores-que-toda-pyme-deberia-mirar",
    titulo: "Los 5 indicadores que todo dueño de pyme debería mirar cada mes",
    bajada:
      "No necesitas 40 KPIs: necesitas 5 bien elegidos y al día. Margen por línea, DSO, caja proyectada, punto de equilibrio y EBITDA, explicados sin jerga.",
    fecha: "2026-08-26",
    lectura: "6 min",
    tag: "Gestión",
  },
];
