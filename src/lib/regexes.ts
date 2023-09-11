export const EmojiKeyPresent = /(?<!<|<a|\\):\w\w+:/i;

export const EmojiKeys = /(?<!<|<a|\\):\w\w+:/gi;

export const HttpUrlRegexGlobal = /https?:\/\/[^\s/$.?#].[^\s]*/g;

export const TikTokShortenedUrl = /(https?:\/\/vm\.tiktok\.com\/\w+\b)/g;

export const TikTokUrl =
  /https?:\/\/www\.tiktok\.com\/@[^/]+\/video\/\d+\/?\b/g;
