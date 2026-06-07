import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are the "Sanctuary Orchestrator" — the intelligence layer behind Rishi and Vanshika's shared digital sanctuary. Your job is to translate natural language requests into structured actions that interact with the website's database.

Available Tools:
1. "updateDailyNote": For updating the daily note text.
   - inputs: { "content": "string" }
2. "updateDatePlanner": For updating the next date ticket parameters.
   - inputs: { "time": "string", "place": "string", "activity": "string", "dress": "string", "budget": "string", "notes": "string", "mood": "string" }
3. "addMilestoneDate": For adding a countdown milestone date.
   - inputs: { "title": "string", "date": "string (YYYY-MM-DD)", "tag": "string (birthday/anniversary/meeting/date/moment)", "note": "string" }
4. "addScrapbookPhoto": For adding a Polaroid snapshot image.
   - inputs: { "title": "string", "date": "string (e.g. June 12, 2025)", "location": "string", "description": "string", "image_url": "string (optional url)" }

Response Format:
You must output ONLY a valid JSON object matching this TypeScript type:
{
  intent: "updateDailyNote" | "updateDatePlanner" | "addMilestoneDate" | "addScrapbookPhoto" | "none";
  reasoning: string;
  requiresConfirmation: boolean;
  draft: Record<string, any>;
  message: string;
}

Guidelines:
- If you select 'updateDailyNote' or 'addMilestoneDate', set requiresConfirmation to true.
- If you select 'updateDatePlanner' or 'addScrapbookPhoto', set requiresConfirmation to false (low risk).
- If the request does not map to any tool, set intent to "none" and output a helpful romantic response in the 'message' field.
- Do not add markdown wraps (like \`\`\`json) or extra text outside the JSON object.
`;

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "NVIDIA API key not configured on server" }, { status: 500 });
    }

    // Call the NVIDIA chat completions endpoint (OpenAI compatible)
    // stream: false is required — without it the API defaults to SSE streaming
    // which returns "data: {...}" lines that cannot be JSON.parse()'d directly.
    // Using llama-3.3-70b-instruct — widely available on free NVIDIA API keys.
    // Note: response_format is omitted — not all NIM models support it; the
    // system prompt already instructs the model to return only valid JSON.
    const nvResponse = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "meta/llama-3.3-70b-instruct",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message }
        ],
        temperature: 0.2,
        max_tokens: 800,
        stream: false
      })
    });

    // Read raw text first so we can give a useful error if the API returns HTML/plain-text
    const rawText = await nvResponse.text();

    if (!nvResponse.ok) {
      // Surface the actual NVIDIA error (e.g., invalid key, quota exceeded)
      let errorMsg = `NVIDIA API error ${nvResponse.status}`;
      try {
        const errJson = JSON.parse(rawText);
        errorMsg = errJson?.detail ?? errJson?.message ?? errorMsg;
      } catch { /* rawText is not JSON, use status string */ }
      return NextResponse.json({ error: errorMsg }, { status: 502 });
    }

    let data: any;
    try {
      data = JSON.parse(rawText);
    } catch {
      return NextResponse.json({ error: `Unexpected API response format: ${rawText.slice(0, 200)}` }, { status: 502 });
    }

    const contentText = data.choices?.[0]?.message?.content;

    if (!contentText) {
      return NextResponse.json({ error: "No content in NVIDIA API response" }, { status: 502 });
    }

    // Parse the JSON the model returned — strip markdown code fences if present
    let actionResult;
    try {
      actionResult = JSON.parse(contentText);
    } catch {
      const cleanJson = contentText.replace(/```json/g, "").replace(/```/g, "").trim();
      actionResult = JSON.parse(cleanJson);
    }

    return NextResponse.json(actionResult);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
