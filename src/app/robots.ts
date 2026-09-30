import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: ["/", "/login", "/podminky", "/soukromi"], disallow: ["/admin", "/api", "/auth", "/j/"] },
  };
}
