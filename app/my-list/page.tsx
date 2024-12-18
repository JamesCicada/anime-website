"use client";

import { CardComponent } from "@/components/card";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function MyList() {
  const [favs, setFavs] = useState<any[]>([]);
  const [watched, setWatched] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favsPage, setFavsPage] = useState(0); // Track page for favorites
  const [watchedPage, setWatchedPage] = useState(0); // Track page for watched animes
  const [favsLoaded, setFavsLoaded] = useState(false); // Track if favorites are loaded
  const [watchedLoaded, setWatchedLoaded] = useState(false); // Track if watched are loaded
  const [noMoreFavs, setNoMoreFavs] = useState(false);
  const [noMoreWatched, setNoMoreWatched] = useState(false);

  // Fetch data for multiple IDs from the API route
  const fetchMultipleData = async (ids: string[]) => {
    try {
      const res = await fetch(`/api/getMultiple?ids=${ids.join(",")}`);
      if (!res.ok) {
        return [];
      }
      const data = await res.json();
      return data || [];
    } catch (error) {
      return [];
    }
  };

  const loadMore = async (type: "fav" | "watched") => {
    setLoading(true);
    const idsKey = type === "fav" ? "likedAnimes" : "watching";
    const page = type === "fav" ? favsPage : watchedPage;

    const idsStr = localStorage.getItem(idsKey);
    if (!idsStr) {
      setLoading(false);
      return;
    }

    const idsArray =
      type === "fav" ? idsStr.split(",") : Object.keys(JSON.parse(idsStr));
    const pageSize = 5;
    const pageIds = idsArray.slice(page * pageSize, (page + 1) * pageSize);
    console.log(pageIds);

    if (pageIds.length == 0) {
      setLoading(false);
      return type == "fav" ? setNoMoreFavs(true) : setNoMoreWatched(true);
    }

    const newData = await fetchMultipleData(pageIds);

    // Append the new data to the existing data
    if (type === "fav") {
      setFavs((prevFavs) => [...prevFavs, ...newData]);
      setFavsPage(page + 1); // Move to the next page for favs
      setFavsLoaded(true); // Mark favorites as loaded
    } else {
      setWatched((prevWatched) => [...prevWatched, ...newData]);
      setWatchedPage(page + 1); // Move to the next page for watched
      setWatchedLoaded(true); // Mark watched as loaded
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const favIds = localStorage.getItem("likedAnimes");
      const watchedIdsStr = localStorage.getItem("watching");

      if (favIds) {
        await loadMore("fav");
      }

      if (watchedIdsStr) {
        await loadMore("watched");
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <>
      {/* Favorites Section */}
      {favs.length > 0 ? (
        <>
          <h1 className="mb-10 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            Favorites
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {favs.map((item: any) => (
              <div key={item.id}>
                <CardComponent data={item} />
              </div>
            ))}
          </div>
          {!noMoreFavs ? (
            <button
              onClick={() => loadMore("fav")}
              className="mt-4 text-xl font-semibold text-blue-600"
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More Favorites"}
            </button>
          ) : (
            <button
              className="mt-4 text-xl font-semibold text-blue-600/50"
              disabled={true}
            >
              No More Animes to Load
            </button>
          )}
        </>
      ) : favsLoaded && !loading ? (
        <h1 className="text-xl font-bold text-gray-600 mt-5">
          No Liked Animes
        </h1>
      ) : null}

      {/* Watched Section */}
      {watched.length > 0 ? (
        <>
          <h1 className="mb-10 text-4xl font-extrabold leading-none tracking-tight mt-10 text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            Continue Watching
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {watched.map((item: any) => (
              <div key={item.id}>
                <CardComponent data={item} />
              </div>
            ))}
          </div>
          {!noMoreWatched ? (
            <button
              onClick={() => loadMore("watched")}
              className="mt-4 text-xl font-semibold text-blue-600"
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More Watched Animes"}
            </button>
          ) : (
            <button
              className="mt-4 text-xl font-semibold text-blue-600/50"
              disabled={true}
            >
              No More Animes to Load
            </button>
          )}
        </>
      ) : watchedLoaded && !loading ? (
        <h1 className="text-xl font-bold text-gray-600 mt-5">
          No Watched Animes
        </h1>
      ) : null}

      {loading && (
        <div className="w-full flex flex-col items-center justify-center">
          <Image src="/loading.gif" width={500} height={500} alt="Loading..." />
        </div>
      )}
    </>
  );
}
