export type QuizCategory = "Personality" | "Lifestyle" | "Favourites" | "Relationships" | "Fun";

export type QuizOption = {
  label: string;
  tags: string[];
};

export type QuizQuestion = {
  category: QuizCategory;
  prompt: string;
  options: QuizOption[];
};

const option = (label: string, ...tags: string[]): QuizOption => ({ label, tags });
const question = (
  category: QuizCategory,
  prompt: string,
  ...options: QuizOption[]
): QuizQuestion => ({ category, prompt, options });

export const quizQuestions: QuizQuestion[] = [
  question("Personality", "A perfect Saturday starts with…", option("A quiet morning and my favourite book", "cozy", "thoughtful"), option("A brunch table full of friends", "social", "food"), option("A new trail and no set plan", "outdoors", "adventurous"), option("A creative project I can get lost in", "creative", "independent")),
  question("Personality", "Your ideal weekend energy is…", option("A little bit of everything", "balanced", "playful"), option("Restful, with plenty of recharge time", "cozy", "thoughtful"), option("Out and about, meeting everyone", "social", "adventurous"), option("Focused on a passion project", "creative", "ambitious")),
  question("Personality", "How do you feel about grand romantic gestures?", option("The thoughtful little things win me over", "romantic", "thoughtful"), option("Love them—make it a movie moment", "romantic", "playful"), option("Sweet, as long as it feels genuine", "romantic", "independent"), option("I show love more quietly", "cozy", "thoughtful")),
  question("Personality", "When a disagreement pops up, you…", option("Talk it through calmly, as a team", "thoughtful", "communicative"), option("Need a moment, then come back to it", "independent", "communicative"), option("Try to make each other laugh first", "playful", "communicative"), option("Listen carefully before sharing my side", "thoughtful", "deep")),
  question("Personality", "Pick your kind of adventure.", option("A last-minute weekend flight", "travel", "adventurous"), option("A beautiful hike with a picnic", "outdoors", "adventurous"), option("Trying the new place around the corner", "food", "curious"), option("An unexpected plot twist in a great film", "film", "cozy")),
  question("Personality", "The plans are…", option("In my calendar, color-coded", "organized", "ambitious"), option("A rough idea and room to wander", "balanced", "adventurous"), option("Spontaneous—ask me when I'm dressed", "playful", "adventurous"), option("Whatever feels right in the moment", "independent", "creative")),
  question("Personality", "The little thing that makes you happiest?", option("A deep, unhurried conversation", "deep", "thoughtful"), option("Laughing until our faces hurt", "playful", "social"), option("A new place, a new memory", "travel", "adventurous"), option("A peaceful evening at home", "cozy", "pets")),
  question("Personality", "Your favourite way to show someone you care?", option("Words that mean what they say", "romantic", "communicative"), option("Making time for them", "thoughtful", "family"), option("Tiny, very specific surprises", "romantic", "creative"), option("A hug and a cup of something warm", "cozy", "food")),
  question("Lifestyle", "Your natural body clock says…", option("Sunrise is my happy hour", "morning", "outdoors"), option("A slow, gentle morning please", "morning", "cozy"), option("I come alive after dark", "night", "creative"), option("It depends on the adventure", "balanced", "adventurous")),
  question("Lifestyle", "Choose a season to keep forever.", option("Spring: everything is new", "spring", "outdoors"), option("Summer: long days and warm nights", "summer", "social"), option("Autumn: golden and unhurried", "autumn", "cozy"), option("Winter: candles, books, soft blankets", "winter", "cozy")),
  question("Lifestyle", "Your dream getaway looks like…", option("A tiny cabin among the trees", "travel", "outdoors"), option("A sun-drenched coastal town", "travel", "beach"), option("A hotel in a city I've never seen", "travel", "city"), option("A beautiful place to do absolutely nothing", "travel", "cozy")),
  question("Lifestyle", "Pick the view from your holiday room.", option("A blue ocean and sandy toes", "beach", "summer"), option("Mountains disappearing into clouds", "mountains", "outdoors"), option("A bustling city at night", "city", "night"), option("A garden in the quiet countryside", "countryside", "cozy")),
  question("Lifestyle", "A place that feels like home is…", option("A city with a thousand little places", "city", "social"), option("A quiet place with a big garden", "countryside", "pets"), option("Somewhere that mixes both", "balanced", "outdoors"), option("Wherever my favourite people are", "family", "romantic")),
  question("Lifestyle", "What might be on your soundtrack?", option("Feel-good pop I know every word to", "music", "playful"), option("Indie songs with a story behind them", "music", "creative"), option("A little bit of everything", "music", "balanced"), option("Smooth jazz and late-night records", "music", "night")),
  question("Lifestyle", "Pick your Friday night.", option("A blanket, snacks, and a brilliant film", "film", "cozy"), option("Somewhere I've never eaten before", "food", "social"), option("A gig, dancing, and losing my voice", "music", "social"), option("A long walk with no destination", "outdoors", "thoughtful")),
  question("Lifestyle", "The ideal weekend plan is…", option("Coffee and a long walk", "outdoors", "cozy"), option("Cooking something new together", "food", "romantic"), option("An art gallery or museum date", "creative", "thoughtful"), option("A day trip with a great playlist", "travel", "adventurous")),
  question("Favourites", "Pick a colour that feels like you.", option("Soft lavender", "creative", "cozy"), option("Warm golden yellow", "playful", "summer"), option("Deep forest green", "outdoors", "thoughtful"), option("Classic black", "style", "independent")),
  question("Favourites", "You can only keep one kind of food…", option("Comfort food, every single time", "food", "cozy"), option("Fresh things from a market stall", "food", "outdoors"), option("A whole world of flavours", "food", "adventurous"), option("Brunch. Brunch is a food group.", "food", "social")),
  question("Favourites", "Save you the last slice of…", option("Chocolate cake", "dessert", "romantic"), option("Freshly baked cookies", "dessert", "cozy"), option("Something fruity and bright", "dessert", "summer"), option("The dessert I haven't tried yet", "dessert", "adventurous")),
  question("Favourites", "Your spirit animal is probably…", option("A curious fox", "outdoors", "curious"), option("A sleepy cat in a sunbeam", "pets", "cozy"), option("A golden retriever with a tennis ball", "pets", "playful"), option("A tiny bird that goes everywhere", "pets", "adventurous")),
  question("Favourites", "A very serious question: cats or dogs?", option("Cats. Independent icons.", "cats", "cozy"), option("Dogs. Enthusiasm is contagious.", "dogs", "playful"), option("Both. I cannot choose.", "cats", "dogs"), option("Neither is my kind of pet", "independent", "quiet")),
  question("Favourites", "A flower that would make your day?", option("Peonies, soft and a little dramatic", "flowers", "romantic"), option("Sunflowers, impossible not to smile", "flowers", "playful"), option("Wildflowers, picked on a long walk", "flowers", "outdoors"), option("Roses, timeless for a reason", "flowers", "romantic")),
  question("Favourites", "Your usual order is…", option("Coffee, exactly how I like it", "coffee", "morning"), option("Tea, ideally with something sweet", "tea", "cozy"), option("A colourful fresh juice", "juice", "summer"), option("Something new on the menu", "curious", "adventurous")),
  question("Favourites", "Choose a film genre for the evening.", option("A rom-com with a happy ending", "film", "romantic"), option("A clever mystery to solve together", "film", "deep"), option("A fantasy world to get lost in", "film", "creative"), option("A comedy that gets a little ridiculous", "film", "playful")),
  question("Relationships", "Your ideal first date feels like…", option("Coffee and a walk that lasts hours", "coffee", "deep"), option("Dinner somewhere with candles", "food", "romantic"), option("A fun activity and easy laughter", "playful", "adventurous"), option("A gallery, bookshop, or little discovery", "creative", "thoughtful")),
  question("Relationships", "The greenest flag in your book?", option("Kindness when no one is watching", "kind", "thoughtful"), option("They can laugh at themselves", "playful", "kind"), option("Their words and actions line up", "honest", "communicative"), option("They make space for my big dreams", "ambitious", "kind")),
  question("Relationships", "What makes you feel most loved?", option("Hearing what I mean to them", "communicative", "romantic"), option("Uninterrupted time together", "thoughtful", "family"), option("A small, well-chosen surprise", "creative", "romantic"), option("A hand to hold, just because", "cozy", "romantic")),
  question("Relationships", "The relationship essential you value most?", option("Trust that feels like breathing", "honest", "family"), option("A shared sense of humour", "playful", "social"), option("Growing alongside each other", "ambitious", "thoughtful"), option("Feeling genuinely understood", "deep", "communicative")),
  question("Relationships", "Good communication is…", option("Everything—let's talk things through", "communicative", "deep"), option("Important, and best with good listening", "thoughtful", "communicative"), option("Being honest without being unkind", "honest", "kind"), option("Knowing we can be quiet together too", "cozy", "thoughtful")),
  question("Relationships", "Your kind of partner is someone who's…", option("Warm, funny, and a little bit goofy", "playful", "kind"), option("Curious and excited to explore", "curious", "adventurous"), option("Grounded, generous, and thoughtful", "thoughtful", "kind"), option("Independent, with a big bright life", "independent", "ambitious")),
  question("Relationships", "At dinner, you'd rather talk about…", option("Big questions, little truths", "deep", "thoughtful"), option("Our most ridiculous stories", "playful", "social"), option("A mix of both, with dessert", "balanced", "food"), option("Whatever we discover together", "curious", "communicative")),
  question("Relationships", "Loyalty means…", option("Showing up, especially on ordinary days", "honest", "family"), option("Being truthful even when it's hard", "honest", "communicative"), option("Cheering for each other's own lives", "independent", "ambitious"), option("Making a safe place for each other", "kind", "cozy")),
  question("Fun", "For one iconic movie night: magic or heroes?", option("A little magic and a lot of wonder", "fantasy", "creative"), option("Capes, quips, and saving the world", "heroes", "playful"), option("I'll bring snacks for both", "balanced", "food"), option("Something neither of you has seen", "curious", "film")),
  question("Fun", "Choose your road-trip philosophy.", option("Pick a place and map every stop", "organized", "travel"), option("One bag, good playlist, let's go", "adventurous", "travel"), option("Road trip, but let's find a cozy cabin", "cozy", "travel"), option("Staycation, but with excellent snacks", "food", "cozy")),
  question("Fun", "At the party, you'll be the one who…", option("Is first on the dance floor", "music", "social"), option("Starts the group singalong", "music", "playful"), option("Finds a good conversation in the kitchen", "deep", "thoughtful"), option("Makes a graceful exit for a quiet night", "independent", "cozy")),
  question("Fun", "Pick a fictional world to visit.", option("A cozy village full of magic", "fantasy", "cozy"), option("A far-off galaxy and its possibilities", "adventurous", "curious"), option("A city where every street has a story", "city", "creative"), option("A forest where the animals talk", "pets", "outdoors")),
  question("Fun", "A dream date that's very you?", option("Stargazing, with a blanket for two", "romantic", "cozy"), option("A food crawl and a shared dessert", "food", "playful"), option("A surprise trip to the coast", "travel", "adventurous"), option("Making each other a little playlist", "music", "romantic")),
  question("Fun", "A harmless little ick?", option("Being rude to the waitstaff", "kind", "thoughtful"), option("A phone out for the whole date", "communicative", "thoughtful"), option("Spoilers before I've seen the finale", "film", "playful"), option("Someone who says they hate all pets", "pets", "kind")),
  question("Fun", "Choose a dream celebrity dinner guest.", option("A brilliant musician with great stories", "music", "creative"), option("A funny actor who loves food", "film", "food"), option("Someone who's travelled everywhere", "travel", "curious"), option("A person who'd make everyone feel included", "kind", "social")),
  question("Fun", "The three words your person might use for you…", option("Warm, curious, wonderfully odd", "kind", "curious"), option("Funny, loyal, full of heart", "playful", "family"), option("Thoughtful, bold, a little dreamy", "thoughtful", "adventurous"), option("Creative, kind, always growing", "creative", "ambitious")),
];

