import { NextResponse } from "next/server";

// ─── Unified AI Generation Route ─────────────────────────────────────────────
// Supports: note, reminder, plan, microcopy, summarize, music, checklist, daily, mood, memory

const SYSTEM_PROMPTS: Record<string, string> = {
  note:      "You are a romantic AI writing assistant. Write emotionally rich, personal love notes for a man writing to his partner Vanshika. The tone should be warm, poetic, and intimate — never generic. Write in first person. Return only the finished note, no metadata or commentary.",
  reminder:  "You are a romantic AI copywriter. Write a tender, personal emotional note for a date reminder or special event. The note should feel heartfelt and specific. Keep it under 120 words. Return only the note text.",
  plan:      "You are a romantic date planning AI. Create a vivid, detailed description of a date plan that feels magical and personal. Include atmosphere, sensory details, and special touches. Return only the description paragraph(s), no lists unless explicitly asked.",
  microcopy: "You are a premium UX copywriter for a romantic website. Write short, elegant, emotionally resonant microcopy phrases. Keep responses concise and impactful. Return only the copy.",
  summarize: "You are an elegant writing assistant. Transform raw, casual memory notes into beautifully written, emotionally rich descriptions suitable for a premium romantic website. Preserve all key details but elevate the language. Return only the polished description.",
  music:     "You are a music curator with deep knowledge of romantic, intimate, and emotionally resonant songs. When asked for recommendations, provide song title, artist, and a one-sentence reason. Format as a simple numbered list.",
  checklist: "You are helping plan a date. Generate a practical, thoughtful checklist of 5-8 items to prepare for the described date. Format as a simple bullet list, one item per line starting with a dash (-).",
  daily:     "You are a romantic AI writing assistant. Write a warm, personal daily message for Vanshika — the kind of message a loving partner would send to make someone feel seen and appreciated. Keep it under 80 words. Return only the message.",
  mood:      "You are a caring, emotionally intelligent AI. Write a comforting, personal response for someone in a specific emotional mood. The response should feel like it comes from someone who deeply understands and cares. Keep it under 100 words. Return only the response.",
  memory:    "You are an elegant memoir writer. Transform a rough memory note into a beautifully written, intimate memory description suitable for a romantic website. Keep the essence but elevate the language. Return only the polished memory description.",
};

export async function POST(request: Request) {
  try {
    const { type, prompt, content } = await request.json();

    // Special case: save a daily message (just acknowledge, caller handles save)
    if (type === "save_message") {
      return NextResponse.json({ success: true });
    }

    if (!prompt && !content) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "NVIDIA API key not configured" }, { status: 500 });
    }

    const systemPrompt = SYSTEM_PROMPTS[type] ?? SYSTEM_PROMPTS.note;
    const userMessage  = content ?? prompt;

    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-70b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userMessage },
        ],
        temperature: type === "checklist" ? 0.4 : 0.82,
        max_tokens:  type === "checklist" ? 400 : 800,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `NVIDIA API error: ${err}` }, { status: 502 });
    }

    const data = await response.json();
    const draft = data.choices?.[0]?.message?.content ?? "";

    if (!draft) {
      return NextResponse.json({ error: "Empty response from AI" }, { status: 502 });
    }

    return NextResponse.json({ draft });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
