import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://loveinanswers.site";

  return [
    {
      url: base,
      lastModified: new Date(),
    },
    {
      url: `${base}/login`,
      lastModified: new Date(),
    },
    {
      url: `${base}/register`,
      lastModified: new Date(),
    },
    {
      url: `${base}/dashboard`,
      lastModified: new Date(),
    },
  ];
}
