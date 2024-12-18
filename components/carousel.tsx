"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@nextui-org/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMediaQuery } from "@chakra-ui/react";
import Link from "next/link";

export default function Carousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featured, setFeatured] = useState([{}]);
  useEffect(() => {
    function getPopular() {
      fetch("/api/trending").then(async (res) => {
        if(String(res.status).startsWith('4')) return;// console.log('error fetching data', res.status);
        const resData = await res.json();
        setFeatured(resData.data.results.filter((item: any) => item.title && item.title[`english`]).slice(0, 6));
      });
    }
    getPopular();
  }, []);
  const nextSlide = useCallback(() => {
    if (featured.length < 1) return;
    setCurrentSlide((prev) => (prev + 1) % featured.length);
  }, [featured]);

  const prevSlide = useCallback(() => {
    if (featured.length < 1) return;
    setCurrentSlide((prev) => (prev - 1 + featured.length) % featured.length);
  }, [featured]);
  useEffect(() => {
    const timer = setInterval(nextSlide, 10000); // Auto-advance every 10 seconds
    return () => clearInterval(timer);
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: nextSlide,
    onSwipedRight: prevSlide,
    trackMouse: true,
  });

  const router = useRouter();
  function watchNow(id: any) {
    router.push(`/watch/${id}`);
  }

  return (
    <>
      {featured.length > 1 && (
        <div className=" rounded-2xl bg-gradient-to-br from-gray-400 dark:from-gray-900 via-purple-500 dark:via-purple-900 to-gray-400 dark:to-gray-900 text-gray-100">
          <main className="container mx-auto px-2 pt-2 pb-2">
            {/* Carousel */}
            <section className="relative" {...handlers}>
              <div className="overflow-hidden rounded-xl">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {featured.map((anime: any, index: any) => (
                    <Link className="w-full flex-shrink-0" href={`/watch/${anime.id}`}>
                    <div key={index} className="w-full flex-shrink-0">
                      <div className="relative md:h-[400px] h-[300px]">
                        <Image
                          src={anime.cover}
                          alt={anime.title["english"] || 'Anime Image'}
                          width={1920}
                          height={400}
                          className="w-full h-full object-cover rounded-2xl"
                          priority
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-950 to-transparent  p-6">
                          <h2 className="text-3xl sm:text-xl font-bold mb-2 line-clamp-1 w-fit text-ellipsis">
                            {anime.title["english"]}
                          </h2>
                          <p className="mb-4 stroke-1 stroke-slate-950">
                            Episodes: {anime.totalEpisodes}
                          </p>
                        </div>
                      </div>
                    </div>
                    </Link>
                  ))}
                </div>
              </div>
              <Button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/50 hover:bg-white/75 dark:bg-black/50 dark:hover:bg-black/75 dark:text-white rounded-full p-2  hidden md:flex"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/50 hover:bg-white/75 dark:bg-black/50 dar:hover:bg-black/75 dark:text-white rounded-full p-2  hidden md:flex"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {featured &&
                  featured.map((_: any, index: any) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full ${
                        currentSlide === index ? "bg-white" : "bg-white/50"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
              </div>
            </section>
          </main>
        </div>
      )}
    </>
  );
}
