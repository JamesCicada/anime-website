import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing subtitle URL' });
  }

  try {
    const response = await fetch(url as string, {
      method: 'GET',
      // @ts-ignore
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'Referer': req.headers['referer'] || '',
        'sec-ch-ua': req.headers['sec-ch-ua'] || '',
        'sec-ch-ua-mobile': req.headers['sec-ch-ua-mobile'] || '',
        'sec-ch-ua-platform': req.headers['sec-ch-ua-platform'] || '',
        'Origin': req.headers['origin'] || '',
      },
    });

    const data = await response.text();

    res.setHeader('Content-Type', 'text/vtt');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subtitles' });
  }
}