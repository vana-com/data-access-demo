import React, { useState, useEffect, useMemo } from "react";
// --- User's Imports (Kept as requested) ---
import { useAppStore } from "../store/store";
import { Card } from "@/components/ui/card"; // Assuming Card component is similar to the placeholder used before
import { LoadingOverlay } from "../components/ui/Spinner"; // Assuming this component exists
// Assuming formatDate is available alongside formatPercentage in your utils
import { formatPercentage, formatDate } from "../lib/utils";
import { Users, Award, Zap, Server, Wifi, X } from "lucide-react";
import { AuthSource, User } from "../types"; // Assuming this type definition exists
// Assuming these mock data files exist at the specified paths
import {
  mockUsers,
  mockAuthSources,
  mockStorageMetrics,
} from "../lib/mockData";

// --- Types (Defined here for clarity, but ideally use User from "../types") ---
// If your User type is different, adjust accordingly
// interface User {
//   user_id: string;
//   name: string;
//   locale: string;
//   created_at: string;
// }

// Define AuthSource and StorageMetric types if not globally available or defined elsewhere
// interface AuthSource {
//   auth_id: string;
//   user_id: string;
//   source: string;
//   last_login: string;
// }

// Define StorageUsageData if needed
interface StorageUsageData {
  user_id: string;
  name: string;
  percent_used: number;
  recorded_at: string;
}

// Interface for tribe data
interface Tribe {
  locale: string;
  users: User[];
  authSources: Record<string, number>; // Count of users per auth source within the tribe
  totalStorage: number;
  avgStorage: number;
  userCount: number;
  dominantAuth: string; // Most common auth source in the tribe
  tribePower: number; // Calculated score for battle simulation
}

// --- Helper Functions (Kept as provided by user) ---
const getLocaleFlag = (locale: string): string => {
  if (!locale || !locale.includes("-")) return "🌍";
  const countryCode = locale.split("-")[1]?.toLowerCase() || "";
  const regionalIndicatorA = 0x1f1e6;
  if (countryCode.length !== 2) return "🌍";
  const char1 = countryCode.charCodeAt(0) - "a".charCodeAt(0);
  const char2 = countryCode.charCodeAt(1) - "a".charCodeAt(0);
  if (char1 < 0 || char1 > 25 || char2 < 0 || char2 > 25) return "🌍";
  return (
    String.fromCodePoint(regionalIndicatorA + char1) +
    String.fromCodePoint(regionalIndicatorA + char2)
  );
};

const getTribeName = (locale: string): string => {
  if (!locale) return "Unknown Tribe";
  const parts = locale.split("-");
  const langCode = parts[0];
  const countryCode = parts[1] || "";

  const languageNames: Record<string, string> = {
    en: "English",
    es: "Spanish",
    ja: "Japanese",
    fr: "French",
    zh: "Chinese",
    de: "German",
    pt: "Portuguese",
    it: "Italian",
    ko: "Korean",
  };
  const descriptors: Record<string, string> = {
    US: "Data Hoarders",
    GB: "Storage Sentinels",
    ES: "Archive Guardians",
    AU: "Digital Drifters",
    JP: "Byte Samurais",
    DE: "Efficiency Experts",
    FR: "Cache Connoisseurs",
    CN: "Cloud Weavers",
    IT: "Pixel Artisans",
    BR: "Stream Surfers",
    CA: "Network Navigators",
    KR: "Silicon Scholars",
    IE: "Connectivity Celts",
  };
  const langName = languageNames[langCode] || langCode.toUpperCase();
  const descriptor = descriptors[countryCode] || "Storage Keepers";
  return `${langName} ${countryCode} ${descriptor}`;
};

const getColorForPercentage = (percent: number): string => {
  if (percent < 33) return "bg-green-500";
  if (percent < 66) return "bg-yellow-500";
  return "bg-red-500";
};

