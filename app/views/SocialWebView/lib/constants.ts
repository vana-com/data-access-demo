// app/lib/constants.ts

/**
 * Color palette for different locales (using HSL for theme adaptability).
 */
export const LOCALE_COLORS: Record<string, string> = {
  "en-US": "hsl(221.2 83.2% 53.3%)", // Primary blue
  "en-GB": "hsl(217.2 91.2% 59.8%)", // Slightly different blue
  "en-AU": "hsl(142.1 76.2% 36.3%)", // Green
  "en-CA": "hsl(0 72.2% 50.6%)", // Red
  "es-ES": "hsl(35.9 93.3% 52.9%)", // Orange
  "ja-JP": "hsl(346.8 77.2% 49.8%)", // Pink/Red
  "fr-FR": "hsl(262.1 83.3% 57.8%)", // Purple
  "zh-CN": "hsl(47.9 95.8% 53.1%)", // Yellow
  "de-DE": "hsl(215.4 90.2% 51.0%)", // Another blue shade
  "pt-BR": "hsl(158.1 79.5% 47.1%)", // Teal/Green
};

/**
 * Default color for locales not explicitly defined.
 */
export const DEFAULT_LOCALE_COLOR = "hsl(210 40% 96.1%)"; // Light gray

/**
 * Color palette for different authentication sources.
 */
export const SOURCE_COLORS: Record<string, string> = {
  Google: "hsl(142.1 70.6% 45.3%)", // Green
  Facebook: "hsl(221 44% 41%)", // Dark Blue
  Twitter: "hsl(203 89% 53%)", // Light Blue (X logo color)
  Apple: "hsl(210 10% 60%)", // Gray
  GitHub: "hsl(210 10% 23%)", // Dark Gray/Black
  Microsoft: "hsl(38.9 98.3% 50.8%)", // Orange/Yellow
  WeChat: "hsl(120 60% 45%)", // Green
  Kakao: "hsl(45 100% 50%)", // Yellow
};

/**
 * Default color for authentication sources not explicitly defined.
 */
export const DEFAULT_SOURCE_COLOR = "hsl(210 20% 50%)"; // Medium gray
