"use client";
import { useEffect, useState } from "react";
import { CardComponent } from "@/components/card";
import { Image } from "@nextui-org/react";
import InfiniteScroll from "react-infinite-scroll-component";

export default function Popular() {
  const [animes, setAnimes] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchAnimes = async () => {
    try {
      const res = await fetch(`/api/trending?page=${page}`);
      const resData = await res.json();
      const newAnimes = resData.data.results;

      if (newAnimes.length === 0) {
        setHasMore(false);
      } else {
        setAnimes((prevAnimes) => [...prevAnimes, ...newAnimes]);
        setPage((prevPage) => prevPage + 1);
      }
    } catch (error) {
      console.error("Error fetching animes:", error);
    }
  };

  useEffect(() => {
    fetchAnimes();
  }, []);
  useEffect(() => {
    function getPopular() {
      fetch("/api/trending").then(async (res) => {
        const resData = await res.json();
        setAnimes(resData.data.results);
      });
    }
    getPopular();
  }, []);
  return (
    <>
      <h1 className="mb-10 pt-5 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
        Trending Animes
      </h1>
      <InfiniteScroll
        dataLength={animes.length}
        next={fetchAnimes}
        hasMore={hasMore}
        loader={
          <Image src="/loading.gif" width={500} height={500} alt="Loading..." />
        }
        endMessage={
          <p style={{ textAlign: "center" }}>
            <b>Yay! You have seen it all</b>
          </p>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {animes.map((item, i) => (
            <CardComponent data={item} key={i} />
          ))}
        </div>
      </InfiniteScroll>
    </>
  );
}
