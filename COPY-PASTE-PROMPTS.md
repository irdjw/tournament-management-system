# 🚀 Copy/Paste Prompts for Claude CLI

Just copy these prompts and paste into Claude CLI. All details are in your docs folder.

---

## Setup

```bash
cd ~/projects/tournament-management-system
```

---

## Phase 1: Foundation (20 min) - Use Opus

```bash
claude --model claude-opus-4-5-20250514
```

**Paste this:**

```
Initialize tournament management system following implementation-guide.md Week 1.

SETUP:
- SvelteKit (JavaScript only, no TypeScript)
- Install: @supabase/supabase-js, @supabase/auth-helpers-sveltekit, date-fns, @vite-pwa/sveltekit
- Create folder structure from folder-structure.md
- Create .env, .env.example, .gitignore, netlify.toml
- Create supabaseClient.js and hooks.server.js

STYLE:
- Follow STYLE_GUIDE.md (British English, mobile-first)
- Reference folder-structure.md for organization

Execute all steps without stopping. After completion, I'll paste my Supabase credentials.
```

**When prompted, paste your credentials from CREDENTIALS.txt**

---

## Phase 2: Database (30 min) - Use Opus

**First, run manually:**
```bash
supabase init
supabase link --project-ref YOUR_PROJECT_ID
```

**Then paste this:**

```
Create database schema and authentication following implementation-guide.md Week 1.

DATABASE:
- Reference database-schema.sql for complete schema
- Create migration: supabase/migrations/20250130000000_initial_schema.sql
- All 10 tables: users, game_types, venues, players, tournaments, tournament_players, matches, legs, turns, darts
- RLS policies from database-schema.sql
- Apply with: supabase db push

AUTHENTICATION:
- auth.service.js: signIn, signOut, getCurrentUser, getSession
- auth.store.js: user and session stores
- Login page at routes/(public)/login/+page.svelte
- Auth guards for admin and scorer routes
- Admin dashboard at routes/admin/(authenticated)/+page.svelte

STYLE:
- British English from STYLE_GUIDE.md
- Mobile-first design

Execute all without stopping.
```

**After completion, create admin user manually in Supabase dashboard**

---

## Phase 3A: Players (45 min) - Use Sonnet

```bash
claude --model claude-sonnet-4-5-20250929
```

**Paste this:**

```
Build complete player management following implementation-guide.md Week 2.

PLAYER SERVICE (src/lib/services/player.service.js):
- createPlayer, getPlayers, getPlayer, updatePlayer, deletePlayer
- Reference API_REFERENCE.md for patterns

SHARED COMPONENTS (src/lib/components/shared/):
- Button.svelte (variants: primary, secondary, danger, success)
- Input.svelte (with validation, error display)
- Modal.svelte (backdrop, escape key, slots)
- Toast.svelte with toast.store.js
- Reference COMPONENTS.md for specs

PLAYER PAGES:
- List: routes/admin/(authenticated)/players/+page.svelte
- Create: routes/admin/(authenticated)/players/create/+page.svelte
- Edit: routes/admin/(authenticated)/players/[id]/+page.svelte

STYLE:
- British English ("Colour", "Organise")
- Mobile-responsive tables
- Touch targets 44px minimum
- Loading states, error handling

Execute all without stopping.
```

---

## Phase 3B: Tournaments (60 min) - Use Opus

```bash
claude --model claude-opus-4-5-20250514
```

**Paste this:**

```
Build tournament and bracket system following implementation-guide.md Week 2.

SERVICES:
- tournament.service.js: createTournament, getTournaments, getTournament, addPlayerToTournament, updateTournamentStatus
- bracket.service.js: generateKnockoutBracket (seeding: 1v8, 2v7, 3v6, 4v5)
- match.service.js: getMatches, assignMatchToScorer, recordMatchWinner, advanceWinnerToNextMatch

TOURNAMENT PAGES:
- List: routes/admin/(authenticated)/tournaments/+page.svelte
- Create: routes/admin/(authenticated)/tournaments/create/+page.svelte
- Detail: routes/admin/(authenticated)/tournaments/[id]/+page.svelte
- Bracket: routes/admin/(authenticated)/tournaments/[id]/bracket/+page.svelte

COMPONENTS (src/lib/components/admin/):
- TournamentCard.svelte
- BracketView.svelte (visual bracket by rounds)
- MatchCard.svelte

BRACKET LOGIC:
- Traditional seeding algorithm
- feeds_into_match_id relationships
- Round numbers (1=final, 2=semi, etc.)
- Winner progression

STYLE:
- British English
- Mobile-responsive bracket
- Color-coded match statuses

Execute all without stopping.
```

