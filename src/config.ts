export const SITE = {
  website: "https://inferops.dev/",
  author: "inferops",
  profile: "https://inferops.dev/about",
  desc: "MLOps, LLMOps, and AI infrastructure — practical guides for ML engineers and platform teams.",
  title: "inferops",
  ogImage: "og-default.png",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 8,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true,
  editPost: {
    enabled: false,
    text: "Suggest edit",
    url: "https://github.com/YOUR_GITHUB_USERNAME/inferops-dev/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr",
  lang: "en",
  timezone: "Europe/Berlin",
} as const;
