import { NextResponse } from "next/server";
import YouTube from "youtube-sr";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") ?? "6", 10);

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  try {
    const videos = await YouTube.search(query, { limit, type: "video" });

    const results = videos.map((video) => ({
      id:        video.id ?? "",
      title:     video.title ?? "Unknown",
      artist:    video.channel?.name ?? "Unknown",
      thumbnail: video.thumbnail?.url ?? "",
    }));

    // Also keep legacy format for existing components
    const items = videos.map((video) => ({
      id:        video.id,
      title:     video.title,
      videoId:   video.id,
      thumbnail: video.thumbnail?.url ?? "",
      channel:   video.channel?.name ?? "Unknown Channel",
    }));

    return NextResponse.json({ results, items });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