---

## Phase 3C: Scorer (90 min) - Use Opus

```bash
claude --model claude-opus-4-5-20250514
```

**Paste this:**

```
Build mobile PWA scorer interface following implementation-guide.md Week 3.

CRITICAL: Everything must fit on screen without scrolling on iPhone SE (375px width)

SCORING UTILITIES (src/lib/utils/scoring.utils.js):
- calculateDartValue(multiplier, number)
- isBust(currentScore, dartValue, checkoutRequired)
- isCheckout(currentScore, dartValue)
- calculateAverages(darts)

SCORING SERVICE (src/lib/services/scoring.service.js):
- startLeg, recordDart, completeTurn, completeLeg, completeMatch

REALTIME SERVICE (src/lib/services/realtime.service.js):
- subscribeToMatch(matchId, callback)
- Listen to legs, turns, darts tables

SCORER PAGES:
- Dashboard: routes/scorer/(authenticated)/+page.svelte (list assigned matches)
- Match: routes/scorer/(authenticated)/match/[id]/+page.svelte

SCORER INTERFACE LAYOUT (NO SCROLLING):
- Player scores (large, prominent)
- Turn indicator (🎯🎯⚫)
- Number grid (1-20 + Bull, 44px touch targets)
- Multiplier selector (Single | Double | Treble)
- Current turn score
- Undo button
- Submit turn button

SCORER COMPONENTS (src/lib/components/scorer/):
- NumberGrid.svelte (1-20 + 25)
- MultiplierSelector.svelte
- Scoreboard.svelte
- TurnHistory.svelte (collapsible)

CRITICAL STYLING:
- Use 100dvh (not 100vh) for viewport
- All touch targets 44x44px minimum
- High contrast colors
- No horizontal scrolling
- Test at 375px width

Execute all without stopping.
```

---

## Phase 4: PWA & Polish (60 min) - Use Sonnet

```bash
claude --model claude-sonnet-4-5-20250929
```

**Paste this:**

```
Configure PWA and final polish following implementation-guide.md Week 4.

PWA CONFIGURATION:
- Update vite.config.js with @vite-pwa/sveltekit
- Create static/manifest.json (name: "Tournament Manager", theme: #2E7D32)
- Service worker with autoUpdate
- Placeholder icons at static/icons/ (192x192, 512x512)

MATCH ASSIGNMENT:
- Add assign scorer functionality to match detail
- Assignment modal component
- Update match service

REAL-TIME ADMIN VIEW:
- Subscribe to match updates in admin bracket view
- Live score display
- Unsubscribe on component destroy

WINNER PROGRESSION:
- Complete advanceWinnerToNextMatch logic
- Update bracket on match completion
- Handle tournament completion

POLISH:
- Error boundaries
- Loading spinners
- Toast notifications
- ConfirmDialog.svelte component
- Checkout suggestions utility

FINAL CHECK:
- No scrolling on scorer interface
- All buttons 44px minimum
- British English throughout
- Mobile-responsive everything

Execute all without stopping.
```

---

## Testing & Deployment

**Test locally:**
```bash
npm run build
npm run preview
```

**Deploy to Netlify:**
1. Push to GitHub
2. Connect repository in Netlify dashboard
3. Add environment variables
4. Deploy automatically

**Update Supabase auth URLs to your Netlify domain**

---

## Quick Reference

| Phase | Time | Model | What It Builds |
|-------|------|-------|----------------|
| 1 | 20 min | Opus | Project structure, configs |
| 2 | 30 min | Opus | Database, authentication |
| 3A | 45 min | Sonnet | Player CRUD |
| 3B | 60 min | Opus | Tournaments, brackets |
| 3C | 90 min | Opus | Mobile scorer PWA |
| 4 | 60 min | Sonnet | PWA config, polish |

**Total: ~6 hours → Complete production system** 🎉
