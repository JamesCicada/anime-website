"use client";

import { Button, Card, CardFooter, CardHeader } from "@nextui-org/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { useMediaQuery } from "@chakra-ui/react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { HeartFilledIcon, HeartIcon } from "@/components/icons";
interface CardData {
  image: string;
  title: any;
  id: string;
  totalEpisodes: number;
  episodes?: number;
  genres?: string[];
}

interface CardComponentProps {
  data: CardData;
}

export const CardComponent = ({ data }: CardComponentProps) => {
  const [isLiked, setIsLiked] = useState(false); // State to track if the anime is liked
  const [init, setInit] = useState(false);
  const [particlesEnabled, setParticlesEnabled] = useState(false);
  const isWideScreen = useMediaQuery("(min-width: 1000px)");
  const isMidScreen = useMediaQuery("(min-width: 800px)");
  const { image, title, id, totalEpisodes, episodes, genres } = data;
  const router = useRouter();
  const maxLetters = isMidScreen ? 7 : 5;
  const validTitle = title.english || title.romaji || title.native || title;
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine); // Load slim version of particles to reduce bundle size
    }).then(() => {
      setInit(true);
    });
  }, []);

  const checkIfLiked = () => {
    const likedAnimes = localStorage.getItem("likedAnimes");
    if (likedAnimes) {
      return likedAnimes.split(",").includes(id);
    }
    return false;
  };

  useEffect(() => {
    setIsLiked(checkIfLiked());
  }, [id]);

  const watchNow = useCallback(() => {
    router.push(`/watch/${id}`);
  }, [router, id]);

  const likeClicked = () => {
    const likedAnimes = localStorage.getItem("likedAnimes");
    let likedArray = likedAnimes ? likedAnimes.split(",") : [];

    const alreadyLiked = likedArray.includes(id);
    if (!alreadyLiked) {
      setParticlesEnabled(true);
      setTimeout(() => setParticlesEnabled(false), 1000); // Enable particles for 1 second
    }
    if (alreadyLiked) {
      likedArray = likedArray.filter((animeId) => animeId !== id); // Remove anime from liked list
    } else {
      likedArray.push(id); // Add anime to liked list
    }

    localStorage.setItem("likedAnimes", likedArray.join(","));
    setIsLiked(!alreadyLiked);
  };

  return (
    <Card
      className="py-4 cursor-pointer shadow-1"
      isFooterBlurred
      isPressable
      onPress={watchNow}
    >
      <CardHeader className="pb-0 pt-2 px-3 flex-col items-start">
        <small className="text-default-500 text-tiny">
          {totalEpisodes || episodes} Episodes
        </small>
        <h4 className="font-bold text-large line-clamp-1 text-start">
          {validTitle}
        </h4>
        <Button
          isIconOnly
          className="flex bg-transparent absolute right-2 top-2 z-10 items-center justify-center"
          onPress={(e) => {
            likeClicked(); // Trigger the like action
          }}
          name={`Add ${validTitle} To Favorite`}
        >
          <div className="flex items-center justify-center w-full h-full relative">
            <HeartIcon
              className={`w-7 h-7 transition-all duration-300 ${
                isLiked ? "text-red-500" : "text-gray-300"
              }`}
              style={{
                color: isLiked ? "#FF0000" : "#DDDDDD",
                fill: isLiked ? "#FF0000" : "#DDDDDD",
              }}
            />
            {particlesEnabled && init && (
              <Particles
                id="tsparticles"
                className="absolute inset-0 pointer-events-none"
                options={{
                  fullScreen: false, // Disable fullscreen
                  particles: {
                    number: {
                      value: 30, // Reduce number of particles for burst effect
                    },
                    size: {
                      value: 2, // Particle size

                      //@ts-ignore
                      random: { enable: true, minimumValue: 2 },
                    },
                    move: {
                      enable: true,
                      speed: 4, // Speed up particles for quick burst
                      direction: "none",
                      outModes: {
                        default: "destroy", // Particles disappear after moving
                      },
                    },
                    color: {
                      value: "#FF0000", // Same color as heart icon
                    },
                    opacity: {
                      value: 1,
                      animation: {
                        enable: true,
                        speed: 1,
                        //@ts-ignore
                        minimumValue: 0, // Fade out particles
                      },
                    },
                    shape: {
                      type: "circle",
                    },
                  },
                }}
              />
            )}
          </div>
        </Button>
      </CardHeader>

      <Image
        alt={validTitle}
        className="object-cover rounded-xl h-[270px] md:h-[370px] px-2 pt-2"
        src={image}
        loading="lazy"
        fetchPriority="auto"
        width={270}
        height={350}
      />

      {genres && genres.length > 0 && (
        <CardFooter className="bg-[#18181b] bg-opacity-75 hidden md:flex before:bg-white/10 border-white/20 border-1 overflow-hidden absolute before:rounded-xl rounded-large bottom-1 w-[calc(100%_-_8px)] shadow-small ml-1 z-10">
          {genres.slice(0, 3).map((g, index) => (
            <p
              key={index}
              className="sm:text-tiny text-sm font-semibold mx-auto text-ellipsis"
            >
              {g.length > maxLetters ? `${g.slice(0, maxLetters)}...` : g}
            </p>
          ))}
        </CardFooter>
      )}
    </Card>
  );
};