export type Celebrity = {
  name: string;
  profession: string;
  description: string;
  tags: string[];
  gender: "woman" | "man";
  accent: string;
};

const women = [
  ["Sabrina Carpenter", "Singer & actor", "Witty pop sparkle, playful confidence, and a sharp sense of humour.", ["music", "playful", "creative", "social"]],
  ["Ariana Grande", "Singer & actor", "Big vocals, a love of pop, and a softly romantic streak.", ["music", "creative", "romantic", "pets"]],
  ["Jennifer Lawrence", "Actor", "Quick-witted, grounded energy with a delightfully unfiltered laugh.", ["film", "playful", "outdoors", "honest"]],
  ["Billie Eilish", "Singer & songwriter", "Imaginative, thoughtful, and never afraid of a different sound.", ["music", "creative", "independent", "deep"]],
  ["Zendaya", "Actor & producer", "Effortless style, focused ambition, and a quietly confident presence.", ["film", "style", "ambitious", "thoughtful"]],
  ["Emma Watson", "Actor & advocate", "Bookish curiosity, thoughtful conversation, and a kind heart.", ["film", "thoughtful", "deep", "ambitious"]],
  ["Taylor Swift", "Singer & songwriter", "A storyteller at heart who believes the details make the song.", ["music", "creative", "romantic", "thoughtful"]],
  ["Dua Lipa", "Singer", "Dance-floor energy, adventurous playlists, and a world-traveller's curiosity.", ["music", "adventurous", "social", "travel"]],
  ["Jenna Ortega", "Actor", "A playful dark sense of humour and a wonderfully independent spirit.", ["film", "playful", "independent", "creative"]],
  ["Florence Pugh", "Actor", "A warm home cook with bold energy and a wonderfully generous spirit.", ["film", "food", "playful", "kind"]],
  ["Anne Hathaway", "Actor", "Bright, big-hearted energy and a love of a good story.", ["film", "romantic", "kind", "creative"]],
  ["Margot Robbie", "Actor & producer", "Ambitious, curious, and always up for a fresh adventure.", ["film", "ambitious", "adventurous", "social"]],
  ["Selena Gomez", "Singer & actor", "Gentle humour, kindness, and a soft spot for meaningful connection.", ["music", "kind", "pets", "thoughtful"]],
  ["Olivia Rodrigo", "Singer & songwriter", "Heart-on-sleeve lyrics and the energy of a very good road trip.", ["music", "romantic", "creative", "travel"]],
  ["Sydney Sweeney", "Actor & producer", "A hands-on creative with a thoughtful, make-it-happen streak.", ["film", "creative", "ambitious", "outdoors"]],
  ["Anya Taylor-Joy", "Actor", "An artistic, curious spirit with an eye for the unexpected.", ["film", "creative", "curious", "style"]],
  ["Hailee Steinfeld", "Actor & singer", "Playful, driven, and happiest with a little music in the mix.", ["music", "film", "playful", "ambitious"]],
  ["Lily Collins", "Actor & producer", "Romantic, bookish charm with a soft spot for beautiful places.", ["film", "romantic", "travel", "creative"]],
  ["Deepika Padukone", "Actor & producer", "Poised confidence, grounded ambition, and an open-hearted outlook.", ["film", "ambitious", "thoughtful", "travel"]],
  ["Alia Bhatt", "Actor & producer", "Bright, warm energy and an easy love for life's little joys.", ["film", "playful", "kind", "family"]],
] as const;

