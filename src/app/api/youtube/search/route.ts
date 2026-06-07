import { NextResponse } from "next/server";
import YouTube from "youtube-sr";

function extractYouTubeId(url: string) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") ?? "6", 10);

  if (!query) {
    return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
  }

  try {
    let videos: any[] = [];
    
    // Check if user pasted a direct YouTube link
    const videoId = extractYouTubeId(query);
    if (videoId) {
      try {
        const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        if (oembedRes.ok) {
          const oembedData = await oembedRes.json();
          videos = [{
            id: videoId,
            title: oembedData.title,
            channel: { name: oembedData.author_name },
            thumbnail: { url: oembedData.thumbnail_url }
          }];
        }
      } catch (e) {
        // Ignore and fallback
      }
    } 
    
    if (videos.length === 0 && !videoId) {
      videos = await YouTube.search(query, { limit, type: "video" });
    }

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
