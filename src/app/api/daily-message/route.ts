import { NextResponse } from 'next/server';

const FALLBACK_MESSAGES = [
  "You are my favourite part of every single day, Vanshika. Wishing you a calm and happy morning. - Rishi",
  "Just a little reminder that your smile is my comfort, Vanshika. I hope your day is as wonderful as you are. - Rishi",
  "I cherish the simple, quiet moments we share. You bring so much peace into my life, Vanshika. - Rishi",
  "No matter how busy today gets, remember that I am thinking of you and grateful for your warmth. - Rishi",
  "Your voice is my favourite sound and my absolute calm, Vanshika. Have a beautiful day. - Rishi",
  "I love the quiet mornings and peaceful evenings we share. Thank you for being you, Vanshika. - Rishi",
  "You make ordinary days feel special just by being in them, Vanshika. Sending you all my love today. - Rishi"
];

function getDailyFallbackMessage() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  return FALLBACK_MESSAGES[dayOfYear % FALLBACK_MESSAGES.length];
}

export async function GET() {
  const apiKey = process.env.NVIDIA_API_KEY;
  const isKeyConfigured = apiKey && apiKey.trim() !== '' && apiKey !== 'your_nvidia_api_key_here';

  if (!isKeyConfigured) {
    return NextResponse.json({
      message: getDailyFallbackMessage(),
      isGeneratedByAI: false,
      note: "Set NVIDIA_API_KEY in .env.local to enable AI-powered daily messages."
    });
  }

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-8b-instruct",
        messages: [
          {
            role: "system",
            content: "You are a warm, sincere, mature, and deeply affectionate AI assistant. Your task is to write a single-sentence cute daily love note or comforting message from Rishi to Vanshika. Do not use generic clichés (like 'universe', 'stars aligning', 'destiny'). Keep it brief (15-35 words), highly personal, warm, and authentic. Focus on simple, sweet aspects of companionship, love, and bringing calm to each other's day. Use British English (e.g. favourite, colour)."
          },
          {
            role: "user",
            content: "Write a sweet message of the day for Vanshika from Rishi."
          }
        ],
        temperature: 0.7,
        max_tokens: 120
      })
    });

    if (!response.ok) {
      throw new Error(`NVIDIA API returned status ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content.trim().replace(/^"|"$/g, '');
    return NextResponse.json({
      message: aiMessage,
      isGeneratedByAI: true
    });
  } catch (error: any) {
    console.error('NVIDIA API call failed, using fallback:', error.message);
    return NextResponse.json({
      message: getDailyFallbackMessage(),
      isGeneratedByAI: false,
      error: error.message
    });
  }
}
