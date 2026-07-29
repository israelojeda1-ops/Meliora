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
