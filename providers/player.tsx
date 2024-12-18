"use client";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { ReactElement, useEffect, useRef, useState } from "react";
import ISO6391 from "iso-639-1";
import {
  MediaPlayer,
  MediaProvider,
  Poster,
  Thumbnail,
  Track,
  useVideoQualityOptions,
  type MediaPlayerInstance,
} from "@vidstack/react";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";
import { Menu } from "@vidstack/react";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SettingsMenuIcon,
} from "@vidstack/react/icons";
import { Image } from "@nextui-org/react";
export default function Player(url: any) {
  const volume =
    (typeof window !== undefined && localStorage.getItem("volume")) || "0.5";
  let player = useRef<MediaPlayerInstance>(null);
  if (!url || url?.url.streamlink.error !== undefined)
    return (
      <>
        <div className="relative flex items-center justify-center w-full">
          <Image
            className="object-cover w-full h-full"
            src="https://i.pinimg.com/736x/04/7d/de/047dde068655df3ec6110436cc674b95.jpg"
            alt="Error"
          />
          <div className="absolute z-50 text-black top-0 my-4 w-fit md:text-2xl text-3xl font-bold p-2 rounded-xl text-center">
            <h1 className="">No Video Source Found</h1>
            <p className="">Try again later or change the provider.</p>
          </div>
        </div>
      </>
    );

  let sources =
    url?.url.streamlink?.data.sources.length > 1
      ? url?.url.streamlink?.data.sources.filter(
          (x: any) => x.quality == "default"
        )
      : url?.url.streamlink?.data.sources;
  // console.log(sources);
  console.log(url);

  let subtitles = url?.url.streamlink?.data.subtitles;
  const details = url?.url.animeData;
  const animeId = details.id;
  // Reached Time saving
  const episodeId = url.url.episode;

  // Save currentTime for the specific episode every 30 seconds
  useEffect(() => {
    const saveCurrentTime = () => {
      if (player.current?.currentTime) {
        const currentTime = player.current.currentTime;
        const storedData = JSON.parse(localStorage.getItem("watching") || "{}");

        // Ensure the animeId entry exists
        if (!storedData[animeId]) {
          storedData[animeId] = {
            reached: episodeId,
            episodes: {
              [episodeId]: 0,
            },
          };
        }
        // Save the current time for this episode
        if (currentTime > storedData[animeId].episodes[episodeId]) {
          storedData[animeId].episodes[episodeId] = currentTime || 0;
          localStorage.setItem("watching", JSON.stringify(storedData));
        }
      }
    };

    const interval = setInterval(saveCurrentTime, 5 * 1000); // Updated to 30 seconds
    return () => clearInterval(interval);
  }, [url]);

  // Set the currentTime for the specific episode when the player is loaded
  useEffect(() => {
    if (player.current) {
      const storedData = JSON.parse(localStorage.getItem("watching") || "{}");
      const savedTime = storedData[animeId]?.episodes?.[episodeId];

      if (savedTime !== undefined && player.current.currentTime < savedTime) {
        player.current.currentTime = savedTime;
      }
    }
  }, [url]);
  function QualitySubmenu() {
    const options = useVideoQualityOptions(),
      currentQuality = options.selectedQuality?.height,
      hint =
        options.selectedValue !== "auto" && currentQuality
          ? `${currentQuality}p`
          : `Auto${currentQuality ? ` (${currentQuality}p)` : ""}`;

    return (
      <Menu.Root>
        <SubmenuButton
          label="Quality"
          hint={hint}
          disabled={options.disabled}
          // @ts-ignore
          icon={SettingsMenuIcon}
        />
        <Menu.Content className="vds-menu-items">
          <Menu.RadioGroup
            className="vds-radio-group"
            value={options.selectedValue}
          >
            {options.map(({ label, value, bitrateText, select }) => (
              <Menu.Radio
                className="vds-radio"
                value={value}
                onSelect={select}
                key={value}
              >
                <CheckIcon className="vds-icon" />
                <span className="vds-radio-label">{label}</span>
                {bitrateText ? (
                  <span className="vds-radio-hint">{bitrateText}</span>
                ) : null}
              </Menu.Radio>
            ))}
          </Menu.RadioGroup>
        </Menu.Content>
      </Menu.Root>
    );
  }

  interface SubmenuButtonProps {
    label: string;
    hint: string;
    disabled?: boolean;
    icon: ReactElement;
  }

  function SubmenuButton({
    label,
    hint,
    icon: Icon,
    disabled,
  }: SubmenuButtonProps) {
    return (
      <Menu.Button className="vds-menu-item" disabled={disabled}>
        <ChevronLeftIcon className="vds-menu-close-icon" />
        {/* @ts-ignore */}
        <Icon className="vds-icon" />
        <span className="vds-menu-item-label">{label}</span>
        <span className="vds-menu-item-hint">{hint}</span>
        <ChevronRightIcon className="vds-menu-open-icon" />
      </Menu.Button>
    );
  }
  return (
    <div className="w-full my-2">
      {sources && (
        <MediaPlayer
          className="w-full aspect-video bg-slate-900 text-white font-sans overflow-hidden rounded-md ring-media-focus data-[focus]:ring-4"
          title={`${
            details.title["english"] ||
            details.title["romaji"] ||
            details.title["native"] ||
            details.title
          } - Ep: ${url.url.episode}`}
          // src={`/api/cors?url=${sources[0].url}`}
          logLevel="silent"
          src={`${process.env.CORS_PROXY || ''}${sources[0].url}`}
          poster={`process.env.CORS_PROXY || ''${details.image}`}
          playsInline
          fullscreenOrientation="landscape"
          volume={Number(volume)}
          streamType="on-demand"
          onVolumeChange={(details) => {
            typeof window !== undefined &&
              localStorage.setItem("volume", `${details.volume}`);
          }}
          ref={player}
        >
          <MediaProvider>
            <Poster className="vds-poster" />
            {subtitles &&
              subtitles
                .filter((sub: any) => sub.lang !== "Thumbnails")
                .map((sub: any, index: any) => (
                  <Track
                    key={index}
                    kind="subtitles"
                    src={`process.env.CORS_PROXY || ''${encodeURIComponent(
                      sub.url
                    )}`}
                    label={sub.lang}
                    lang={ISO6391.getCode(sub.lang)}
                    default={sub.lang == "English"}
                    type="vtt"
                  />
                ))}
          </MediaProvider>

          <DefaultVideoLayout
            thumbnails={
              subtitles &&
              `process.env.CORS_PROXY || ''${encodeURIComponent(
                subtitles.find((sub: any) => sub.lang === "Thumbnails")?.url
              )}`
            }
            download={url?.url.streamlink?.data?.download}
            icons={defaultLayoutIcons}
            slots={{
              beforeSettingsMenuStartItems: <QualitySubmenu />,
            }}
          ></DefaultVideoLayout>
        </MediaPlayer>
      )}
    </div>
  );
}
