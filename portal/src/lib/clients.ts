export type ClientConfig = {
  slug: string;
  name: string;
  passwordEnv: string;
  repo: {
    owner: string;
    name: string;
    path: string;
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
    },
  },
};

export function getClient(slug: string): ClientConfig | undefined {
  return CLIENTS[slug];
}
