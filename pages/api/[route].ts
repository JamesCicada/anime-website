import { NextApiRequest, NextApiResponse } from "next";
import NodeCache from "node-cache";
import { ANIME, META, StreamingServers } from "@consumet/extensions";

const cache = new NodeCache({ stdTTL: 24 * 3600 }); // 24-hour TTL
const zoro = new ANIME.Zoro();
const gogo = new ANIME.Gogoanime();
const anilist = new META.Anilist();

// Default settings
const DEFAULT_PROVIDER = "gogoanime";
const DEFAULT_TYPE = "ANIME";
const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 25;

// Helper: Cache wrapper with retry mechanism
const withCache = async (cacheKey: string, fetchFn: () => Promise<any>, retries = 3) => {
  const cachedData = cache.get(cacheKey);
  if (cachedData) return cachedData;

  let attempt = 0;
  while (attempt < retries) {
    try {
      const data = await fetchFn();
      cache.set(cacheKey, data);
      return data;
    } catch (error: any) {
      attempt++;
      console.error(`Fetch attempt ${attempt} failed: ${error.message}`);
      if (attempt === retries) throw error;
    }
  }
};

// Helper: Validate and parse query parameters
const parseQueryParam = (query: any, key: string, type: "string" | "number") => {
  if (!query[key]) return undefined;
  return type === "number" ? Number(query[key]) : String(query[key]);
};

// Helper: Build advanced search params
function buildAdvancedSearchParams(query: any) {
  const {
    keywords,
    type = DEFAULT_TYPE,
    page,
    perPage,
    format,
    sort,
    genres,
    id,
    year,
    status,
    season,
  } = query;

  return {
    query: keywords ? String(keywords) : undefined,
    type: String(type),
    page: page ? Number(page) : undefined,
    perPage: perPage ? Number(perPage) : undefined,
    format: format ? String(format) : undefined,
    sort: sort ? (Array.isArray(sort) ? sort.map(String) : [String(sort)]) : undefined,
    genres: genres ? (Array.isArray(genres) ? genres.map(String) : genres?.split(',')) : undefined,
    id: id ? (isNaN(Number(id)) ? String(id) : Number(id)) : undefined,
    year: year ? Number(year) : undefined,
    status: status ? String(status) : undefined,
    season: season ? String(season).toUpperCase() : undefined,
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req;
  const { route, id = "", ids = "", provider = DEFAULT_PROVIDER, audio } = query;
  const cacheKey = `${route}-${JSON.stringify(query)}`;

  try {
    const data = await withCache(cacheKey, async () => {
      switch (route) {
        case "trending": {
          const page = parseQueryParam(query, "page", "number") || DEFAULT_PAGE;
          return await anilist.fetchTrendingAnime(Number(page), DEFAULT_PER_PAGE);
        }
        case "popular": {
          const page = parseQueryParam(query, "page", "number") || DEFAULT_PAGE;
          return await anilist.fetchPopularAnime(Number(page), DEFAULT_PER_PAGE);
        }
        case "getData": {
          if (!id || isNaN(Number(id))) {
            throw new Error("Invalid or missing ID");
          }

          // Primary API request
          try {
            return await anilist.fetchAnimeInfo(id as string);
          } catch (primaryError) {
            console.error("Primary API request failed, attempting backup URL");

            // Backup API request with retry logic
            const backupUrl = `${process.env.BACKEND_URL}/meta/anilist/info/${id}`;
            const backupResponse = await fetch(backupUrl);
            if (!backupResponse.ok) {
              throw new Error(`Backup API response error: ${backupResponse.statusText}`);
            }
            const backupData = await backupResponse.json();
            return backupData;
          }
        }
        case "search": {
          const keywords = parseQueryParam(query, "keywords", "string");
          if (!keywords) throw new Error("Keywords are required for search");
          return await anilist.advancedSearch(String(keywords), DEFAULT_TYPE);
        }
        case "getStream": {
          const episodeId = audio === "sub"
            ? query.episodeId
            : String(query.episodeId).replace("sub", "dub");
          if (!episodeId) throw new Error("Episode ID is required");

          return provider === "zoro"
            ? await zoro.fetchEpisodeSources(episodeId as string, StreamingServers.VidStreaming)
            : await gogo.fetchEpisodeSources(episodeId as string);
        }
        case "advanced-search": {
          const params = buildAdvancedSearchParams(query);
          return await anilist.advancedSearch(
            params.query,
            params.type,
            params.page,
            params.perPage,
            params.format,
            params.sort,
            params.genres,
            params.id,
            params.year,
            params.status,
            params.season
          );
        }
        default:
          throw new Error("Invalid route");
      }
    });

    res.json({ data });
  } catch (error: any) {
    console.error("API Error:", error);
    res.status(500).json({ error: error.message || "An error occurred" });
  }
}
