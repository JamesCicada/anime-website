"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CardComponent } from "@/components/card";
import {
  Button,
  Input,
  Pagination,
  Select,
  SelectItem,
  Tooltip,
} from "@nextui-org/react";
import { FilterX, SearchIcon } from "lucide-react";
import Image from "next/image";

export default function Popular() {
  const router = useRouter();
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPages, setMaxPages] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<any>("");
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedSort, setSelectedSort] = useState("POPULARITY_DESC");

  const genres = [
    "Action",
    "Adventure",
    "Cars",
    "Comedy",
    "Drama",
    "Fantasy",
    "Horror",
    "Mahou Shoujo",
    "Mecha",
    "Music",
    "Mystery",
    "Psychological",
    "Romance",
    "Sci-Fi",
    "Slice of Life",
    "Sports",
    "Supernatural",
    "Thriller",
  ];

  const seasons = ["WINTER", "SPRING", "SUMMER", "FALL"];
  const years = Array.from(new Array(100), (_, i) =>
    (new Date().getFullYear() - i).toString()
  );
  const statuses = ["RELEASING", "NOT_YET_RELEASED", "FINISHED", "CANCELLED"];
  const sortOptions = [
    "POPULARITY_DESC",
    "POPULARITY",
    "TRENDING_DESC",
    "TRENDING",
    "UPDATED_AT_DESC",
    "UPDATED_AT",
    "START_DATE_DESC",
    "START_DATE",
    "END_DATE_DESC",
    "END_DATE",
    "FAVOURITES_DESC",
    "FAVOURITES",
    "SCORE_DESC",
    "SCORE",
    "TITLE_ROMAJI_DESC",
    "TITLE_ROMAJI",
    "TITLE_ENGLISH_DESC",
    "TITLE_ENGLISH",
    "TITLE_NATIVE_DESC",
    "TITLE_NATIVE",
    "EPISODES_DESC",
    "EPISODES",
    "ID",
    "ID_DESC",
  ];
  const query = useSearchParams();
  // Load search params
  useEffect(() => {
    function updateParams() {
      setSelectedGenres(query?.get("genres") || "");
    }
    updateParams();
  }, []);

  // Initialize state with URL params on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchQuery(params.get("keywords") || "");
    setSelectedGenres(params.get("genres") || selectedGenres);
    setSelectedSeason(params.get("season") || "");
    setSelectedYear(params.get("year") || "");
    setSelectedStatus(params.get("status") || "");
    setSelectedSort(params.get("sort") || "POPULARITY_DESC");
    setCurrentPage(Number(params.get("page")) || 1);
  }, []);

  useEffect(() => {
    setLoading(true);
    async function getPopular() {
      const queryParams = new URLSearchParams();

      if (searchQuery) queryParams.append("keywords", searchQuery);
      if (selectedGenres.length > 0)
        queryParams.append("genres", selectedGenres);
      if (selectedSeason) queryParams.append("season", selectedSeason);
      if (selectedYear) queryParams.append("year", selectedYear);
      if (selectedStatus) queryParams.append("status", selectedStatus);
      if (selectedSort.length > 0) queryParams.append("sort", selectedSort);
      queryParams.append("page", String(currentPage));

      const res = await fetch(`/api/advanced-search?${queryParams.toString()}`);
      const resData = await res.json();
      setAnimes(resData.data.results);
      setMaxPages(resData.data.totalPages);
      setLoading(false);
    }

    getPopular();
  }, [
    currentPage,
    searchQuery,
    selectedGenres,
    selectedSeason,
    selectedYear,
    selectedStatus,
    selectedSort,
  ]);
  const clearAll = () => {
    // Reset all state variables
    setSelectedGenres("");
    setSearchQuery("");
    setSelectedSeason("");
    setSelectedYear("");
    setSelectedStatus("");
    setSelectedSort("POPULARITY_DESC");
    setCurrentPage(1);

    // Optionally update the URL to remove query parameters
    router.push("/advanced-search");
  };

  return (
    <>
      <div className="flex">
        <Input
          value={searchQuery}
          className="max-w-full"
          onChange={(e) => setSearchQuery(e.target.value)}
          endContent={<SearchIcon />}
          placeholder="Search..."
        />
        <Tooltip
          content="Clear All Filters"
          delay={0}
          closeDelay={0}
          motionProps={{
            variants: {
              exit: {
                opacity: 0,
                transition: {
                  duration: 0.1,
                  ease: "easeIn",
                },
              },
              enter: {
                opacity: 1,
                transition: {
                  duration: 0.15,
                  ease: "easeOut",
                },
              },
            },
          }}
        >
          <Button
            className="ml-2"
            isIconOnly
            onPress={clearAll}
            startContent={<FilterX size={24} />}
          />
        </Tooltip>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6 gap-6 my-4 flex-wrap">
        <Select
          placeholder="Select Genres"
          selectionMode="multiple"
          value={selectedGenres}
          selectedKeys={selectedGenres || []}
          onSelectionChange={(keys: any) => {
            const selected = [...keys].map((k) => k);
            // @ts-ignore
            setSelectedGenres(selected);
          }}
        >
          {genres.map((genre) => (
            <SelectItem key={genre} value={genre}>
              {humanizeText(genre)}
            </SelectItem>
          ))}
        </Select>
        <Select
          placeholder="Select Season"
          value={selectedSeason}
          selectedKeys={selectedSeason || []}
          onSelectionChange={(keys: any) => {
            const selected = [...keys].map((k) => k);
            // @ts-ignore
            setSelectedSeason(selected);
          }}
        >
          {seasons.map((season) => (
            <SelectItem key={season} value={season}>
              {humanizeText(season)}
            </SelectItem>
          ))}
        </Select>
        <Select
          placeholder="Select Year"
          value={selectedYear}
          //@ts-ignore
          selectedKeys={[selectedYear] || []}
          onSelectionChange={(keys: any) => {
            const selected = [...keys].map((k) => k);
            setSelectedYear(selected[0]);
          }}
        >
          {years.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </Select>
        <Select
          placeholder="Select Status"
          value={selectedStatus}
          //@ts-ignore
          selectedKeys={[selectedStatus] || []}
          onSelectionChange={(keys: any) => {
            const selected = [...keys].map((k) => k);
            setSelectedStatus(selected[0]);
          }}
        >
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {humanizeText(status)}
            </SelectItem>
          ))}
        </Select>
        <Select
          placeholder="Select Sort Options"
          selectionMode="single"
          value={selectedSort}
          //@ts-ignore
          selectedKeys={[selectedSort] || []}
          onSelectionChange={(keys: any) => {
            const selected = [...keys].map((k) => k);
            console.log(selected);

            // @ts-ignore
            setSelectedSort(selected);
          }}
        >
          {sortOptions.map((sort) => (
            <SelectItem key={sort} value={sort}>
              {humanizeText(sort)}
            </SelectItem>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-5 my-6">
        <Pagination
          total={maxPages}
          color="secondary"
          page={currentPage}
          loop
          showControls
          onChange={setCurrentPage}
        />
      </div>
      {loading ? (
        <div className="w-full flex flex-col items-center justify-center">
          <Image src="/loading.gif" width={500} height={500} alt="Loading..." />
          <h1 className="text-4xl font-extrabold">Loading...</h1>
        </div>
      ) : (
        <>
          {animes.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {animes.map((item, index) => (
                <CardComponent key={index} data={item} />
              ))}
            </div>
          ) : (
            <h1 className="text-4xl font-extrabold text-red-500">
              No results! Try Different filters
            </h1>
          )}
        </>
      )}
      <div className="flex flex-col gap-5 my-6">
        <Pagination
          total={maxPages}
          color="secondary"
          page={currentPage}
          loop
          showControls
          onChange={setCurrentPage}
        />
      </div>
    </>
  );
}
function humanizeText(text: string) {
  return text
    .toLowerCase() // Convert the text to lowercase
    .replace(/_/g, " ") // Replace underscores with spaces
    .replace(/\b(\w)/g, (match: any) => match.toUpperCase()) // Capitalize the first letter of each word
    .replace("Desc", "Descending") // Optionally handle specific abbreviations
    .replace("Romaji", "Romaji Title") // Custom replacements if needed
    .replace("English", "English Title") // Custom replacements if needed
    .replace("Native", "Native Title"); // Custom replacements if needed
}