const getAuthIcon = (source: string): React.ReactElement => {
  const size = "h-4 w-4 inline mr-1";
  const svgBaseProps = {
    width: 16,
    height: 16,
    className: size,
    viewBox: "0 0 24 24",
    fill: "currentColor",
  };

  switch (source.toLowerCase()) {
    case "google":
      return (
        <svg {...svgBaseProps} role="img" viewBox="0 0 24 24">
          <title>Google</title>
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
        </svg>
      );
    case "apple":
      return (
        <svg {...svgBaseProps} role="img" viewBox="0 0 24 24">
          <title>Apple</title>
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
        </svg>
      );
    case "microsoft":
      return (
        <svg {...svgBaseProps} role="img" viewBox="0 0 24 24">
          <title>Microsoft</title>
          <path d="M0 0v11.408h11.408V0zm12.594 0v11.408H24V0zM0 12.594V24h11.408V12.594zm12.594 0V24H24V12.594z" />
        </svg>
      );
    case "twitter":
      return (
        <svg {...svgBaseProps} role="img" viewBox="0 0 24 24">
          <title>X</title>
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...svgBaseProps} role="img" viewBox="0 0 24 24">
          <title>Facebook</title>
          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
        </svg>
      );
    case "github":
      return (
        <svg {...svgBaseProps} role="img" viewBox="0 0 24 24">
          <title>GitHub</title>
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
      );
    case "wechat":
      return (
        <svg {...svgBaseProps} role="img" viewBox="0 0 24 24">
          <title>WeChat</title>
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.04-.857-2.578.325-4.836 2.771-6.416 1.838-1.187 4.136-1.548 6.221-1.133-.883-4.577-5.266-7.093-9.803-7.093zm-1.8 2.89a1.133 1.133 0 1 1 0 2.267 1.133 1.133 0 0 1 0-2.267zm5.092 0a1.133 1.133 0 1 1 0 2.267 1.133 1.133 0 0 1 0-2.267zm8.02 2.86c-4.354 0-7.877 3.063-7.877 6.803 0 3.742 3.523 6.803 7.877 6.803.307 0 .615-.02.915-.053 0 0 1.07.611 1.796.845a.33.33 0 0 0 .162.044.287.287 0 0 0 .288-.284c0-.066-.03-.129-.047-.195l-.382-1.45a.554.554 0 0 1 .196-.6c1.623-1.211 2.695-2.916 2.835-4.834.028-.379.038-.76.038-1.146 0-3.74-3.523-6.802-7.877-6.802zm-2.863 3.46a1.039 1.039 0 1 1 0 2.078 1.039 1.039 0 0 1 0-2.078zm5.754 0a1.039 1.039 0 1 1 0 2.078 1.039 1.039 0 0 1 0-2.078z" />
        </svg>
      );
    case "kakao":
      return (
        <svg {...svgBaseProps} role="img" viewBox="0 0 24 24">
          <title>Kakao</title>
          <path d="M22.125 0H1.875C.839 0 0 .84 0 1.875v20.25C0 23.161.84 24 1.875 24h20.25C23.161 24 24 23.16 24 22.125V1.875C24 .839 23.16 0 22.125 0zM12 18.75c-.591 0-1.17-.041-1.732-.12-.562.495-3.037 2.694-3.293 2.836.126-.591.93-3.503.967-3.635-2.774-1.287-4.45-3.683-4.45-6.081 0-4.494 3.808-8.25 8.508-8.25s8.508 3.756 8.508 8.25-3.808 8.25-8.508 8.25zm1.152-8.59h-2.304a.465.465 0 0 0-.464.468v2.883c0 .258.207.468.464.468a.466.466 0 0 0 .464-.468V14.1h1.84c.257 0 .464-.21.464-.469a.466.466 0 0 0-.464-.469zm-5.808-1.345h-1.611v1.59h1.61v-1.59zm0 2.278h-1.611v1.589h1.61v-1.59zm4.315-2.278H9.609v4.556c0 .258.21.468.468.468a.466.466 0 0 0 .464-.468v-1.055h1.118c.257 0 .464-.21.464-.469a.465.465 0 0 0-.464-.464H10.54v-1.478h1.118a.466.466 0 0 0 .465-.469.472.472 0 0 0-.465-.469zm5.133 0h-1.612v1.59h1.612v-1.59zm0 2.278h-1.612v1.589h1.612v-1.59z" />
        </svg>
      );
    default:
      return <Wifi className={size} />;
  }
};

