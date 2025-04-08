import { list } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Try to find blob using list first
    try {
      const { blobs } = await list();
      const socialStatsBlob = blobs.find(blob => 
        blob.pathname.endsWith('social-stats.json')
      );
      
      if (socialStatsBlob) {
        const response = await fetch(socialStatsBlob.url);
        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data);
        }
      }
    } catch (listError) {
      console.log("Could not list blobs, trying direct access", listError);
      // Continue to fallback methods if list() fails
    }

    // Fallback to direct URL if configured
    const blobUrl = process.env.SOCIAL_STATS_BLOB_URL;
    if (blobUrl) {
      const response = await fetch(blobUrl);
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    }

    // If all methods failed, return error
    console.error("Failed to retrieve social stats data from Vercel Blob");
    return NextResponse.json(
      { error: "Failed to retrieve social stats data" },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error in social-stats API endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 