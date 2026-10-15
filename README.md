# Quran Clips website

A small static site: a landing page, a privacy page, and a contact page for bug reports and feature requests. Plain HTML, CSS and a little JavaScript. No build step, no framework, no third-party requests (fonts and images are local; there are no analytics).

```
index.html     landing page
contact.html   bug report / feature request form
privacy.html   what the app and the site do with information
config.js      the two settings you edit when you deploy
style.css      the look (the same tokens as the app: quran-clips/docs/DESIGN.md)
main.js        theme toggle and the contact form
assets/        three example shorts and the logo
fonts/         Amiri Quran, Newsreader, Instrument Sans (SIL Open Font License)
```

## Look at it

```bash
python3 -m http.server 8099      # then open http://localhost:8099
```

## How the contact form works

The form posts to your Quran Clips server, `POST /api/feedback` (`server/src/feedback.ts` in the `quran-clips` repo). The server checks it, keeps it in a file, and can tell you about it.

- **Set the address.** In `config.js`, set `apiUrl` to your server (use `https` in production). Optionally set `contactEmail` to show an address on the page. It is empty by default: nothing is published that you did not choose.
- **Read the reports.** On the server: `npm run feedback` (all), or `npm run feedback -- bug` (also `feature`, `other`). They are in `server/.feedback/feedback.jsonl`, one per line.
- **Be told.** Set `FEEDBACK_WEBHOOK_URL` to a Slack or Discord incoming-webhook address and each report is posted there.
- **Limit who can post (optional).** `FEEDBACK_ORIGINS=https://your-site.example` (comma-separated). Empty means any site, which is fine for a public form.
- **Spam.** A hidden field that people never see traps bots (they are told it worked and nothing is kept); there is a limit of 6 reports an hour per sender (`MAX_FEEDBACK_PER_HOUR`); messages are capped at 4000 characters.
- **Privacy.** Kept: the message, the type, and an email / phone model / app version only if the sender typed them. Not kept: IP address, browser. The server's request log records what was asked for, never who asked. The sender's address is held in memory for up to an hour for the rate limit, then forgotten. `privacy.html` says exactly this; if you change any of it, change that page first.

**After pulling these changes, restart the server.** An older running server will answer the form with "not found".

## Put it online

This repository is the site. `index.html` is at the root, and links are relative, so GitHub Pages can publish the `main` branch from `/`.

1. On GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**. Branch: `main`. Folder: `/ (root)`.
2. The site is then at `https://<user>.github.io/quran-clips-website/`. A file named `.nojekyll` is in the repo so Pages serves these files as they are.
3. Set `apiUrl` in `config.js` to your server (`https` in production) and push that change.
4. Put the app's link to it in the app: build the app with `EXPO_PUBLIC_SITE_URL=https://<user>.github.io/quran-clips-website`, and Settings shows "Report a bug or suggest a feature".
5. Replace "Coming soon" on the landing page with your store links when the app is published.

Cloudflare Pages, Netlify, or any static host can serve this same folder.

## Keep it true

With this repo checked out beside the app (`../quran-clips-website` from `quran-clips`), `cd app && npm test` also checks this site: every verse on it is exactly the app's checked Arabic, it loads nothing from other sites (the privacy page promises that), every file it refers to exists, and the contact form sends the fields the server expects.

The example shorts were made by the app's own renderer, Arabic only (no translation text is republished): `cd server && npx tsx scripts/site-frames.ts` writes them into this repo's `assets/`.

## Before you publish

- Read `privacy.html` once more against how you actually deploy. It describes the app as it is built today.
- Add your own contact route if you want email replies (`contactEmail`), and decide who reads `npm run feedback`.
- The app store badges and the "Coming soon" card are placeholders.
