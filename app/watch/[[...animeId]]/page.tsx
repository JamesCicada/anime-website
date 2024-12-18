"use client";
import { useEffect, useRef, useState } from "react";
import Player from "@/providers/player";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Skeleton,
  Switch,
  useDisclosure,
} from "@nextui-org/react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import Image from "next/image";
import { AudioLines, TextIcon } from "lucide-react";
import { HeartIcon } from "@/components/icons";
import { CardComponent } from "@/components/card";

export default function Watch() {
  const params = useParams<{ animeId: string }>();
  const [isLiked, setIsLiked] = useState(false); // State to track if the anime is liked
  const [init, setInit] = useState(false);
  const [particlesEnabled, setParticlesEnabled] = useState(false);
  const query = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const id = params?.animeId;
  const [provider, setProvider] = useState(
    query?.get("provider") || "gogoanime"
  );
  const [audioMode, setAudioMode] = useState("sub");
  const [animeData, setAnimeData] = useState<any>();
  const [episode, setEpisode] = useState<any>(Number(query?.get("ep")) || 1);
  const [streamlink, setStreamlink] = useState("");
  const [textOpen, setTextOpen] = useState(false);
  const [reached, setReached] = useState<Number>(0);
  const [selectedRange, setSelectedRange] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const playerRef = useRef<HTMLDivElement>();
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine); // Load slim version of particles to reduce bundle size
    }).then(() => {
      setInit(true);
    });
  }, []);

  const checkIfLiked = () => {
    const likedAnimes =
      typeof window !== undefined && localStorage.getItem("likedAnimes");
    if (likedAnimes) {
      return likedAnimes.split(",").includes(animeData?.id || params?.animeId);
    }
    return false;
  };
  useEffect(() => {
    setIsLiked(checkIfLiked());
  }, [animeData]);
  // useEffect: Get anime data based on provider.
  // Fetch anime data
  useEffect(() => {
    async function fetchAnimeData() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(
          `/api/getData?id=${params?.animeId}&provider=${provider}`
        );
        if (res.ok) {
          const data = await res.json();
          setAnimeData(data.data);
        } else {
          const fallbackRes = await fetch(
            `/api/getData?id=${params?.animeId}&provider=zoro`
          );
          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            setAnimeData(data.data);
            setProvider("zoro");
          } else {
            throw new Error("Failed to fetch data");
          }
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchAnimeData();
  }, [params?.animeId, provider]);
  // useEffect: Request stream link from server.
  useEffect(() => {
    async function getStreamLink() {
      if (!animeData) return;
      try {
        const res = await fetch(
          `/api/getStream?episodeId=${
            animeData.episodes[episode - 1]?.id
          }&audio=${audioMode}&provider=${provider}`
        );
        if (res.ok) {
          const resData = await res.json();
          setStreamlink(resData);
        } else {
          // Retry with fallback provider if gogoanime fails
          const fallbackRes = await fetch(
            `/api/getStream?episodeId=${
              animeData.episodes[episode - 1]?.id
            }&audio=${audioMode}&provider=zoro`
          );
          if (fallbackRes.ok) {
            const resData = await fallbackRes.json();
            setStreamlink(resData);
            setProvider("zoro"); // Update provider to zoro on fallback
          }
        }
      } catch (error) {
        console.error("Failed to fetch stream link:", error);
      }
    }
    getStreamLink();
  }, [episode, animeData, audioMode, provider]);
  // useEffect: Update the window title.
  useEffect(() => {
    if (animeData?.title) {
      document.title = `${
        animeData.title["english"] ||
        animeData.title["romaji"] ||
        animeData.title["native"] ||
        ""
      } - Episode ${episode}`;
    }
  }, [animeData, episode]);
  const router = useRouter();
  const pathname = usePathname();
  // useEffect: Update the url to include current episode.
  useEffect(() => {
    if (animeData?.episodes.length > 1) {
      router.push(pathname + "?" + `ep=${episode}`);
    }
  }, [episode]);
  // useEffect: Store and Restore Last watched Episode.
  useEffect(() => {
    if (!params?.animeId) return;
    // Primitive way to store Data (Too lazy to implement DB)

    // Retrieve the current data from localStorage
    let currentData = localStorage.getItem("watching");

    // If there's no existing data, initialize it as an empty object
    if (!currentData) {
      currentData = "{}";
    }

    // Parse the JSON data from localStorage
    const currentJson = JSON.parse(currentData);

    // Assume 'animeId' is a unique identifier for the current anime and 'episode' is the current episode number
    const animeId = params?.animeId; // Replace this with your actual anime identifier logic

    // Get the stored episode for this anime, if any
    const storedEpisode = currentJson[animeId]?.episode || 0;

    // Check if the current episode is bigger than the stored one
    if (episode > storedEpisode) {
      // Update the JSON object with the current episode for the current anime
      currentJson[animeId] = {
        episode: episode,
        episodes: { [episode]: 0 },
      };
      // Convert the updated JSON object back to a string
      const updatedData = JSON.stringify(currentJson);

      // Save the updated string back to localStorage
      localStorage.setItem("watching", updatedData);
    } else {
      if (episode == storedEpisode) return;
      // If the current episode is not bigger, update the reached state
      setReached(storedEpisode);
      onOpen();
    }
  }, [episode, animeData]);
  // useEffect: Update the url to include provider
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    function updateSearchParam({
      key,
      value,
    }: {
      key: string;
      value: string;
    }): string {
      const params = new URLSearchParams(searchParams!);
      if (value) {
        // set the search parameter if value is not empty
        params.set(key, value);
      } else {
        params.delete(key);
      }
      return `${pathname}?${params.toString()}`;
    }
    function updateSearchParamForCurrentPage({
      key,
      value,
    }: {
      key: string;
      value: string;
    }) {
      const newUrl = updateSearchParam({ key, value });
      replace(newUrl);
    }
    if (animeData?.episodes.length > 1) {
      updateSearchParamForCurrentPage({
        key: "provider",
        value: provider,
      });
    }
  }, [provider]);
  // Function: Add or Remove anime from liked (my-list)
  const likeClicked = () => {
    const likedAnimes = localStorage.getItem("likedAnimes");
    let likedArray = likedAnimes ? likedAnimes.split(",") : [];
    const alreadyLiked = likedArray.includes(animeData.id);

    if (!alreadyLiked) {
      setParticlesEnabled(true);
      setTimeout(() => setParticlesEnabled(false), 1000); // Enable particles for 1 second
    }
    if (alreadyLiked) {
      likedArray = likedArray.filter((animeId) => animeId !== animeData?.id); // Remove anime from liked list
    } else {
      likedArray.push(animeData.id); // Add anime to liked list
    }
    localStorage.setItem("likedAnimes", likedArray.join(","));
    setIsLiked(!alreadyLiked);
  };
  return (
    <>
      {loading ? (
        <Skeleton className="w-full h-[300px] rounded-xl mx-2" />
      ) : error ? (
        <div className="text-center py-4 text-red-500">
          Failed to load anime data. Please try again later.
        </div>
      ) : (
        <div>
          {animeData && animeData?.cover.length > 0 ? (
            <>
              <div className="relative rounded-xl mb-5  max-h-96 overflow-hidden">
                <Image
                  className="object-cover"
                  alt={animeData.title["english"] || animeData.title["romaji"] || animeData.title[`native`] + "'s Cover"}
                  src={animeData?.cover}
                  width={1920}
                  height={500}
                  priority={true}
                />
                <div className="absolute top-0 left-0 w-full h-full flex items-start justify-start mx-4 my-2">
                  <h1 className="text-white w-fit md:text-9xl text-xl font-bold p-2 rounded-xl backdrop-blur-sm backdrop-brightness-90 backdrop-hue-rotate-30 line-clamp-1 overflow-hidden text-clip">
                    {animeData.title["romaji"] || animeData.title[`native`]}
                  </h1>
                </div>
              </div>
            </>
          ) : (
            <Skeleton className="w-full h-[300px] rounded-xl mx-2" />
          )}
          {streamlink && streamlink !== "" ? (
            // @ts-ignore
            <div ref={playerRef}>
              {animeData.episodes.length > 100 && (
                <>
                  <h3 className="text-tiny my-2 mx-2">Episode Selectors</h3>
                  <div className="flex w-full flex-wrap md:flex-nowrap gap-4 my-2 mx-1">
                    {/* Range Select */}
                    <Select
                      startContent={
                        <p>
                          {selectedRange?.start}-{selectedRange?.end}
                        </p>
                      }
                      selectionMode="single"
                      variant="bordered"
                      className="max-w-52"
                      onSelectionChange={(range: any) => {
                        const [start, end] = range.currentKey
                          .split("-")
                          .map(Number);
                        setSelectedRange({ start, end });
                      }}
                    >
                      {[
                        ...Array(Math.ceil(animeData.episodes.length / 100)),
                      ].map((_, index) => {
                        const start = index * 100 + 1;
                        const end = Math.min(
                          (index + 1) * 100,
                          animeData.episodes.length
                        );
                        return (
                          <SelectItem key={`${start}-${end}`}>
                            {start} - {end}
                          </SelectItem>
                        );
                      })}
                    </Select>

                    {/* Episode Select within Range */}
                    {selectedRange && (
                      <Select
                        startContent={<p>{episode}</p>}
                        selectionMode="single"
                        variant="bordered"
                        className="max-w-52"
                        onSelectionChange={(keys: any) =>
                          setEpisode(Number(keys.currentKey))
                        }
                      >
                        {[
                          ...Array(selectedRange.end - selectedRange.start + 1),
                        ].map((_, i) => {
                          const episodeNumber = selectedRange.start + i;
                          return (
                            <SelectItem key={episodeNumber}>
                              Episode {episodeNumber}
                            </SelectItem>
                          );
                        })}
                      </Select>
                    )}
                  </div>
                </>
              )}
              {animeData.episodes.length > 1 &&
                animeData.episodes.length < 100 && (
                  <Select
                    startContent={<p>{episode}</p>}
                    selectionMode="single"
                    variant="bordered"
                    className="max-w-52"
                    onSelectionChange={(keys: any) =>
                      setEpisode(Number(keys.currentKey))
                    }
                  >
                    {[...Array(animeData.episodes.length)].map((_, i) => {
                      return (
                        <SelectItem key={i + 1}>Episode {i + 1}</SelectItem>
                      );
                    })}
                  </Select>
                )}
              <Modal
                backdrop="blur"
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                radius="lg"
                classNames={{
                  body: "py-6",
                  backdrop: "bg-[#292f46]/50 backdrop-opacity-40",
                  base: "border-[#292f46] bg-[#19172c] dark:bg-[#19172c] text-[#a8b0d3]",
                  header: "border-b-[1px] border-[#292f46]",
                  footer: "border-t-[1px] border-[#292f46]",
                  closeButton: "hover:bg-white/5 active:bg-white/10",
                }}
              >
                <ModalContent>
                  {(onClose) => (
                    <>
                      <ModalHeader className="flex flex-col gap-1">
                        Continue where you left?
                      </ModalHeader>
                      <ModalBody>
                        <p>
                          You were watching{" "}
                          <strong>Episode: {Number(reached)}</strong> Do you
                          wish to continue from there?
                        </p>
                      </ModalBody>
                      <ModalFooter>
                        <Button
                          color="danger"
                          variant="light"
                          onPress={onClose}
                        >
                          Close
                        </Button>
                        <Button
                          className="bg-[#6f4ef2] shadow-lg shadow-indigo-500/20"
                          onPress={() => {
                            onClose();
                            setEpisode(reached);
                          }}
                        >
                          Go To Episode {Number(reached)}
                        </Button>
                      </ModalFooter>
                    </>
                  )}
                </ModalContent>
              </Modal>
              <Player url={{ streamlink, animeData, episode }} />
              <p className="text-gray-500 ml-2">
                {`Episode ${episode}: ${
                  animeData.episodes[`${episode - 1}`].title
                }`}
              </p>
              <Switch
                defaultSelected
                size="lg"
                color="success"
                onValueChange={(isSelected: boolean) => {
                  isSelected ? setAudioMode("sub") : setAudioMode("dub");
                }}
                startContent={<AudioLines />}
                endContent={<TextIcon />}
              >
                <p className="text-small text-default-500">
                  Current Mode: {audioMode}
                </p>
              </Switch>
              {isLiked !== null && (
                <Button
                  variant="faded"
                  startContent={
                    <div>
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
                  }
                  className="flex bg-transparent my-3 z-10 items-center justify-center"
                  onPress={(e) => {
                    likeClicked(); // Trigger the like action
                  }}
                  name={`Add ${animeData.id} To Favorite`}
                >
                  Add to My-List
                </Button>
              )}
              <RadioGroup
                defaultValue={provider}
                onChange={(v) => setProvider(v.target.value)}
                onValueChange={(v) => setProvider(v)}
                label="Select Server"
              >
                <Radio value="zoro">Zoro</Radio>
                <Radio value="gogoanime">GogoAnime</Radio>
              </RadioGroup>
            </div>
          ) : (
            <div>
              <div className="flex w-full flex-wrap md:flex-nowrap gap-4 my-2 mx-1">
                <Skeleton className="w-[120px] h-[40px] rounded-xl" />
                <Skeleton className="w-[208px] h-[40px] rounded-xl" />
              </div>
              <Skeleton className="w-full h-52 rounded-xl" />
            </div>
          )}
          {animeData && animeData?.title && (
            <>
              <h1 className="mx-2 pt-3 mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
                {animeData.title[`romaji`]}
              </h1>
              <div className="flex mx-2 py-3">
                <Image
                  loading="eager"
                  className="hidden lg:flex rounded-xl object-contain"
                  src={animeData.image}
                  width={460}
                  height={640}
                  alt={`${animeData.title["romaji"]} Poster`}
                />
                <dl className="ml-4 max-w-md text-gray-900 divide-y divide-gray-200 dark:text-white dark:divide-gray-700">
                  <div className="flex flex-col pb-3">
                    <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                      Release Date
                    </dt>
                    <dd className="text-lg font-semibold">
                      {animeData.startDate["year"]} /{" "}
                      {String(animeData.startDate["month"]).padStart(2, "0")} /{" "}
                      {String(animeData.startDate["day"]).padStart(2, "0")}
                    </dd>
                  </div>
                  <div className="flex flex-col py-3">
                    <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                      Status
                    </dt>
                    <dd className="text-lg font-semibold">
                      {animeData.status}
                    </dd>
                  </div>
                  {animeData.status == "Ongoing" && (
                    <div className="flex flex-col py-3">
                      <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                        Airing Episode
                      </dt>
                      <dd className="text-lg font-semibold">
                        {animeData.episodes.length}
                      </dd>
                    </div>
                  )}
                  <div className="flex flex-col pt-3">
                    <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                      Episodes
                    </dt>
                    <dd className="text-lg font-semibold">
                      {animeData.totalEpisodes}
                    </dd>
                  </div>
                  <div className="flex flex-col pt-3">
                    <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                      Season
                    </dt>
                    <dd className="text-lg font-semibold">
                      {animeData.season}
                    </dd>
                  </div>
                  <div className="flex flex-col pt-3">
                    <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                      Genres
                    </dt>
                    <dd className="text-lg font-semibold">
                      {animeData.genres.join(", ")}
                    </dd>
                  </div>
                  <div className="flex flex-col pt-3">
                    <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                      Studios
                    </dt>
                    <dd className="text-lg font-semibold">
                      {animeData.studios.join(", ")}
                    </dd>
                  </div>
                  <div className="flex flex-col pt-3">
                    <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
                      Description
                    </dt>
                    <dd
                      className={`{"text-lg font-semibold"} ${
                        !textOpen && "line-clamp-4"
                      }`}
                    >
                      {formatText(animeData.description)}
                    </dd>
                    <p
                      className="cursor-pointer text-blue-600"
                      onClick={() => {
                        setTextOpen(!textOpen);
                      }}
                    >
                      {textOpen ? "Show less" : "Show more"}
                    </p>
                  </div>
                </dl>
              </div>
            </>
          )}
          {animeData && animeData?.recommendations && (
            <>
              <h1 className="my-20 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
                Similar Animes
              </h1>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {animeData?.recommendations.map((item: any) => (
                  <CardComponent data={item} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
function formatText(text: string) {
  // Replace the <br> and </br> tags with a newline character for plain text formatting
  // For HTML output, you might want to keep <br> as it is
  text = text.replace(/<i>(.*?)<\/i>/gi, "_$1_");
  return text.replace(/<\/?br\s*\/?>/gi, "\n");
}
