# Aprish website: persistent rules for the coding agent

Copy this file into your extension's rules location so it is loaded on every request
(for example `.clinerules`, `.roo/rules/`, `.continue/rules/` or `.github/copilot-instructions.md`,
depending on which VS Code extension you use with DeepSeek).

## What you are building
The public marketing site for **Aprish**, "the operating and growth OS for independent clinics".
The live product is **Aria**, a WhatsApp-first AI assistant that books patient appointments.
The site must feel premium, calm and clinical-warm, and must never claim more than the product does today.

## Stack (fixed)
- Vite 7, React 19, TypeScript (strict), Tailwind CSS v4 (tokens are in `src/styles/index.css` under `@theme`; there is NO `tailwind.config.js`)
- GSAP 3.13+ with `@gsap/react` (`useGSAP`), `react-router-dom` v7 (declarative `<BrowserRouter>`), `lucide-react`
- Fonts: Instrument Serif (display), DM Sans (UI/body), Space Mono (data only). Already linked in `index.html`.
- Do NOT add shadcn, Radix, framer-motion, MUI, Lenis, Three.js or any package not listed. If you believe you need one, stop and ask.

## Working method
1. Do exactly one phase from `docs/07_BUILD_PHASES.md` per request. Read only the docs that phase lists.
2. Output **complete files**. Never write `// ...rest unchanged`, `TODO`, or stub components.
3. After every phase run `npx tsc --noEmit` and `npm run build`. Both must pass before you say the phase is done. Then `git add -A && git commit -m "phase N"`.
4. If something in a spec is ambiguous, pick the simplest option that satisfies the acceptance checks and note it in one line. Do not silently change the design.

## Non-negotiables
- **Truth**: all copy comes from `src/content/copy.ts`. Feature status ("Live", "In development", "Planned") comes only from `src/content/status.ts`. Never hard-code a status, a number, a price, a testimonial or a clinic name. Never write UPI payments, Google-review routing, or "zero no-shows" claims (see `docs/03_CONTENT_AND_CLAIMS.md`).
- **Sample data** on the site (wall bookings, chat demo, hero card) is fictional and must be labelled "Sample" wherever it appears.
- **Motion**: GSAP inside `useGSAP` with proper cleanup. React StrictMode runs effects twice in dev, so every effect must clean up its rAF, listeners, observers and tweens. Check `prefers-reduced-motion` in JS as well as CSS.
- **Accessibility**: real `<button>`/`<a>`, visible focus, 4.5:1 text contrast (small coral text uses `coral-700`, never `peach-400`), alt text, one `<h1>` per route, keyboard access to every interaction.
- **Performance**: route-level code splitting with `React.lazy` for `/live` and `/black`. No layout shift. Cap canvas DPR at 2. Pause canvas/rAF loops when off-screen or the tab is hidden. Use `100dvh`, not `100vh`.
- **Never copy from `reference/`**: the K72 SVG logo, K72 images/video, Lausanne fonts, Replit config files, the shadcn `ui/` folder, or `PORT`/`BASE_PATH` env logic. Reference files are for reading logic only.
- Files under ~250 lines. Named exports for components. Import with the `@/` alias.
