export const CATEGORIES = [
  "Discord",
  "WhatsApp",
  "Facebook",
  "Site",
  "Twitter",
  "Pinterest",
  "Instagram",
  "Kwai",
  "TikTok",
  "Cursos",
  "Shopee",
  "Spotify",
  "Aliexpress",
  "Telegram",
  "Design",
] as const;

export type Category = (typeof CATEGORIES)[number];