const men = [
  ["Chico Lachowski", "Model", "Easygoing charm, a love of family time, and relaxed outdoors energy.", ["style", "family", "outdoors", "playful"]],
  ["Brad Pitt", "Actor & producer", "Creative curiosity, a taste for travel, and laid-back confidence.", ["film", "creative", "travel", "independent"]],
  ["Timothée Chalamet", "Actor", "Artsy, curious, and happiest talking about a film you just watched.", ["film", "creative", "curious", "deep"]],
  ["Henry Cavill", "Actor", "Thoughtful, quietly nerdy, and happiest with a loyal companion nearby.", ["film", "games", "pets", "thoughtful"]],
  ["Tom Holland", "Actor", "Playful, warm, and very much a let's-make-everyone-laugh kind of person.", ["film", "playful", "kind", "social"]],
  ["Ryan Gosling", "Actor & musician", "Soft-spoken charm, great music taste, and a dry little grin.", ["film", "music", "thoughtful", "romantic"]],
  ["Robert Pattinson", "Actor & musician", "Independent creative energy and an affection for the unexpected.", ["film", "creative", "independent", "music"]],
  ["Chris Evans", "Actor", "Big-hearted, loyal energy and an apparently excellent dog-dad vibe.", ["film", "pets", "family", "kind"]],
  ["Harry Styles", "Singer & actor", "Open-hearted, adventurous, and happy to dance like nobody's watching.", ["music", "playful", "style", "adventurous"]],
  ["Zayn Malik", "Singer", "A creative soul, independent streak, and late-night playlist person.", ["music", "creative", "independent", "night"]],
  ["Shawn Mendes", "Singer & songwriter", "Thoughtful acoustic energy and a love of a meaningful conversation.", ["music", "thoughtful", "outdoors", "deep"]],
  ["Jacob Elordi", "Actor", "A thoughtful film-buff side with a relaxed, understated presence.", ["film", "thoughtful", "independent", "creative"]],
  ["Cillian Murphy", "Actor", "Quietly curious, bookish, and interested in the stories behind people.", ["film", "deep", "thoughtful", "independent"]],
  ["Charles Leclerc", "Racing driver", "Ambitious, focused, and always ready for a little adrenaline.", ["adventurous", "ambitious", "travel", "music"]],
  ["Michael B. Jordan", "Actor & producer", "Driven, generous, and all in when a new challenge calls.", ["film", "ambitious", "playful", "kind"]],
  ["Dev Patel", "Actor & director", "Thoughtful curiosity, a worldly outlook, and a warm sense of humour.", ["film", "thoughtful", "travel", "kind"]],
  ["Ranbir Kapoor", "Actor", "Warm, playful energy and a soft spot for easygoing company.", ["film", "playful", "family", "romantic"]],
  ["Shahid Kapoor", "Actor", "Creative rhythm, lively energy, and a love of being on the move.", ["film", "music", "playful", "ambitious"]],
  ["Vicky Kaushal", "Actor", "Grounded, adventurous, and the kind of person who laughs easily.", ["film", "outdoors", "playful", "family"]],
  ["Sidharth Malhotra", "Actor", "Relaxed, outdoorsy energy with a thoughtful side.", ["film", "outdoors", "thoughtful", "travel"]],
] as const;