// --- Main Component ---
export const StorageTribeView: React.FC = () => {
  // --- State Management (Using user's store) ---
  const { userProfiles, storageUsage, fetchData, isLoading, error } =
    useAppStore();

  // --- Component State ---
  const [selectedTribeLocale, setSelectedTribeLocale] = useState<string | null>(
    null
  );
  const [battleMode, setBattleMode] = useState(false);
  const [battleOpponentLocale, setBattleOpponentLocale] = useState<
    string | null
  >(null);
  const [battleResult, setBattleResult] = useState<string | null>(null);
  const [spotlightUser, setSpotlightUser] = useState<User | null>(null);

  // --- Data Preparation ---
  // Use store data if available, otherwise fall back to mocks (as per user's code)
  // Note: Ensure your store provides data in the expected format or adjust processing logic.
  const users: User[] = userProfiles || mockUsers;

  // Use storageUsage from store if available, otherwise map mockStorageMetrics
  // This mapping assumes storageUsage from store might not have user names, requiring a join/lookup
  const storageData: StorageUsageData[] = useMemo(() => {
    if (storageUsage) {
      // If storageUsage comes from the store, assume it might need enrichment
      // This example assumes storageUsage is an array similar to mockStorageMetrics
      // and users (either from store or mock) is available for lookup.
      // Adjust this logic based on your actual store data structure.
      return storageUsage.map((metric: StorageUsageData) => {
        // Use 'any' or a specific type from your store
        const user = users.find((u) => u.user_id === metric.user_id);
        return {
          user_id: metric.user_id,
          name: user?.name || "Unknown User", // Add user name
          percent_used: metric.percent_used,
          recorded_at: metric.recorded_at,
        };
      });
    } else {
      // Fallback to mapping mock data
      return mockStorageMetrics.map((metric) => {
        const user = users.find((u) => u.user_id === metric.user_id); // users might be mockUsers here
        return {
          user_id: metric.user_id,
          name: user?.name || "Unknown User",
          percent_used: metric.percent_used,
          recorded_at: metric.recorded_at,
        };
      });
    }
  }, [storageUsage, users]); // Recalculate if store data or users list changes

  // Use mockAuthSources directly as per user's code.
  // If auth sources come from your store, replace mockAuthSources with that data.
  const authData: AuthSource[] = mockAuthSources;

  // Process data to create tribes
  const tribes = useMemo(() => {
    const tribeMap: Record<string, Tribe> = {};

    // Ensure users is an array before proceeding
    if (!Array.isArray(users)) {
      console.error("Users data is not an array:", users);
      return {}; // Return empty object if users data is invalid
    }

    users.forEach((user) => {
      // Basic check for valid user object and locale
      if (!user || typeof user.locale !== "string") {
        console.warn("Skipping invalid user data:", user);
        return; // Skip this user
      }

      if (!tribeMap[user.locale]) {
        tribeMap[user.locale] = {
          locale: user.locale,
          users: [],
          authSources: {},
          totalStorage: 0,
          avgStorage: 0,
          userCount: 0,
          dominantAuth: "N/A", // Default value
          tribePower: 0,
        };
      }

      const tribe = tribeMap[user.locale];
      tribe.users.push(user);
      tribe.userCount++;

      // Tally auth sources for this user within the tribe
      // Using authData (currently mockAuthSources)
      const userAuths = authData.filter(
        (auth) => auth.user_id === user.user_id
      );
      userAuths.forEach((auth) => {
        tribe.authSources[auth.source] =
          (tribe.authSources[auth.source] || 0) + 1;
      });

      // Add storage usage to tribe total using processed storageData
      const userStorage = storageData.find((s) => s.user_id === user.user_id);
      if (userStorage && typeof userStorage.percent_used === "number") {
        tribe.totalStorage += userStorage.percent_used;
      }
    });

    // Calculate averages, dominant auth source, and tribe power
    Object.keys(tribeMap).forEach((locale) => {
      const tribe = tribeMap[locale];
      if (tribe.userCount > 0) {
        tribe.avgStorage = tribe.totalStorage / tribe.userCount;

        // Find dominant auth source
        let maxCount = 0;
        let dominant = "N/A";
        Object.entries(tribe.authSources).forEach(([source, count]) => {
          if (count > maxCount) {
            maxCount = count;
            dominant = source;
          } else if (count === maxCount && dominant !== "N/A") {
            dominant += `, ${source}`; // Handle ties
          }
        });
        tribe.dominantAuth = dominant;

        // Calculate tribe power (user's formula)
        const storageComponent = tribe.avgStorage * 0.7;
        // Ensure userCount is positive before using it
        const userCountComponent = Math.max(0, tribe.userCount) * 0.3;
        tribe.tribePower = storageComponent + userCountComponent;
      } else {
        tribe.avgStorage = 0;
        tribe.dominantAuth = "N/A";
        tribe.tribePower = 0;
      }
    });

    return tribeMap;
  }, [users, storageData, authData]); // Dependencies for recalculation

  // --- Effects ---
  // Fetch initial data if not available (using user's store logic)
  useEffect(() => {
    // Check if userProfiles is truly empty/null/undefined before fetching
    // The fallback `users = userProfiles || mockUsers` might mask the need to fetch
    if (!userProfiles && !isLoading) {
      // Check userProfiles specifically
      console.log("StorageTribeView: User profiles not found, fetching...");
      fetchData("userProfiles"); // Assuming 'userProfiles' is the correct key for your store
    }
    // Similarly check storageUsage
    if (!storageUsage && !isLoading) {
      console.log("StorageTribeView: Storage usage not found, fetching...");
      fetchData("storageUsage"); // Assuming 'storageUsage' is the correct key
    }
    // Add similar checks if authData should also come from the store
  }, [userProfiles, storageUsage, fetchData, isLoading]); // Dependencies

  // Select a random user for spotlight every 5 seconds
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    // Ensure users is a non-empty array
    if (!battleMode && Array.isArray(users) && users.length > 0) {
      setSpotlightUser(users[Math.floor(Math.random() * users.length)]);
      intervalId = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * users.length);
        setSpotlightUser(users[randomIndex]);
      }, 5000);
    } else {
      setSpotlightUser(null);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [users, battleMode]); // Rerun if users array or battleMode changes

  // --- Event Handlers ---
  // Simulate battle between tribes
  const simulateBattle = (locale1: string, locale2: string) => {
    if (!tribes[locale1] || !tribes[locale2]) {
      setBattleResult("Error: Invalid tribe selected.");
      return;
    }
    const tribe1 = tribes[locale1];
    const tribe2 = tribes[locale2];
    const score1 = tribe1.tribePower;
    const score2 = tribe2.tribePower;
    const scoreDifference = Math.abs(score1 - score2);
    const randomFactor = (Math.random() - 0.5) * (scoreDifference * 0.2 + 5);
    const adjustedScore1 = Math.max(0, score1 + randomFactor);
    const adjustedScore2 = Math.max(0, score2 - randomFactor);

    let winnerLocale: string,
      loserLocale: string,
      winningScore: number,
      losingScore: number;

    if (adjustedScore1 > adjustedScore2) {
      [winnerLocale, loserLocale, winningScore, losingScore] = [
        locale1,
        locale2,
        adjustedScore1,
        adjustedScore2,
      ];
    } else if (adjustedScore2 > adjustedScore1) {
      [winnerLocale, loserLocale, winningScore, losingScore] = [
        locale2,
        locale1,
        adjustedScore2,
        adjustedScore1,
      ];
    } else {
      setBattleResult(
        `⚔️ TIE between ${getLocaleFlag(locale1)} ${getTribeName(
          locale1
        )} & ${getLocaleFlag(locale2)} ${getTribeName(
          locale2
        )}! (${score1.toFixed(1)})`
      );
      return;
    }
    const margin = Math.abs(winningScore - losingScore).toFixed(1);
    setBattleResult(
      `🏆 ${getLocaleFlag(winnerLocale)} ${getTribeName(
        winnerLocale
      )} triumphs over ${getLocaleFlag(loserLocale)} ${getTribeName(
        loserLocale
      )} by ${margin} points! (${winningScore.toFixed(
        1
      )} vs ${losingScore.toFixed(1)})`
    );
  };

  // * Refactored: Handle selecting tribes for battle correctly *
  const handleSelectTribeForBattle = (locale: string) => {
    if (!selectedTribeLocale) {
      setSelectedTribeLocale(locale);
      setBattleOpponentLocale(null);
      setBattleResult(null);
    } else if (locale !== selectedTribeLocale && !battleOpponentLocale) {
      setBattleOpponentLocale(locale);
      setBattleResult(null);
    } else if (locale === selectedTribeLocale) {
      if (!battleOpponentLocale) {
        setSelectedTribeLocale(null);
        setBattleResult(null);
      }
    } else if (locale === battleOpponentLocale) {
      setBattleOpponentLocale(null);
      setBattleResult(null);
    }
  };

  // * Refactored: Main click handler for tribe cards *
  const handleTribeClick = (locale: string) => {
    if (battleMode) {
      handleSelectTribeForBattle(locale);
    } else {
      setSelectedTribeLocale(selectedTribeLocale === locale ? null : locale);
    }
  };

  // --- Render Logic ---
  if (isLoading) {
    // Use the LoadingOverlay component imported by the user
    return <LoadingOverlay message="Loading tribe data..." />;
  }

  if (error) {
    // Use the Card component imported by the user
    // Ensure your Card component accepts className
    // Ensure you have 'bg-primary' and 'hover:bg-primary-hover' defined in your Tailwind config or global CSS
    return (
      <Card className="p-4 text-center border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400 font-medium">
          Error loading data:
        </p>
        <p className="text-red-500 dark:text-red-500 text-sm mb-4">
          {!!error && String(error)}
        </p>
        <button
          onClick={() => {
            // Attempt to fetch all required data again
            if (!userProfiles) fetchData("userProfiles");
            if (!storageUsage) fetchData("storageUsage");
            // Add fetch for authData if it comes from store
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" // Example using standard colors
        >
          Retry
        </button>
      </Card>
    );
  }

  // Main component render
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100 font-sans">
      {/* Header and Battle Mode Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-2 sm:mb-0">
          Storage Tribe Explorer
        </h1>
        <button
          onClick={() => {
            setBattleMode(!battleMode);
            setSelectedTribeLocale(null);
            setBattleOpponentLocale(null);
            setBattleResult(null);
          }}
          className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
            battleMode
              ? "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white"
              : "bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white"
          }`}
        >
          {battleMode ? <X className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
          {battleMode ? "Exit Battle Mode" : "Tribe Battle"}
        </button>
      </div>

      {/* User Spotlight Section */}
      {!battleMode && spotlightUser && (
        // Use the Card component imported by the user
        <Card className="p-5 bg-gradient-to-br from-purple-50 dark:from-purple-900/30 via-white dark:via-gray-800 to-blue-50 dark:to-blue-900/30 border border-purple-200 dark:border-purple-700/50 shadow-lg mb-6 transition-all duration-500 ease-in-out">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold mb-2 text-purple-800 dark:text-purple-300 flex items-center truncate">
                <Award className="h-6 w-6 inline mr-2 text-yellow-500 animate-pulse flex-shrink-0" />
                <span className="truncate">
                  Spotlight: {spotlightUser.name}
                </span>
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">
                <span className="text-xl mr-1">
                  {getLocaleFlag(spotlightUser.locale)}
                </span>
                Member of the{" "}
                <span className="font-medium">
                  {getTribeName(spotlightUser.locale)}
                </span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {/* Use formatDate imported from user's utils */}
                Joined: {formatDate(spotlightUser.created_at)}
              </p>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1 text-left sm:text-right w-full sm:w-auto flex-shrink-0">
              {storageData.find((s) => s.user_id === spotlightUser.user_id) && (
                <p>
                  <Server className="h-4 w-4 inline mr-1 opacity-70" />
                  Storage:{" "}
                  <span className="font-medium">
                    {/* Use formatPercentage imported from user's utils */}
                    {formatPercentage(
                      storageData.find(
                        (s) => s.user_id === spotlightUser.user_id
                      )!.percent_used
                    )}
                  </span>
                </p>
              )}
              {/* * Refactored: Dynamically display auth sources for spotlight user * */}
              {authData.filter((a) => a.user_id === spotlightUser.user_id)
                .length > 0 && (
                <div className="flex items-center justify-start sm:justify-end flex-wrap gap-x-2">
                  <Wifi className="h-4 w-4 inline mr-1 opacity-70 flex-shrink-0" />
                  <span className="mr-1 flex-shrink-0">Auth:</span>
                  <span className="flex flex-wrap gap-1 justify-start sm:justify-end">
                    {/* Filter and map the actual auth sources for this user */}
                    {authData
                      .filter((a) => a.user_id === spotlightUser.user_id)
                      .map((a) => (
                        <span
                          key={a.auth_id}
                          title={a.source}
                          className="inline-flex items-center capitalize text-xs bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded"
                        >
                          {getAuthIcon(a.source)} {a.source}
                        </span>
                      ))}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Tribe Battle Section */}
      {battleMode && (
        // Use the Card component imported by the user
        <Card className="p-6 bg-gradient-to-br from-red-50 dark:from-red-900/30 via-white dark:via-gray-800 to-amber-50 dark:to-amber-900/30 border border-red-200 dark:border-red-700/50 shadow-lg mb-6">
          <h3 className="text-xl font-semibold mb-4 text-center text-red-800 dark:text-red-300">
            Tribe Battle Simulator
          </h3>
          {/* Tribe Selection Display */}
          <div className="flex flex-col md:flex-row justify-around items-center gap-6 mb-6">
            <div className="text-center p-3 rounded-lg border-2 border-dashed border-blue-400 dark:border-blue-600 min-w-[180px]">
              <p className="text-sm font-medium mb-1 text-blue-700 dark:text-blue-300">
                Contender 1
              </p>
              <p className="text-lg font-semibold h-8">
                {selectedTribeLocale
                  ? `${getLocaleFlag(
                      selectedTribeLocale
                    )} ${selectedTribeLocale}`
                  : "..."}
              </p>
              {selectedTribeLocale && (
                <button
                  onClick={() => {
                    setSelectedTribeLocale(null);
                    setBattleOpponentLocale(null);
                    setBattleResult(null);
                  }}
                  className="text-xs text-blue-500 hover:underline mt-1"
                >
                  (Change)
                </button>
              )}
            </div>
            <div className="text-4xl font-bold text-gray-400 dark:text-gray-600 animate-pulse">
              VS
            </div>
            <div
              className={`text-center p-3 rounded-lg border-2 border-dashed min-w-[180px] ${
                selectedTribeLocale
                  ? "border-red-400 dark:border-red-600"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              <p
                className={`text-sm font-medium mb-1 ${
                  selectedTribeLocale
                    ? "text-red-700 dark:text-red-300"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                Contender 2
              </p>
              <p
                className={`text-lg font-semibold h-8 ${
                  !selectedTribeLocale ? "text-gray-400 dark:text-gray-600" : ""
                }`}
              >
                {battleOpponentLocale
                  ? `${getLocaleFlag(
                      battleOpponentLocale
                    )} ${battleOpponentLocale}`
                  : selectedTribeLocale
                  ? "..."
                  : "..."}
              </p>
              {battleOpponentLocale && (
                <button
                  onClick={() => {
                    setBattleOpponentLocale(null);
                    setBattleResult(null);
                  }}
                  className="text-xs text-red-500 hover:underline mt-1"
                >
                  (Change)
                </button>
              )}
            </div>
          </div>
          {/* Battle Button & Result */}
          {selectedTribeLocale && battleOpponentLocale && (
            <div className="mt-6 text-center">
              <button
                onClick={() =>
                  simulateBattle(selectedTribeLocale, battleOpponentLocale)
                }
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white text-lg font-bold rounded-full hover:from-red-700 hover:to-orange-600 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedTribeLocale || !battleOpponentLocale}
              >
                BATTLE!
              </button>
              {battleResult && (
                <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner min-h-[50px] flex items-center justify-center">
                  <p className="text-md font-semibold text-gray-800 dark:text-gray-200">
                    {battleResult}
                  </p>
                </div>
              )}
            </div>
          )}
          {/* Instructions */}
          {!selectedTribeLocale && (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
              Click a tribe card below to select Contender 1.
            </p>
          )}
          {selectedTribeLocale && !battleOpponentLocale && (
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
              Click another tribe card to select Contender 2.
            </p>
          )}
        </Card>
      )}

      {/* Main Tribe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Object.entries(tribes)
          .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
          .map(([locale, tribe]) => {
            // Determine border style based on battle mode and selection
            let borderStyle =
              "border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600";
            if (battleMode) {
              if (selectedTribeLocale === locale)
                borderStyle =
                  "border-2 border-blue-500 dark:border-blue-400 scale-105 shadow-xl ring-2 ring-blue-300 dark:ring-blue-600";
              else if (battleOpponentLocale === locale)
                borderStyle =
                  "border-2 border-red-500 dark:border-red-400 scale-105 shadow-xl ring-2 ring-red-300 dark:ring-red-600";
              else if (selectedTribeLocale && !battleOpponentLocale)
                borderStyle =
                  "border border-gray-300 dark:border-gray-600 hover:border-yellow-400 dark:hover:border-yellow-500 opacity-80 hover:opacity-100";
              else {
                borderStyle =
                  "border border-gray-300 dark:border-gray-600 opacity-60";
                if (!selectedTribeLocale)
                  borderStyle =
                    "border border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 opacity-80 hover:opacity-100";
              }
            } else if (selectedTribeLocale === locale) {
              borderStyle =
                "border border-blue-500 dark:border-blue-400 scale-105 shadow-xl ring-1 ring-blue-200 dark:ring-blue-700";
            }

            // Determine if clickable in battle mode
            const isClickableInBattle =
              battleMode &&
              (!selectedTribeLocale ||
                !battleOpponentLocale ||
                locale === selectedTribeLocale ||
                locale === battleOpponentLocale);
            const cursorStyle = battleMode
              ? isClickableInBattle
                ? "cursor-pointer"
                : "cursor-not-allowed"
              : "cursor-pointer";

            return (
              // Use the Card component imported by the user
              <Card
                key={locale}
                className={`p-4 transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${borderStyle} ${cursorStyle}`}
                // * Refactored: Use the correct click handler *
                onClick={
                  battleMode && !isClickableInBattle
                    ? undefined
                    : () => handleTribeClick(locale)
                }
              >
                {/* Tribe Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold flex items-center gap-2 truncate">
                      <span className="text-3xl flex-shrink-0">
                        {getLocaleFlag(locale)}
                      </span>
                      <span className="truncate">{locale}</span>
                    </h3>
                    <p
                      className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate"
                      title={getTribeName(locale)}
                    >
                      {getTribeName(locale)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0 pl-2 space-y-1">
                    <div className="text-xs font-medium bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
                      <Zap className="h-3 w-3 text-yellow-500" />{" "}
                      {tribe.tribePower.toFixed(1)}
                    </div>
                    <div className="text-xs font-medium bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Users className="h-3 w-3 opacity-70" /> {tribe.userCount}
                    </div>
                  </div>
                </div>
                {/* Tribe Stats */}
                <div className="space-y-1.5 text-sm mb-3">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1 flex-shrink-0">
                      <Server className="h-4 w-4 opacity-70" /> Avg Storage:
                    </span>
                    {/* Use formatPercentage imported from user's utils */}
                    <span className="font-medium text-right truncate">
                      {formatPercentage(tribe.avgStorage)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1 capitalize flex-shrink-0">
                      <Wifi className="h-4 w-4 opacity-70" /> Main Auth:
                    </span>
                    <span className="font-medium flex items-center gap-1 text-right truncate">
                      {getAuthIcon(tribe.dominantAuth.split(",")[0])}
                      <span className="truncate">{tribe.dominantAuth}</span>
                    </span>
                  </div>
                </div>
                {/* Storage Usage Bar */}
                <div
                  className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden"
                  title={`Average Storage: ${formatPercentage(
                    tribe.avgStorage
                  )}`}
                >
                  <div
                    className={`${getColorForPercentage(
                      tribe.avgStorage
                    )} h-2.5 rounded-full transition-all duration-500 ease-out`}
                    style={{
                      width: `${Math.min(100, Math.max(0, tribe.avgStorage))}%`,
                    }}
                  />
                </div>
                {/* Expanded Tribe Member List */}
                {selectedTribeLocale === locale && !battleMode && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Tribe Members ({tribe.userCount})
                    </h4>
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                      {tribe.users
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((user) => {
                          const userStorage = storageData.find(
                            (s) => s.user_id === user.user_id
                          );
                          // * Refactored: Dynamically find and display auth sources for each member *
                          const userAuths = authData.filter(
                            (a) => a.user_id === user.user_id
                          );
                          return (
                            <div
                              key={user.user_id}
                              className="text-xs p-1.5 rounded bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center gap-2"
                            >
                              <span
                                className="truncate flex-1"
                                title={user.name}
                              >
                                {user.name}
                              </span>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {/* Reduced gap slightly */}
                                {/* Map over the actual auth sources found */}
                                {userAuths.map((auth) => (
                                  <span
                                    key={auth.auth_id}
                                    title={auth.source}
                                    className="capitalize flex items-center"
                                  >
                                    {getAuthIcon(auth.source)}
                                  </span>
                                ))}
                                {userStorage && (
                                  <span
                                    className={`font-medium text-right w-12 ${
                                      userStorage.percent_used > 75
                                        ? "text-red-600 dark:text-red-400"
                                        : userStorage.percent_used > 50
                                        ? "text-yellow-600 dark:text-yellow-400"
                                        : "text-green-600 dark:text-green-400"
                                    }`}
                                  >
                                    {/* Use formatPercentage imported from user's utils */}
                                    {formatPercentage(userStorage.percent_used)}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
      </div>
    </div>
  );
};

// Note: No default export for App component as only StorageTribeView was requested for refactoring.
// You would typically export default App in your main App file.
// export default App;
