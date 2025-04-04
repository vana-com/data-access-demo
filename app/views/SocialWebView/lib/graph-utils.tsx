import { Wifi } from "lucide-react";
import React from "react";
import { GraphLink } from "../types/graph";

/**
 * Returns an SVG icon element representing the authentication source.
 * @param source - The name of the authentication source (e.g., "Google", "Facebook").
 * @returns A React Element containing the SVG icon, or a default Wifi icon.
 */
export const getAuthIcon = (source: string): React.ReactElement => {
  const size = "h-4 w-4 inline mr-1 align-middle"; // Consistent styling
  const svgBaseProps: React.SVGProps<SVGSVGElement> = {
    width: 16,
    height: 16,
    className: size,
    viewBox: "0 0 24 24",
    fill: "currentColor",
    role: "img", // Accessibility: Indicate this is an image
    "aria-hidden": true, // Hide decorative icons from screen readers
  };

  // Use a title inside SVG for better accessibility/tooltips
  const sourceTitle = `${source} icon`;

  switch (source.toLowerCase()) {
    case "google":
      return (
        <svg {...svgBaseProps} viewBox="0 0 24 24">
          <title>{sourceTitle}</title>
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
        </svg>
      );
    case "apple":
      return (
        <svg {...svgBaseProps} viewBox="0 0 24 24">
          <title>{sourceTitle}</title>
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
        </svg>
      );
    case "microsoft":
      return (
        <svg {...svgBaseProps} viewBox="0 0 24 24">
          <title>{sourceTitle}</title>
          <path d="M0 0v11.408h11.408V0zm12.594 0v11.408H24V0zM0 12.594V24h11.408V12.594zm12.594 0V24H24V12.594z" />
        </svg>
      );
    case "twitter": // Or "X"
    case "x":
      return (
        <svg {...svgBaseProps} viewBox="0 0 24 24">
          <title>{sourceTitle}</title>
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...svgBaseProps} viewBox="0 0 24 24">
          <title>{sourceTitle}</title>
          <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
        </svg>
      );
    case "github":
      return (
        <svg {...svgBaseProps} viewBox="0 0 24 24">
          <title>{sourceTitle}</title>
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
      );
    case "wechat":
      return (
        <svg {...svgBaseProps} viewBox="0 0 24 24">
          <title>{sourceTitle}</title>
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.04-.857-2.578.325-4.836 2.771-6.416 1.838-1.187 4.136-1.548 6.221-1.133-.883-4.577-5.266-7.093-9.803-7.093zm-1.8 2.89a1.133 1.133 0 1 1 0 2.267 1.133 1.133 0 0 1 0-2.267zm5.092 0a1.133 1.133 0 1 1 0 2.267 1.133 1.133 0 0 1 0-2.267zm8.02 2.86c-4.354 0-7.877 3.063-7.877 6.803 0 3.742 3.523 6.803 7.877 6.803.307 0 .615-.02.915-.053 0 0 1.07.611 1.796.845a.33.33 0 0 0 .162.044.287.287 0 0 0 .288-.284c0-.066-.03-.129-.047-.195l-.382-1.45a.554.554 0 0 1 .196-.6c1.623-1.211 2.695-2.916 2.835-4.834.028-.379.038-.76.038-1.146 0-3.74-3.523-6.802-7.877-6.802zm-2.863 3.46a1.039 1.039 0 1 1 0 2.078 1.039 1.039 0 0 1 0-2.078zm5.754 0a1.039 1.039 0 1 1 0 2.078 1.039 1.039 0 0 1 0-2.078z" />
        </svg>
      );
    case "kakao":
      return (
        <svg {...svgBaseProps} viewBox="0 0 24 24">
          <title>{sourceTitle}</title>
          <path d="M22.125 0H1.875C.839 0 0 .84 0 1.875v20.25C0 23.161.84 24 1.875 24h20.25C23.161 24 24 23.16 24 22.125V1.875C24 .839 23.16 0 22.125 0zM12 18.75c-.591 0-1.17-.041-1.732-.12-.562.495-3.037 2.694-3.293 2.836.126-.591.93-3.503.967-3.635-2.774-1.287-4.45-3.683-4.45-6.081 0-4.494 3.808-8.25 8.508-8.25s8.508 3.756 8.508 8.25-3.808 8.25-8.508 8.25zm1.152-8.59h-2.304a.465.465 0 0 0-.464.468v2.883c0 .258.207.468.464.468a.466.466 0 0 0 .464-.468V14.1h1.84c.257 0 .464-.21.464-.469a.466.466 0 0 0-.464-.469zm-5.808-1.345h-1.611v1.59h1.61v-1.59zm0 2.278h-1.611v1.589h1.61v-1.59zm4.315-2.278H9.609v4.556c0 .258.21.468.468.468a.466.466 0 0 0 .464-.468v-1.055h1.118c.257 0 .464-.21.464-.469a.465.465 0 0 0-.464-.464H10.54v-1.478h1.118a.466.466 0 0 0 .465-.469.472.472 0 0 0-.465-.469zm5.133 0h-1.612v1.59h1.612v-1.59zm0 2.278h-1.612v1.589h1.612v-1.59z" />
        </svg>
      );
    default:
      // Return a default icon if source is not recognized
      return <Wifi className={size} aria-label="Unknown source" />;
  }
};

/**
 * Generates a human-readable explanation of the connection between two users based on a link.
 * @param link - The graph link object (which may have source/target as ID or node object).
 * @param users - An array of user profiles (needed to find names).
 * @returns A string describing the connection.
 */
export const generateConnectionExplanation = (
  link: GraphLink,
  users: { user_id: string; name: string }[]
): string => {
  // Handle both string IDs and node objects for source/target
  const sourceId =
    typeof link.source === "string" ? link.source : link.source.id;
  const targetId =
    typeof link.target === "string" ? link.target : link.target.id;

  const sourceUser = users.find((u) => u.user_id === sourceId);
  const targetUser = users.find((u) => u.user_id === targetId);

  const sourceName = sourceUser?.name || `User ${sourceId.substring(0, 6)}`;
  const targetName = targetUser?.name || `User ${targetId.substring(0, 6)}`;

  let explanation = `${sourceName} and ${targetName} are connected via ${link.source_type}`;

  // Add locale stats if available
  if (link.localeStats) {
    explanation += `\n📊 ${link.source_type} Stats:`;
    explanation += `\n• Users: ${link.localeStats.userCount}`;
    explanation += `\n• Avg Storage: ${link.localeStats.averageStorage}%`;
  }

  return explanation;
};