export const celebrities: Celebrity[] = [...women, ...men].map(([name, profession, description, tags]) => ({
  name,
  profession,
  description,
  tags: [...tags],
  gender: women.some(([womanName]) => womanName === name) ? "woman" : "man",
  accent: ["#e6ced5", "#cfc6de", "#ead8b4", "#cad7c7"][name.length % 4],
}));

export type Pet = {
  name: string;
  kind: "cat" | "dog";
  type: string;
  description: string;
  tags: string[];
  image: string;
};

export const pets: Pet[] = [
  { name: "Miso", kind: "cat", type: "Playful kitten", description: "Part-time zoomies champion. Full-time tiny shadow.", tags: ["cats", "playful", "curious"], image: "photo-1514888286974-6c03e2ca1dba" },
  { name: "Sunny", kind: "cat", type: "Lazy orange cat", description: "Believes the sunbeam is a personal invitation to nap.", tags: ["cats", "cozy", "quiet"], image: "photo-1533738363-b7f9aef128ce" },
  { name: "Duchess", kind: "cat", type: "Fluffy Persian cat", description: "A gentle cloud with strong opinions about lap comfort.", tags: ["cats", "cozy", "gentle"], image: "photo-1573865526739-10659fec78a5" },
  { name: "Maple", kind: "dog", type: "Golden Retriever", description: "Will greet you like you just came back from a world tour.", tags: ["dogs", "playful", "social"], image: "photo-1552053831-71594a27632d" },
  { name: "Pickles", kind: "dog", type: "Corgi", description: "Very short legs. Absolutely enormous main-character energy.", tags: ["dogs", "playful", "social"], image: "photo-1517849845537-4d257902454a" },
  { name: "Nori", kind: "dog", type: "Husky", description: "Adventurous, expressive, and possibly composing a song.", tags: ["dogs", "adventurous", "outdoors"], image: "photo-1605568427561-40dd23c2acea" },
  { name: "Biscuit", kind: "dog", type: "Labrador", description: "A loyal best friend who thinks every walk is the best walk.", tags: ["dogs", "family", "playful"], image: "photo-1548199973-03cce0bbc87b" },
  { name: "Yuzu", kind: "dog", type: "Shiba Inu", description: "Independent little explorer with impeccable personal style.", tags: ["dogs", "independent", "curious"], image: "photo-1551717743-49959800b1f6" },
];
