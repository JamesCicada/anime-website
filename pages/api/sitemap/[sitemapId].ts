import { NextApiRequest, NextApiResponse } from "next";
import NodeCache from "node-cache";
import { SitemapStream, streamToPromise } from "sitemap";

// Initialize cache
const cache = new NodeCache({ stdTTL: 24 * 3600 }); // Cache for 24 hours

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { sitemapId } = req.query;
  const cacheKey = `sitemap-${sitemapId}`;

  try {
    // Check for cached data
    const cachedSitemap = cache.get(cacheKey);
    if (cachedSitemap) {
      res.setHeader("Content-Type", "application/xml");
      return res.status(200).send(cachedSitemap);
    }

    // Fetch anime data for the specific sitemapId
    const page = Number(sitemapId) || 1; // Assume `sitemapId` represents the page
    const data = await fetchData(`${process.env.BACKEND_URL}/meta/anilist/popular?perPage=50&page=${page}`);
    
    // Generate the sitemap XML
    const stream = new SitemapStream({ hostname: 'https://anime.jcwatch.com' });
    // const stream = new SitemapStream({ hostname: 'http://localhost:3000' });
    data.results.forEach((anime: any) => {
      stream.write({ url: `/watch/${anime.id}`, changefreq: 'daily', priority: 0.7 });
    });
    stream.end();

    // Convert stream to a sitemap XML string
    const sitemapOutput = await streamToPromise(stream).then((sm) => sm.toString());

    // Cache the sitemap
    cache.set(cacheKey, sitemapOutput);

    // Send the XML response
    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(sitemapOutput);
  } catch (error) {
    console.error("Sitemap Generation Error:", error);
    res.status(500).json({ error: "An error occurred while generating the sitemap" });
  }
}

// Utility function to fetch data (adapted from your existing code)
async function fetchData(url: string) {
  const response = await fetch(url, { cache: "force-cache", next: { revalidate: 3600 } });
  if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
  return response.json();
}