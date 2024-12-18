import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing VTT URL' });
  }

  try {
    const response = await fetch(url as string, {
      method: 'GET',
      //@ts-ignore
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'Referer': req.headers['referer'] || '',
        'sec-ch-ua': req.headers['sec-ch-ua'] || '',
        'sec-ch-ua-mobile': req.headers['sec-ch-ua-mobile'] || '',
        'sec-ch-ua-platform': req.headers['sec-ch-ua-platform'] || '',
        'Origin': req.headers['origin'] || '',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch VTT file' });
    }

    const data = await response.text(); // Get VTT file content
    
    const pathName = new URL(url as string).pathname; // Get the base URL

    // Replace relative URLs with absolute URLs
    const modifiedData = data.replace(/(http[s]?:\/\/[^"\s]+\/)?(sprite-\d+\.jpg)/g, (match, p1, p2) => {
      return `/api/proxy/images?url=https://s.megastatics.com${pathName.replace('/thumbnails.vtt', '')}/${p2}`; // Modify as needed for your URLs
    });

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.setHeader('Content-Type', 'text/vtt');
    res.send(modifiedData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch VTT file' });
  }
}
