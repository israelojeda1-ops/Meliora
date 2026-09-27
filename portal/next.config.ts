import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El portal se sirve desde el VPS de Meliora, no desde Vercel: `standalone`
  // arma un paquete que arranca con `node server.js`, sin arrastrar los
  // node_modules completos. Vercel lo ignora, así que no estorba si algún día
  // se vuelve a publicar allá.
  output: "standalone",

  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
