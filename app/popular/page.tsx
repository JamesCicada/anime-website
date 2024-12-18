"use client";
import { useEffect, useState } from "react";
import { CardComponent } from "@/components/card";

export default function Popular() {
  const [animes, setAnimes] = useState([]);
  useEffect(() => {
    function getPopular() {
      fetch("/api/popular").then(async (res) => {
        const resData = await res.json();
        setAnimes(resData.data.results);
      });
    }
    getPopular();
  }, []);
  return (
    <>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {animes &&
        animes.length > 0 &&
        animes.map((item: any) => <CardComponent data={item} />)}
    </div>
    </>
  );
}
