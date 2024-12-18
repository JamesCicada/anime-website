import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

// Handler for the video proxy route
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // Check if the URL is for a .ts file
    if (url.endsWith(".ts")) {
      // Fetch the .ts file as binary data
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          "User-Agent": "Next.js CORS Proxy",
        },
      });

      // Set appropriate headers for binary response
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "video/mp2t"); // Set content type for .ts
      res.status(200).send(Buffer.from(response.data)); // Send binary data
      return;
    }

    // Handle M3U8 content as before
    const m3u8Response = await axios.get(url, {
      headers: {
        "User-Agent": "Next.js CORS Proxy",
      },
    });

    // Set CORS headers for M3U8 response
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Content-Type",
      (m3u8Response.headers["Content-Type"] as string) || "application/x-mpegURL"
    );

    // Prepend base URL for segments in the M3U8 playlist
    const cleanUrl = `/api/proxy/video?url=${url.replace(/ep\.\d\.[0-9]+\.m3u8/i, "").replace(/ep\.[0-9]+\.[0-9]+\.[0-9]+\.m3u8/i , '')}`;
    const playlist = prependUrlToM3U8(m3u8Response.data, cleanUrl);

    // Send the M3U8 content to the client
    res.status(200).send(playlist);

  } catch (error) {
    console.error("Error fetching M3U8 content:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Function to prepend the base URL to the M3U8 playlist content
function prependUrlToM3U8(m3u8Content: string, baseUrl: string): string {
  // Split the content by lines
  const lines = m3u8Content.split("\n");
  let updatedContent = "";

  // Iterate over each line
  lines.forEach((line) => {
    const trimmedLine = line.trim();

    // Check if the line contains a segment URL (ends with .m3u8 or .ts)
    if (trimmedLine.endsWith(".m3u8") || trimmedLine.endsWith(".ts")) {
      // Prepend the base URL to the segment URL
      updatedContent += baseUrl + trimmedLine + "\n";
    } else {
      // Just add the line as it is (for EXT-X-STREAM-INF, etc.)
      updatedContent += line + "\n";
    }
  });

  return updatedContent;
}
