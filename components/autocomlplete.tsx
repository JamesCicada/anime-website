"use client";
import { FC, useEffect, useState } from "react";
import {
  Autocomplete,
  AutocompleteItem,
  AutocompleteSection,
  Avatar,
} from "@nextui-org/react";
import { SearchIcon } from "./icons";
import { useRouter } from "next/navigation";
import { XIcon } from "lucide-react";
interface AutoCompleteProps {
  CallCloseMenu: () => void; // Define the prop type
}
export const AutoComplete: FC<AutoCompleteProps> = ({ CallCloseMenu }) => {
  const [options, setOptions] = useState<any>();
  const [query, setQuery] = useState<string>();
  useEffect(() => {
    if (!query || query.length < 3) return;
    function getAnimes() {
      fetch(`/api/search?keywords=${query}`).then(async (res: any) => {
        const resData = await res.json();
        setOptions(resData.data.results);
      });
    }
    getAnimes();
  }, [query]);
  const router = useRouter();
  function Watch(id: any) {
    CallCloseMenu();
    router.push(`/watch/${id}`);
  }
  return (
    <Autocomplete
      onValueChange={setQuery}
      onClear={() => setQuery("")}
      defaultInputValue={query}
      items={options}
      className="max-w-x"
      placeholder="Search..."
      isClearable
      clearIcon={<XIcon />}
      onSelectionChange={Watch}
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
    >
      <AutocompleteSection>
        {options &&
          options.map((item: any, index: number) => (
            <AutocompleteItem
              key={item.id}
              startContent={
                <Avatar
                  name={
                    item.title[`english`] ||
                    item.title[`romaji`] ||
                    item.title[`native`] || item.title
                  }
                  src={`${item.image}`}
                />
              }
            >
              <p className="text-tiny">
                {item.title[`english`] ||
                  item.title[`romaji`] ||
                  item.title[`native`] || item.title}
              </p>
            </AutocompleteItem>
          ))}
      </AutocompleteSection>
    </Autocomplete>
  );
};
