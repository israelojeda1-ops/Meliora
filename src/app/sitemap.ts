import type { MetadataRoute } from "next";

const BASE_URL = "https://melioraadvisory.cl";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/servicios", "/nosotros", "/planes", "/contacto"];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
