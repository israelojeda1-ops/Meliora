import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE_URL = "https://melioraadvisory.cl";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/servicios",
    "/nosotros",
    "/planes",
    "/diagnostico",
    "/calculadora",
    "/calculadora-honorarios",
    "/calculadora-finiquito",
    "/indicadores",
    "/recursos",
    "/recursos/cuanto-cuesta-contratar-trabajador-chile",
    "/recursos/boleta-o-contrato-cuando-conviene",
    "/recursos/reforma-previsional-2026-empleadores",
    "/recursos/como-proyectar-flujo-de-caja-pyme",
    "/recursos/indicadores-que-toda-pyme-deberia-mirar",
    "/contacto",
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
