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
  // La copia de Vercel quedó congelada con el paso al servidor propio. Ya no se
  // proxea: /nuprotecV2 muestra el cartel de mudanza y manda a /Nuprotecv3.
  // Sin proxyTarget a propósito —si volviera, la app vieja quedaría otra vez en
  // pie invitando a escribir en una base que nadie mira—.
  nuprotecV2: {
    slug: "nuprotecV2",
    name: "Nuprotec (versión anterior)",
    passwordEnv: "NUPROTEC_PASSWORD",
  },
  // Nuprotec v3 en el servidor propio (VPS de Meliora). Convive con /nuprotecV2 (Vercel)
  // hasta el corte. Mismo patrón: app con login propio, montada con basePath /Nuprotecv3.
  Nuprotecv3: {
    slug: "Nuprotecv3",
    name: "Nuprotec",
    passwordEnv: "NUPROTEC_PASSWORD",
    // Con el portal y Nuprotec en la misma máquina, ir por el nombre público
    // sale a Cloudflare y vuelve para hablar con una app que está al lado. En
    // el servidor se pone NUPROTEC_V3_ORIGIN=http://127.0.0.1:3010 y el salto
    // desaparece. Sin la variable queda el nombre público, que es lo de hoy.
    proxyTarget: process.env.NUPROTEC_V3_ORIGIN ?? "https://nuprotec.melioraadvisory.cl",
  },
  condores: {
    slug: "condores",
    name: "PreU Cóndores",
    passwordEnv: "CONDORES_PASSWORD",
    proxyTarget: "https://condores.vercel.app",
  },
  // Acceso privado, solo para Israel — no es un cliente, no se linkea desde
  // ningún lado del portal. Sin repo: las páginas propias no lo necesitan.
  interno: {
    slug: "interno",
    name: "Uso interno",
    passwordEnv: "INTERNO_PASSWORD",
  },
};

export function getClient(slug: string): ClientConfig | undefined {
  return CLIENTS[slug];
}
