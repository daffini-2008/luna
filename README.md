# Luna's Matrimony

A playful matchmaking demo built with Next.js App Router, TypeScript, Tailwind CSS, Framer Motion and Lucide. It includes a 40-question quiz, deterministic answer-based compatibility, 32 fictional adult AI characters with unique synthetic portraits, swipe controls, simulated character chat, clickable local notifications, celebrity-inspired entertainment matches, pet profiles, filters, and a light/dark theme.

## Run locally

```sh
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Run `npm run build` for a production build and `npm run lint` for ESLint.

## Demo privacy and behavior

This is a demo, not a live dating service. Profile details, quiz answers, preferences, likes, passes, favorites, conversations, theme and notifications are stored in this browser's local storage. The 32 adult match profiles are fictional AI characters; their unique synthetic portraits are bundled in `public/ai-portraits/` and sourced from This Person Does Not Exist. The profiles are not real people. Character replies and simulated presence are clearly labelled; likes, matches, replies and notifications are local demo events and are never sent to real people. Celebrity matches are fictional entertainment only; celebrity portraits are requested from Wikimedia Commons only when a freely reusable license is available and link to creator, license and source details. Pet portraits use Unsplash-hosted photos.

Without an AI API key, chat uses a clearly labelled, profile-specific demo reply generator. To enable server-side OpenAI replies, set `OPENAI_API_KEY` (and optionally `OPENAI_MODEL`) in the local server environment before starting Next.js. The key is read only by `app/api/ai-chat/route.ts` and is never included in the browser bundle. When configured, conversation text is sent to the configured OpenAI API; otherwise chat stays in local demo mode.

The profile form checks that members are at least 18. Profile photos are optional, limited to 1 MB, and remain in the browser. The demo has no login, server-side profile storage, or real notifications.

## Architecture for real accounts

For a production launch, keep the current matching and presentation layers but replace browser-only persistence with an authenticated API and a relational database:

- Use a managed PostgreSQL database with migrations and row-level access policies.
- Authenticate with a maintained OIDC provider (or Auth.js with a provider); do not store passwords in application tables. Require server-side adult-age verification before enabling discovery.
- Store private account and profile fields separately from public discovery fields. Use private object storage for member photos, with signed upload URLs and moderation.
- Model quiz answers by `(user_id, question_id)`, and version quiz questions so scoring can be reproduced. Store preference settings separately from public profile details.
- Persist likes and passes as user-to-profile interactions with uniqueness constraints. Create a mutual match only when both consenting, active users have liked each other.
- Deliver notifications only for those mutual matches or other explicitly consented member interactions. Celebrity and pet entertainment cards must never enter the notification pipeline.
- Enforce blocking, reporting, rate limits, retention/deletion requests, and audit logging on the server. Keep secret keys out of browser bundles.

The current local demo intentionally does not implement real user accounts, human-to-human messaging, or production notifications.
