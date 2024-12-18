import "@/styles/globals.css";
import { Metadata, ResolvingMetadata, Viewport } from "next";
import clsx from "clsx";
import { Providers } from "./providers";
import { isBanned } from "@/functions/isBanned";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import Ganalytics from "@/providers/ganalytics";
import { getCountryName } from "@/functions/getCountryName";
import { Image } from "@nextui-org/react";
import sendHeartBeat from "@/functions/heartbeat";
export async function generateMetadata(
  parent: ResolvingMetadata
): Promise<Metadata> {
  const title = "JC-Anime"
  const description = `Your gateway to the world of anime. Start your journey here.`;
  return {
    metadataBase: new URL(`https://anime.jcwatch.com/`),
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      url: `https://anime.jcwatch.com/`,
      type: "website",
      siteName: "JC-Anime",
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  sendHeartBeat()
  const bannedCountries = ["IL"]; // Banned Countries List
  const checkBan = await isBanned();
  const countryName = await getCountryName(checkBan);
  return (
    <html suppressHydrationWarning lang="en">
      <head>
      <meta property="og:logo" content="/icon.png" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2915008989344404"
          crossOrigin="anonymous"
        />
        <meta name="google-adsense-account" content="ca-pub-2915008989344404" />
        <Ganalytics />
      </head>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          {bannedCountries.includes(checkBan) ? (
            <div className="flex justify-center items-center h-screen px-4 sm:px-0">
              <div className="text-center">
                <h1 className="text-xl sm:text-2xl font-bold text-red-600">
                  Access Restricted
                </h1>
                <p className="mt-2 sm:mt-4 text-base sm:text-lg">
                  Unfortunately, JC-Anime is not available in{" "}
                  <span className="font-bold text-red-600">{countryName}</span>.
                </p>
                {checkBan == "IL" && (
                  <div className="flex flex-col items-center justify-center my-5">
                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold my-5 sm:my-10 text-green-600">
                      Free Palestine!
                    </h1>
                    <Image
                      className="border-2 border-slate-50"
                      src="https://flagcdn.com/ps.svg"
                      alt="Palestine Flag"
                      width={400}
                      height={"auto"}
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 70vw, 800px"
                    />
                  </div>
                )}
                <p className="mt-2">
                  If you believe this is a mistake, please{" "}
                  <a
                    className="text-blue-500 underline hover:text-blue-900"
                    href="https://discord.gg/GXu64738nD"
                  >
                    contact support
                  </a>
                  .
                </p>
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col h-screen">
              <Navbar />
              <main className="container mx-auto pt-16 px-6 flex-grow">
                {children}
              </main>
              <div className="bg-gray-100 dark:bg-gray-800/50 p-4 mx-6 w-fit self-center justify-self-center rounded-lg text-sm text-center">
                <p className="mb-2 font-semibold">Legal Disclaimer</p>
                <p>
                  JC-Anime acts as a search engine and does not host any files
                  on its server. We provide links to media content hosted by
                  third-party services, over which we have no control.
                </p>
              </div>
              <footer className="mt-6 text-center py-4">
                <p className="text-sm sm:text-base">
                  &copy; JC-Anime. All rights reserved.
                </p>
              </footer>
            </div>
          )}
        </Providers>
      </body>
    </html>
  );
}
