import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

// Handler for the video proxy route
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the URL of the M3U8 file from the query parameters
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // Fetch the M3U8 content from the provided URL
    const response = await axios.get(url, {
      headers: {
        // Optional: Add any necessary headers like user-agent or referer if required
        "User-Agent": "Next.js CORS Proxy",
      },
    });

    // Set CORS headers to allow cross-origin access
    res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all domains
    res.setHeader(
      "Content-Type",
      (response.headers["Content-Type"] as string) || "application/x-mpegURL"
    );
    console.log(response.data);
    const playlist = prependUrlToM3U8(
      response.data,
      `/api/proxy/${url.replace(/ep\.\d\.[0-9]+\.m3u8/i, "")}`
    );
    console.log(playlist);
    
    // Send the M3U8 content to the client
    res.status(200).send(playlist);
  } catch (error) {
    // Handle any errors during the fetch process
    console.error("Error fetching M3U8 content:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
function prependUrlToM3U8(m3u8Content: string, baseUrl: string): string {
  // Split the content by lines
  const lines = m3u8Content.split("\n");
  let updatedContent = "";

  // Iterate over each line
  lines.forEach((line) => {
    // Check if the line contains a segment URL (i.e., ends with .m3u8)
    if (line.trim().endsWith(".m3u8")) {
      // Prepend the base URL to the segment URL
      updatedContent += baseUrl + line.trim() + "\n";
    } else {
      // Just add the line as it is (for EXT-X-STREAM-INF, etc.)
      updatedContent += line + "\n";
    }
  });

  return updatedContent;
}
