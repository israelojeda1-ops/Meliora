import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El portal se sirve desde el VPS de Meliora, no desde Vercel: `standalone`
  // arma un paquete que arranca con `node server.js`, sin arrastrar los
  // node_modules completos. Vercel lo ignora, así que no estorba si algún día
  // se vuelve a publicar allá.
  output: "standalone",

  // El dashboard HTML de Nuprotec que se servía en /nuprotec quedó congelado el
  // 08-09-2026 y ya lo reemplazó el portal propio. Cualquier enlace guardado
  // (/nuprotec, /nuprotec/banco/…) va directo al portal nuevo. 302 y no 301:
  // el navegador no lo memoriza y se puede deshacer sin limpiar cachés.
  async redirects() {
    return [
      {
        source: "/nuprotec/:path*",
        destination: "https://nuprotec.melioraadvisory.cl/Nuprotecv3",
        permanent: false,
      },
    ];
  },

  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
