import { NextResponse } from "next/server";
import { makeDemoReply, type ChatTurn } from "@/lib/ai-chat";
import { fictionalProfiles } from "@/lib/fictional-profiles";

type RequestMessage = {
  role: "user" | "assistant";
  content: string;
};

function isRequestMessage(value: unknown): value is RequestMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.length > 0 &&
    message.content.length <= 1000;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Send a valid chat request." }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Send a valid chat request." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const profile = fictionalProfiles.find((item) => item.id === input.profileId);
  if (!profile || !Array.isArray(input.messages) || input.messages.length > 20 ||
    !input.messages.every(isRequestMessage)) {
    return NextResponse.json({ error: "This fictional profile or chat history is invalid." }, { status: 400 });
  }

  const messages = input.messages as RequestMessage[];
  if (messages.length > 0 && messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "A new user message is required." }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const history: ChatTurn[] = messages.map(({ role, content }) => ({ role, content }));
    return NextResponse.json({ reply: makeDemoReply(profile, history), mode: "demo" });
  }

  const systemPrompt = [
    `You are ${profile.name}, a clearly fictional AI character in a matchmaking demo. You are ${profile.age}, an adult, and your profile says you are a ${profile.profession} in ${profile.location}.`,
    `Personality: ${profile.personality.join(", ")}. Hobbies: ${profile.hobbies.join(", ")}. Music: ${profile.musicPreferences}.`,
    `Relationship preferences: ${profile.relationshipPreferences}`,
    "Be warm, specific, concise, and ask at most one natural follow-up question. Use conversation history for context.",
    "Never claim to be a real person, a human, or online in the real world. If asked, clearly say you are a fictional AI character in this demo.",
    "Do not claim to have performed real-world actions, sent real notifications, or contacted anyone.",
  ].join("\n");
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...(messages.length
          ? messages.map(({ role, content }) => ({ role, content }))
          : [{ role: "user", content: "Start the conversation with a friendly, profile-specific hello." }]),
      ],
      max_tokens: 180,
      temperature: 0.8,
    }),
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "The configured chat service couldn't reply. Please try again." }, { status: 502 });
  }

  const result: unknown = await response.json();
  if (!result || typeof result !== "object" || !("choices" in result) ||
    !Array.isArray(result.choices) || !result.choices[0] ||
    typeof result.choices[0] !== "object" || !("message" in result.choices[0]) ||
    !result.choices[0].message || typeof result.choices[0].message !== "object" ||
    !("content" in result.choices[0].message) ||
    typeof result.choices[0].message.content !== "string") {
    return NextResponse.json({ error: "The configured chat service returned an invalid reply." }, { status: 502 });
  }

  return NextResponse.json({ reply: result.choices[0].message.content, mode: "ai" });
}
