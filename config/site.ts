export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "JC-Anime",
  description: "Stream and discover your favorite anime series and movies.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Trending",
      href: "/trending",
    },
    {
      label: "Popular",
      href: "/popular",
    },
    {
      label: "Search",
      href: "/advanced-search",
    },
    {
      label: "My List",
      href: "/my-list",
    },
  ],
  navMenuItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Trending",
      href: "/trending",
    },
    {
      label: "Popular",
      href: "/popular",
    },
    {
      label: "Search",
      href: "/advanced-search",
    },
    {
      label: "My List",
      href: "/my-list",
    },
    {
      label: "Support On Coffee",
      href: "https://buymeacoffee.com/jcwatch",
      blank: true
    },
  ],
  links: {
    github: "https://github.com/JamesCicada",
    sponsor: "https://buymeacoffee.com/jcwatch",
    twitter: "https://x.com/jcthe6th",
    discord: "https://discord.gg/GXu64738nD",
  },
};
