import type { QuizQuestion } from "./data";

export type MatchBreakdown = {
  percentage: number;
  shared: string[];
  personality: number;
};

const categoryWeights: Record<QuizQuestion["category"], number> = {
  Personality: 1.4,
  Lifestyle: 1.2,
  Favourites: 1,
  Relationships: 1.3,
  Fun: 0.7,
};

export function scoreMatch(
  answers: number[],
  questions: QuizQuestion[],
  matchTags: string[],
): MatchBreakdown {
  const selected = questions.flatMap((item, index) => {
    const choice = item.options[answers[index]];
    return choice ? choice.tags.map((tag) => ({ tag, weight: categoryWeights[item.category], category: item.category })) : [];
  });
  if (!selected.length) return { percentage: 0, shared: [], personality: 0 };

  const tags = new Set(matchTags);
  const totalWeight = selected.reduce((sum, item) => sum + item.weight, 0);
  const sharedWeight = selected.reduce(
    (sum, item) => sum + (tags.has(item.tag) ? item.weight : 0),
    0,
  );
  const percentage = Math.min(98, Math.round(42 + (sharedWeight / totalWeight) * 120));
  const uniqueShared = [...new Set(selected.map((item) => item.tag).filter((tag) => tags.has(tag)))];
  const personalityItems = selected.filter((item) => item.category === "Personality");
  const personalityWeight = personalityItems.reduce((sum, item) => sum + item.weight, 0);
  const personalityShared = personalityItems.reduce(
    (sum, item) => sum + (tags.has(item.tag) ? item.weight : 0),
    0,
  );

  return {
    percentage,
    shared: uniqueShared.slice(0, 3),
    personality: Math.round((personalityShared / personalityWeight) * 100),
  };
}

export function answerSummary(answers: number[], questions: QuizQuestion[]): string {
  const tags = questions.flatMap((item, index) => item.options[answers[index]]?.tags ?? []);
  const counts = new Map<string, number>();
  for (const tag of tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  const highlights = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag]) => tag);

  if (!highlights.length) return "Thoughtful, curious, and wonderfully one of a kind.";
  return `You're ${highlights.join(", ")} at heart — the kind of person who makes connection feel like coming home.`;
}
