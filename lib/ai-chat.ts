import type { FictionalProfile } from "./fictional-profiles";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type ChatTurn = Pick<ChatMessage, "role" | "content">;

const stopWords = new Set([
  "about", "after", "again", "also", "and", "are", "because", "been", "could",
  "from", "have", "just", "like", "love", "make", "that", "them", "then",
  "there", "they", "this", "what", "when", "where", "which", "with", "would",
  "your", "you", "hey", "hello", "how", "doing", "tell", "today",
]);

function topicFrom(message: string) {
  return message
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word))
    .slice(0, 3)
    .join(" ");
}

export function makeDemoReply(profile: FictionalProfile, history: ChatTurn[]) {
  const lastUserMessage = [...history].reverse().find((message) => message.role === "user");
  const userTurn = history.filter((message) => message.role === "user").length;
  const trait = profile.personality[userTurn % profile.personality.length];
  const hobby = profile.hobbies[(userTurn + profile.name.length) % profile.hobbies.length];
  const food = profile.favoriteFood.toLowerCase();

  if (!lastUserMessage) {
    return `Hey, I'm ${profile.name}! I'm a ${profile.personality[0]} ${profile.profession.toLowerCase()} who is currently into ${hobby}. What is something you've been enjoying lately?`;
  }

  const text = lastUserMessage.content.toLowerCase();
  const topic = topicFrom(lastUserMessage.content);

  if (/\bhow are you\b|\bhow's it going\b|\bhow are things\b/.test(text)) {
    return `Pretty good, thanks for asking! I just wrapped up ${hobby}, which is very on-brand for my ${trait} side. How has your day been treating you?`;
  }
  if (/\bwhat do you (like|enjoy|do)\b|\byour hobbies\b/.test(text)) {
    return `Outside of work, I make time for ${hobby} and ${profile.hobbies[(userTurn + 1) % profile.hobbies.length]}. Being ${trait} keeps life interesting. What do you reach for when you have a free afternoon?`;
  }
  if (/\bfood\b|\beat\b|\bdinner\b|\bcook\b/.test(text)) {
    return `${profile.favoriteFood} is my current favourite, though I'm always curious about someone else's comfort food. Have you got a dish you could happily eat every week?`;
  }
  if (/\bmusic\b|\bsong\b|\bplaylist\b|\bband\b/.test(text)) {
    return `My usual soundtrack is ${profile.musicPreferences.toLowerCase()}. I like how the right song can change a whole evening. What have you had on repeat?`;
  }
  if (/\bdate\b|\brelationship\b|\bpartner\b|\bcommitment\b/.test(text)) {
    return `That matters to me too. ${profile.relationshipPreferences} What does a really good connection look like to you?`;
  }
  if (/\bwhere\b|\blive\b|\bcity\b|\btravel\b|\btrip\b/.test(text)) {
    return `I'm in ${profile.location}, and ${hobby} is one of my favourite ways to get to know a place. Is there somewhere you'd love to visit again?`;
  }
  if (/\bcolour\b|\bcolor\b|\bfavourite\b|\bfavorite\b/.test(text)) {
    return `Lately I'm drawn to ${profile.favoriteColor.toLowerCase()} — maybe because it feels a little like ${hobby}. What's a favourite of yours that never gets old?`;
  }

  const openers = [
    `That's a lovely thing to share. My ${trait} side is curious about it.`,
    `I like the way you put that. It makes me think of ${hobby}.`,
    `That gives me something to think about. I tend to be pretty ${trait}, so I notice those details.`,
    `Now you've got me curious${topic ? ` about ${topic}` : ""}.`,
  ];
  const followUps = [
    `What's your take on it?`,
    `How did you get into that?`,
    `Is that something you do often?`,
    `I'd love to hear the story behind it.`,
  ];
  const index = (userTurn + profile.name.length) % openers.length;
  return `${openers[index]} ${followUps[(userTurn + profile.personality.length) % followUps.length]}${food ? ` (I might bring ${food}.)` : ""}`;
}
