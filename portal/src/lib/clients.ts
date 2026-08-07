export type ClientConfig = {
  slug: string;
  name: string;
  passwordEnv: string;
  repo?: {
    owner: string;
    name: string;
    path: string;
    workflowFile?: string;
    bancoLogPath?: string;
  };
  // Para clientes que no son un HTML estático sino una app propia (ej.
  // Cóndores): en vez de traer un archivo de un repo, se reenvía la
  // request completa a este origen. La app debe estar montada con el
  // mismo basePath (`/${slug}`) para que sus assets y rutas calcen.
  proxyTarget?: string;
  // La app de destino autentica por su cuenta (usuarios y roles en su base).
  // Pedirle además la clave del portal sería un doble login, así que no pasa
  // por el gate ni por la pantalla de /login.
  loginPropio?: boolean;
};

export const CLIENTS: Record<string, ClientConfig> = {
  nuprotec: {
    slug: "nuprotec",
    name: "Nuprotec",
    passwordEnv: "NUPROTEC_PASSWORD",
    repo: {
      owner: "israelojeda1-ops",
      name: "nuprotec-informes",
      path: "Dashboard_NUPROTEC_2026.html",
      workflowFile: "generar-dashboard.yml",
      bancoLogPath: "generador/banco_movimientos_log.csv",
    },
  },
  // Réplica de Nuprotec sobre Vercel + Neon: app propia, se proxea completa.
  // Convive con /nuprotec (el HTML del repo) hasta el corte.
  nuprotecV2: {
    slug: "nuprotecV2",
    name: "Nuprotec (nueva versión)",
    passwordEnv: "NUPROTEC_PASSWORD",
    proxyTarget: "https://nuprotec-v2.vercel.app",
    loginPropio: true,
  },
  condores: {
    slug: "condores",
    name: "PreU Cóndores",
    passwordEnv: "CONDORES_PASSWORD",
    proxyTarget: "https://condores.vercel.app",
    loginPropio: true,
  },
  // Acceso privado, solo para Israel — no es un cliente, no se linkea desde
  // ningún lado del portal. Sin repo: las páginas propias no lo necesitan.
  interno: {
    slug: "interno",
    name: "Uso interno",
    passwordEnv: "INTERNO_PASSWORD",
  },
};

/**
 * Índice por slug en minúsculas.
 *
 * La búsqueda es insensible a mayúsculas porque los slugs viajan en URLs que
 * la gente copia, guarda en favoritos y reescribe a mano: con el lookup
 * exacto anterior, `nuprotecv2` no encontraba nada y el portal respondía
 * "Cliente no encontrado" por una sola letra.
 */
const POR_SLUG = new Map(Object.values(CLIENTS).map((c) => [c.slug.toLowerCase(), c]));

export function getClient(slug: string): ClientConfig | undefined {
  return POR_SLUG.get(slug.trim().toLowerCase());
}
