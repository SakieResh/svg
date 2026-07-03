# StudySphere — Setup Guide

This turns your site into a fully working app: real accounts, a real AI tutor,
hosted for free on GitHub Pages, installable as a PWA.

## 0. What's in this folder

```
index.html                       the whole site (one page)
css/style.css                    all styling
js/script.js                     all behavior (nav, chat, auth, PWA)
js/supabase-config.js            <-- you edit this with your project's keys
manifest.json + service-worker.js + icons/   PWA files
assets/                          your logo + images
supabase/functions/ai-chat/      the server-side AI proxy (Edge Function)
```

## 1. Replace your GitHub repo contents

From your computer (with git installed):

```bash
git clone https://github.com/SakieResh/studyspherebysvg.git
cd studyspherebysvg
# delete everything except .git, then copy in all files from this folder
# (on Mac/Linux):
find . -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +
# now copy the contents of the folder I gave you into this directory
git add -A
git commit -m "Rebuild as plain HTML/CSS/JS, fix bugs, add Supabase + PWA"
git push
```

(If you'd rather keep this as a separate repo from the Lovable one, that's fine too — just `git init` in this folder, add a remote, and push.)

## 2. Create your free Supabase project (real accounts + database)

1. Go to **supabase.com** → sign up free → **New Project**.
2. Once it's created, go to **Project Settings → API**.
3. Copy the **Project URL** and the **anon / public** key.
4. Open `js/supabase-config.js` and paste them in:
   ```js
   SUPABASE_URL: "https://xxxxx.supabase.co",
   SUPABASE_ANON_KEY: "eyJhbGc...",
   AI_CHAT_ENDPOINT: "https://xxxxx.supabase.co/functions/v1/ai-chat",
   ```
5. In Supabase, go to **Authentication → Providers** and make sure **Email** is enabled (it is by default). That's it — signup, login, and "forgot password" in the site will now work for real, including the confirmation/reset emails Supabase sends automatically.
6. Optional: **Authentication → URL Configuration** → set your **Site URL** to your final GitHub Pages URL once you have it (step 4), so password-reset links point to the right place.

## 3. Deploy the AI tutor (Supabase Edge Function)

This keeps your AI API key secret — it never reaches the browser.

1. Get a free/low-cost API key:
   - Anthropic: console.anthropic.com → API Keys (new accounts get starter credit)
   - or OpenAI: platform.openai.com → API Keys
2. Install the Supabase CLI (one-time): see `supabase.com/docs/guides/cli` for your OS.
3. From this project folder:
   ```bash
   supabase login
   supabase link --project-ref xxxxx        # the ref is in your project URL
   supabase functions deploy ai-chat
   supabase secrets set AI_API_KEY=sk-your-real-key-here
   ```
4. The function defaults to Anthropic's Claude. To use OpenAI instead, open `supabase/functions/ai-chat/index.ts` and swap the commented-out OPENAI block in for the ANTHROPIC block (instructions are right in the file).
5. Test it: reload your site, the chat note under the tutor box should disappear, and SVG Tutor will give real AI answers.

If you skip this step, the chatbot still works using built-in canned replies — it just won't be "real" AI until you deploy the function.

## 4. Host it free on GitHub Pages

1. In your GitHub repo: **Settings → Pages**.
2. Under "Build and deployment", set **Source: Deploy from a branch**.
3. Branch: `main`, folder: `/ (root)`. Save.
4. After a minute, your site is live at `https://sakieresh.github.io/studyspherebysvg/`.
5. Go back to Supabase **Authentication → URL Configuration** and set that as your Site URL + add it to Redirect URLs, so login/reset emails link back correctly.

## 5. PWA — install on phones/desktop

This is already wired up (manifest + service worker + icons). Once the site is live on GitHub Pages (PWAs require HTTPS, which Pages gives you automatically):

- **Android (Chrome):** visit the site → menu → "Install app" (or the install banner that appears automatically).
- **iPhone (Safari):** visit the site → Share button → "Add to Home Screen" (iOS doesn't support the automatic install prompt, this is the standard way).
- **Desktop (Chrome/Edge):** an install icon appears in the address bar, or use the in-page "Install" banner.

To double check it qualifies as a proper PWA: open the site in Chrome → DevTools → **Application** tab → **Manifest**, and run a **Lighthouse** PWA audit.

## 6. Local testing before you push

From this folder:
```bash
python3 -m http.server 8000
```
Then open `http://localhost:8000`. (Service workers need a real server, not a double-clicked file — this is why.)

---

**Troubleshooting**
- Chat shows the "demo mode" note → the Edge Function isn't deployed/secret isn't set yet (step 3).
- Signup/login shows a red error about the backend → `supabase-config.js` still has placeholder values (step 2).
- Install banner never appears → it only shows on supported browsers over HTTPS, and only if you haven't dismissed it before (it remembers via localStorage).
