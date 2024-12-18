import { META } from "@consumet/extensions";
import { NextApiRequest, NextApiResponse } from "next";
import NodeCache from 'node-cache';

const anilist = new META.Anilist();
const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { ids } = req.query;
    if(!ids || ids == '') return res.status(400).send('Invalid Ids')
    const idArray = String(ids)
      .split(",")
      .map((id) => id.trim());

    const results = await Promise.all(
      idArray.map(async (id) => {
        const cachedData = cache.get(id);
        if (cachedData) {
          return cachedData; // Return cached data if available
        }

        try {
          const data = await anilist.fetchAnilistInfoById(id);
          cache.set(id, data); // Cache the fetched data
          return data;
        } catch (error: any) {
          return { error: error.message, id };
        }
      })
    );

    res.send(results);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
}
