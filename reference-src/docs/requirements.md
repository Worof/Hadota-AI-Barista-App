# Requirements coverage

Done = built and tested. Partial = built with a stated limit. Open = waiting on you or a server.

| Requirement | Where | Status |
|---|---|---|
| Opening "أيوة جاااي" at every app open, with café ambience | `Splash`, `voice/ambience.ts`, `App.tsx enter()` | Done for ambience (your recording, seamless loop). Voice: needs the clips from `scripts/render_voicetut.py` (VoiceTut male voice); until then the device voice is used |
| Egyptian male voice for every line, including the user's name | `voice/audio.ts`, `scripts/voice-lines.mjs` | Partial: ready, waiting for clips; ~150 common names have name clips |
| Origin choice removed from the flow | `engine/questions.ts` | Done; origins still shown in results and in the shop |
| Caption starts with the audio, slower readable typing | `Typed.tsx`, `say()` | Done (tested; confirm by ear on your device) |
| Home page with header, hero, footer | `Site.tsx` | Done |
| Header: Home, Community, Shop now, Blog, Ask Hadota | `Site.tsx`, hash routing | Done |
| Name entry; session saved per user; Hadota uses the name | `user/store.ts` | Done on this device. Not synced across devices (needs accounts and a server) |
| Community "قهوة الحكواتية" for coffee addicts | `Pages.tsx` | Partial: join with cups/day, badge, weekly challenge, posts saved locally. A shared feed needs a backend |
| Shop now | `Pages.tsx` | Partial: browse all beans, bag, copyable order request. No prices, payment or delivery yet |
| Blog | `content/blog.ts` | Done (5 guides) |
| Learns each user from rewards and penalties | `engine/learn.ts`, `recommend.ts` | Done: LinUCB contextual bandit per user, ratings = reward/penalty, quick "try again" = small penalty. Cross-user learning needs a server |
| Bean types and origins | `content/beans.ts` | Done: 24 beans, 4 species, 20+ countries. Confirm real stock |
| Flavors | `content/catalog.ts` | Done: 31 flavors in 7 families (SCA wheel) |
| Add-ons question | `engine/questions.ts` | Done: syrups, sauces, spices, toppings, extras (varies by drink) |
| Drink types served everywhere | `content/drinks.ts` | Done: 36 drinks, hot and iced |
| Hot or cold | first question | Done |
| Acidity, body, aroma, roast, grind in questions and result | `questions.ts`, `ResultCard.tsx` | Done |
| Adaptive question series | `nextQuestion()` | Done, tested (Turkish coffee, latte, filter paths differ) |
| Removed disclaimer and no-voice notice | UI | Done, tested |
| Approved character | `HadotaRig.tsx` | Done (first illustration, refine later) |
| Microphone input | not built | Open |
| Family mode | not built | Open |
| Felfel font | `styles.css`, `public/fonts/` | Open: supply the licensed file |
| No brand name in code or assets | `check-brand-free.mjs` in CI | Done |
