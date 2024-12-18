import type { Metadata, ResolvingMetadata } from "next";
import Watch from "./page";
type Props = {
  params: Promise<{ animeId: string }>;
};
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const id = (await params).animeId;

  // fetch data
  const res = await fetch(
    `https://anime.jcwatch.com/api/getData?id=${id}&provider=gogoanime`
  ).then((res) => res.json());
  const anime = res.data;

  const title =
    anime.title["english"] ||
    anime.title["romaji"] ||
    anime.title["native"] ||
    anime.title;
  const description = `Watch ${title} in high quality and without any annoying ads.`;

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: `https://anime.jcwatch.com/watch/${id}`,
      type: "video.episode",
      images: [anime?.cover || anime?.image],
      siteName: "JC-Anime",
    },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Watch />
    </>
  );
}
