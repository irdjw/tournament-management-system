# Tournament Management System
## Complete Implementation Guide

**Multi-Sport Tournament & PWA Scorer**

---

**Developer:** David  
**Timeline:** 4 Weeks (January-February 2025)  
**Technology:** SvelteKit + Supabase + Netlify

---

<div style="page-break-before: always;"></div>

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites & Setup](#prerequisites)
3. [Database Architecture](#database)
4. [Week 1: Foundation & Authentication](#week1)
5. [Week 2: Tournament Management](#week2)
6. [Week 3: Match Scoring System](#week3)
7. [Week 4: Polish & Production](#week4)
8. [Troubleshooting Common Issues](#troubleshooting)
9. [Post-MVP: Future Enhancements](#future)
10. [Appendices](#appendices)

<div style="page-break-before: always;"></div>

## 1. Introduction {#introduction}

### 1.1 Project Overview

You are building a professional tournament management system with:

- Web admin panel for tournament organisers
- Mobile-first PWA scorer for real-time match scoring
- Multi-sport support (darts initially, expandable to pool, snooker)
- Role-based user hierarchy (system admin → venue admin → tournament admin → scorer → player)
- Real-time score updates via Supabase
- Dart-by-dart granular scoring with full statistics

### 1.2 Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | SvelteKit (JavaScript) | Both admin web app and PWA scorer |
| Database | Supabase (PostgreSQL) | Data storage + auth + real-time |
| Hosting | Netlify | Deployment and CDN |
| PWA | @vite-pwa/sveltekit | Progressive Web App capabilities |
| Development | VS Code + Claude CLI | Fast development with AI assistance |

<div style="page-break-before: always;"></div>

## 2. Prerequisites & Setup {#prerequisites}

### 2.1 Required Software

Before starting, ensure you have:

- Node.js v18 or higher
- Git
- VS Code
- Claude CLI (for AI-assisted development)

### 2.2 Install Supabase CLI

The Supabase CLI is essential for database migrations:

```bash
npm install -g supabase
```

Verify installation:

```bash
supabase --version
```

<div style="page-break-before: always;"></div>

## 3. Database Architecture {#database}

### 3.1 High-Level Structure

Your database is designed for multi-sport flexibility from day one:

```
GAME_TYPES (darts, pool, snooker)
    ↓ uses
TOURNAMENTS
    ↓ contains
MATCHES
    ↓ contains
LEGS
    ↓ contains
TURNS (3 darts per turn)
    ↓ contains
DARTS (individual dart: multiplier × number)
```

### 3.2 Core Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| users | System/venue/tournament admins, scorers, players | role, email, created_by |
| game_types | Sport definitions (darts, pool, etc.) | name, scoring_system, config |
| venues | Physical tournament locations | name, managed_by |
| players | Tournament participants | name, email, user_id |
| tournaments | Main tournament container | game_type_id, format, status |
| tournament_players | Player registration | tournament_id, player_id |
| matches | Individual games | players, round, status, winner |
| legs | Scoring units (e.g., 501 leg) | match_id, leg_number, winner |
| turns | Player throws (3 darts) | leg_id, player_id, turn_total |
| darts | Individual dart throws | turn_id, multiplier, number, value |

### 3.3 Data Flow Example

When a scorer marks a darts match:

1. Admin assigns MATCH to scorer (status: pending → assigned)
2. Scorer creates LEG record (e.g., 501 start)
3. For each player throw, scorer creates TURN record
4. For each dart in turn, scorer creates DART record (3 darts)
5. System calculates running scores from DART values
6. Admin sees live updates via Supabase real-time subscription
7. On leg complete (checkout), winner recorded and next leg starts
8. On match complete, winner progresses to next bracket match

<div style="page-break-before: always;"></div>

## 4. Week 1: Foundation & Authentication {#week1}

**Goal:** Set up project infrastructure, apply database schema, and implement basic admin authentication.

### Week 1 Deliverables

- Create GitHub repository
- Create Supabase project
- Initialise SvelteKit project
- Apply database schema
- Implement admin login
- Basic dashboard skeleton

### 4.1 Step 1: Create GitHub Repository

**Action:**

1. Go to github.com and create new repository
2. Name: tournament-management-system (or your choice)
3. Do NOT initialise with README (we'll create structure)
4. Clone to your local machine

**Commands:**

```bash
cd ~/projects
git clone https://github.com/YOUR-USERNAME/tournament-management-system.git
cd tournament-management-system
```

### 4.2 Step 2: Create Supabase Project

**Action:**

1. Go to supabase.com/dashboard
2. Click 'New Project'
3. Name: tournament-manager
4. Generate strong database password (SAVE THIS!)
5. Select region closest to you
6. Wait for provisioning (~2 minutes)

**Save these credentials from Project Settings → API:**

- Project URL (e.g., https://xxxxx.supabase.co)
- anon public key
- service_role key (keep secret!)

### 4.3 Step 3: Initialise SvelteKit Project

**Claude CLI Prompt:**

```
Create a new SvelteKit project with the following requirements:

1. Use JavaScript (not TypeScript)
2. Skeleton project template
3. Add ESLint and Prettier
4. Install core dependencies:
   - @supabase/supabase-js
   - @supabase/auth-helpers-sveltekit
   - @vite-pwa/sveltekit
   - date-fns
   - lucide-svelte

5. Create this folder structure:
   src/lib/components/{admin,scorer,shared}
   src/lib/services
   src/lib/stores
   src/lib/utils
   src/routes/{admin,scorer}/(authenticated)

6. Create .env file with placeholders for:
   PUBLIC_SUPABASE_URL
   PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY

7. Add .env to .gitignore

8. Create src/lib/supabaseClient.js with basic Supabase client setup

9. Create src/hooks.server.js for Supabase auth integration

Run all commands and verify the dev server starts successfully.
```

After Claude completes, fill in your .env file with the Supabase credentials you saved earlier.

### 4.4 Step 4: Apply Database Schema

**Claude CLI Prompt:**

```
I have the complete database schema in database-schema.sql (attached). Please:

1. Create supabase/migrations folder if it doesn't exist
2. Create a new migration file: supabase/migrations/20250120000000_initial_schema.sql
3. Copy the contents of database-schema.sql into this migration
4. Login to Supabase CLI: supabase login
5. Link to my project: supabase link --project-ref [MY-PROJECT-ID]
   (Get project ID from Supabase dashboard URL)
6. Push the migration: supabase db push
7. Verify all tables were created in Supabase dashboard

Confirm each step completed successfully and show me any errors.
```

**Verify in Supabase Dashboard → Table Editor that you see:**

- users, game_types, venues, players
- tournaments, tournament_players
- matches, legs, turns, darts

### 4.5 Step 5: Implement Admin Authentication

**Claude CLI Prompt:**

```
Create a complete admin authentication system with:

1. Login Page (src/routes/(public)/login/+page.svelte):
   - Email and password fields
   - Login button
   - Error handling for failed login
   - Redirect to /admin on success
   - Clean, professional mobile-first design
   - British English throughout

2. Auth Service (src/lib/services/auth.service.js):
   - signIn(email, password) function
   - signOut() function
   - getCurrentUser() function
   - Uses Supabase auth

3. Auth Store (src/lib/stores/auth.store.js):
   - Writable store for user session
   - Functions: setUser, setSession, clear
   - Loading state management

4. Admin Layout with Auth Guard (src/routes/admin/(authenticated)/+layout.server.js):
   - Check if user is logged in
   - Redirect to /login if not authenticated
   - Load user session data

5. Admin Dashboard Home (src/routes/admin/(authenticated)/+page.svelte):
   - Welcome message with user's email
   - Navigation cards for:
     * Tournaments
     * Players
     * Users (if system admin)
   - Sign out button

6. Configure Supabase Auth:
   - Disable email confirmation for development
   - Set site URL to http://localhost:5173
   - Add redirect URL: http://localhost:5173/auth/callback

Create all files, implement the logic, and test that:
- Invalid credentials show error
- Valid login redirects to admin dashboard
- Accessing /admin without login redirects to /login
- Sign out works and redirects to login

Use British English for all user-facing text.
```

Create your first admin user in Supabase Dashboard → Authentication → Users → Add User

### 4.6 Week 1 Completion Checklist

- ✓ GitHub repository created and cloned
- ✓ Supabase project created with credentials saved
- ✓ SvelteKit project initialised with dependencies
- ✓ Database schema applied (10 tables visible)
- ✓ Admin can log in successfully
- ✓ Admin dashboard displays after login
- ✓ Sign out works correctly

<div style="page-break-before: always;"></div>

## 5. Week 2: Tournament Management {#week2}

**Goal:** Build tournament creation, player management, and automatic knockout bracket generation.

### Week 2 Deliverables

- Player CRUD operations
- Tournament creation form
- Knockout bracket generation algorithm
- Visual bracket display
- Match status tracking

### 5.1 Step 1: Player Management

**Claude CLI Prompt:**

```
Create a complete player management system:

1. Player Service (src/lib/services/player.service.js):
   - createPlayer(name, email)
   - getPlayers()
   - getPlayer(id)
   - updatePlayer(id, data)
   - deletePlayer(id)
   - All functions use Supabase client

2. Players List Page (src/routes/admin/(authenticated)/players/+page.svelte):
   - Table showing all players (name, email)
   - "Add Player" button
   - Edit and Delete buttons per player
   - Search/filter by name
   - Mobile-responsive table

3. Create Player Page (src/routes/admin/(authenticated)/players/create/+page.svelte):
   - Form with name (required) and email (optional) fields
   - Validation
   - Success message on create
   - Redirect to players list
   - British English labels

4. Player Detail Page (src/routes/admin/(authenticated)/players/[id]/+page.svelte):
   - Display player info
   - Edit inline or redirect to edit page
   - Delete confirmation
   - Show tournaments player is registered in

Test that you can:
- Create new players
- View list of players
- Edit player details
- Delete players (with confirmation)

Use professional styling with Tailwind if available, or clean CSS.
British English throughout.
```

### 5.2 Step 2: Tournament Creation

**Claude CLI Prompt:**

```
Create tournament management with player selection:

1. Tournament Service (src/lib/services/tournament.service.js):
   - createTournament(data) - includes name, format, game_type_id, settings
   - getTournaments() - with game type info
   - getTournament(id) - with registered players
   - addPlayerToTournament(tournamentId, playerId, seedNumber)
   - removePlayerFromTournament(tournamentId, playerId)
   - updateTournamentStatus(id, status)

2. Tournaments List Page (src/routes/admin/(authenticated)/tournaments/+page.svelte):
   - Cards showing each tournament
   - Display: name, format, status, player count
   - "Create Tournament" button
   - Click card to view details

3. Create Tournament Page (src/routes/admin/(authenticated)/tournaments/create/+page.svelte):
   - Form fields:
     * Tournament name (required)
     * Format: Knockout only for now
     * Best of legs (default 5)
     * Starting score (301/501/701)
   - Multi-select player list (checkboxes)
   - Seed numbers auto-assigned or manual
   - Validate: need 4, 8, 16, or 32 players for knockout
   - Create button
   - Success message and redirect to tournament detail

4. Tournament Detail Page (src/routes/admin/(authenticated)/tournaments/[id]/+page.svelte):
   - Tournament info header
   - Registered players list
   - "Generate Bracket" button (disabled if bracket already generated)
   - "Edit" and "Delete" buttons
   - Navigate to bracket view

Ensure:
- Only "darts" game type for now (from game_types table)
- Validation for valid knockout player counts (4/8/16/32)
- Clean mobile-first design
- British English labels and messages
```

### 5.3 Step 3: Knockout Bracket Generation

**Claude CLI Prompt:**

```
Create the knockout bracket generation system:

1. Bracket Service (src/lib/services/bracket.service.js):
   - generateKnockoutBracket(tournamentId)
   - Algorithm:
     * Get all tournament players ordered by seed
     * Calculate rounds needed (e.g., 8 players = 3 rounds: QF, SF, Final)
     * Create matches for first round with seeded pairings:
       - 1 vs 8, 2 vs 7, 3 vs 6, 4 vs 5 (for 8 players)
       - 1 vs 16, 2 vs 15, ... (for 16 players)
     * Create empty matches for subsequent rounds
     * Set feeds_into relationships (winner of match X goes to match Y)
     * Set round numbers (1=final, 2=semi, 3=quarter, etc.)
     * All matches status = 'pending'
   - Return created bracket structure

2. Match Service (src/lib/services/match.service.js):
   - getMatchesForTournament(tournamentId)
   - getMatch(matchId) with player details
   - assignMatchToScorer(matchId, scorerId)
   - updateMatchStatus(matchId, status)
   - recordMatchWinner(matchId, winnerId)
   - advanceWinnerToNextMatch(matchId)

3. Bracket View (src/routes/admin/(authenticated)/tournaments/[id]/bracket/+page.svelte):
   - Visual bracket display by rounds
   - Show player names or "TBD" if match not reached yet
   - Colour code by status:
     * Grey: pending
     * Blue: assigned
     * Yellow: in progress
     * Green: completed
   - Click match to see details
   - Mobile-responsive bracket layout

Test with different player counts:
- 4 players (2 rounds: SF, F)
- 8 players (3 rounds: QF, SF, F)
- 16 players (4 rounds)

Ensure bracket logic correctly chains matches and handles progression.
```

### 5.4 Week 2 Completion Checklist

- ✓ Players can be created, viewed, edited, deleted
- ✓ Tournaments can be created with player selection
- ✓ Knockout bracket generates correctly for 4, 8, 16 players
- ✓ Bracket displays visually with proper round structure
- ✓ Match feeding relationships are correct
- ✓ Mobile-responsive design throughout

<div style="page-break-before: always;"></div>

## 6. Week 3: Match Scoring System {#week3}

**Goal:** Build the mobile scorer interface with dart-by-dart entry and real-time updates.

### Week 3 Deliverables

- Match assignment to scorer
- Mobile scorer interface (number grid + multipliers)
- Dart-by-dart data entry
- Running score calculations
- Real-time updates to admin
- Match completion workflow

### 6.1 Step 1: Match Assignment

**Claude CLI Prompt:**

```
Create the match assignment workflow:

1. User Management:
   - Create page to add scorer users
   - List all users with role badges
   - Admin can create users with 'scorer' role

2. Match Assignment (in admin tournament detail):
   - For each pending match, show "Assign Scorer" button
   - Modal/dropdown to select scorer from users with 'scorer' role
   - On assign:
     * Update match.assigned_to_user_id
     * Update match.status = 'assigned'
     * Update match.assigned_at timestamp
   - Show assigned scorer name on match card

3. Scorer Dashboard (src/routes/scorer/(authenticated)/+page.svelte):
   - List all matches assigned to logged-in scorer
   - Group by status: assigned, in progress, completed
   - Click match to start scoring
   - Show tournament name, players, match format

Test:
- Admin can assign matches to scorers
- Scorers see their assigned matches
- Matches disappear from "assigned" list when started
```

### 6.2 Step 2: Mobile Scorer Interface

**CRITICAL:** This is the most critical component. Reference your old darts app code for the mobile scorer design.

**Claude CLI Prompt:**

```
Create a mobile-first dart scorer interface. CRITICAL: Everything must fit on screen without scrolling.

Reference the recyclable components from old darts app:
- MobileDartEntry.svelte (overall layout)
- NumberGrid.svelte (number pad 1-20 + bullseye)
- Multiplier selection workflow

Create:

1. Scorer Match Page (src/routes/scorer/(authenticated)/match/[id]/+page.svelte):
   - Load match, players, leg configuration
   - Single-screen layout, NO SCROLLING on any device
   - Sections (all visible at once):
     * Match header (compact): player names, current leg
     * Current scores (large, prominent): Player A vs Player B
     * Current turn indicator: whose throw, which dart (🎯🎯⚫)
     * Number grid (3-4 large rows): 1-20 + bullseye (25)
     * Multiplier selector: Single | Double | Treble buttons
     * Cumulative turn score display
     * Undo last dart button
     * Submit turn button (after 3 darts or checkout)

2. Scoring Components:
   - DartEntry.svelte: Main coordinator
   - NumberGrid.svelte: Number buttons (1-20, 25)
   - MultiplierSelector.svelte: Single/Double/Treble toggle
   - Scoreboard.svelte: Current game state
   - TurnHistory.svelte: Collapsible history

3. Scoring Logic (src/lib/utils/scoring.utils.js):
   - calculateDartValue(multiplier, number)
   - calculateNewScore(currentScore, dartValue)
   - isBust(currentScore, dartValue, checkoutRequired)
   - isCheckout(currentScore, dartValue)
   - calculateAverages(darts)

4. Scoring Service (src/lib/services/scoring.service.js):
   - startLeg(matchId, legNumber)
   - recordDart(legId, playerId, turnNumber, dartNumber, multiplier, number)
   - completeTurn(turnId)
   - completeLeg(legId, winnerId)
   - completeMatch(matchId, winnerId)

5. Workflow:
   - On load, check if match has active leg, or create first leg
   - Track current player turn (alternates each turn)
   - User selects multiplier, then number
   - Dart recorded immediately to database
   - Running score calculated and displayed
   - After 3 darts or checkout, submit turn
   - Switch to other player
   - On leg complete (checkout), record winner
   - Start next leg or complete match

6. Mobile Design Constraints:
   - Viewport: 375px width minimum (iPhone SE)
   - Use viewport height units (100dvh)
   - Large touch targets (minimum 44x44px)
   - High contrast colours
   - No scrolling during active play
   - Stats/history in collapsible sections

Test on:
- iPhone SE (smallest common screen)
- iPhone 15 Pro
- iPad

Critical: Everything visible without scrolling during active scoring.
British English throughout (e.g., "Colour", "Finalise").
```

### 6.3 Step 3: Real-time Updates

**Claude CLI Prompt:**

```
Implement real-time updates so admin sees live scores:

1. Real-time Service (src/lib/services/realtime.service.js):
   - subscribeToMatch(matchId, callback)
   - Listen to changes on:
     * legs table where match_id = matchId
     * turns table where leg_id in match legs
     * darts table where turn_id in match turns
   - On change, fetch updated match/leg/turn data
   - Call callback with new data
   - Return unsubscribe function

2. Update Admin Match Detail Page:
   - Subscribe to match updates when page loads
   - Display live scoreboard during active leg
   - Show current scores for both players
   - Update automatically without refresh
   - Unsubscribe when page unmounts

3. Supabase Real-time Setup:
   - Ensure real-time is enabled on Supabase project
   - Verify RLS policies allow SELECT on legs/turns/darts
   - Test subscription in browser console

Test:
- Scorer enters darts on phone/tablet
- Admin watching on desktop sees scores update within 1 second
- Multiple legs update correctly
- Unsubscribe works (no memory leaks)
```

### 6.4 Step 4: Match Completion

**Claude CLI Prompt:**

```
Implement match completion and winner progression:

1. Complete Match Logic:
   - When best-of-X legs is reached (e.g., first to 3 in best of 5)
   - Record match winner
   - Update match status to 'completed'
   - If match feeds into another match:
     * Update next match with winner as player
     * Update next match status to 'pending' (ready to assign)

2. Match Service Updates:
   - completeMatch(matchId, winnerId)
   - advanceWinner(matchId)
     * Find feeds_into_match_id
     * Determine if winner is player1 or player2 in next match
     * Update next match player field
     * Check if both players are set, then make available

3. Bracket Updates:
   - Auto-refresh bracket view when matches complete
   - Show winner names progressing through bracket
   - Highlight next available matches

4. Match Summary:
   - After match completion, show summary:
     * Winner announced
     * Final score (legs won)
     * Statistics: average per dart, checkout %, highest checkout
   - "Back to Dashboard" button

Test:
- Complete a match (3-0, 3-1, 3-2 scores)
- Verify winner advances to correct next match
- Check final match declares tournament winner
- Ensure bracket reflects completed matches
```

### 6.5 Week 3 Completion Checklist

- ✓ Admin can assign matches to scorers
- ✓ Scorers see assigned matches in their dashboard
- ✓ Mobile scorer interface works without scrolling
- ✓ Dart-by-dart entry is smooth and intuitive
- ✓ Scores calculate correctly (including busts)
- ✓ Admin sees live score updates
- ✓ Legs complete correctly on checkout
- ✓ Matches complete after best-of-X legs
- ✓ Winners advance through bracket
- ✓ Tournament completes with final winner

<div style="page-break-before: always;"></div>

## 7. Week 4: Polish & Production {#week4}

**Goal:** PWA setup, offline capability, mobile polish, and production deployment.

### Week 4 Deliverables

- PWA manifest and service worker
- Offline UI caching
- Mobile viewport refinements
- Testing on real devices
- Netlify deployment
- Final polish and bug fixes

### 7.1 Step 1: PWA Configuration

**Claude CLI Prompt:**

```
Configure the app as a Progressive Web App:

1. Update vite.config.js with PWA plugin:
   - Install @vite-pwa/sveltekit if not already
   - Configure manifest:
     * name: "Tournament Manager"
     * short_name: "Tournaments"
     * description: "Multi-sport tournament management"
     * theme_color: #2E7D32 (green)
     * background_color: #ffffff
     * display: standalone
     * icons: 192x192 and 512x512
   - Service worker with auto-update

2. Create PWA Icons:
   - Generate or create 192x192px icon
   - Generate or create 512x512px icon
   - Place in static/icons/
   - Use simple darts target design or generic sports icon

3. Configure Auto-Update:
   - registerType: 'autoUpdate'
   - Prompt user on update available (optional)

4. Test PWA Installation:
   - Run dev server: npm run dev
   - Open in Chrome
   - Check for "Install" prompt in address bar
   - Install and verify app works standalone

5. Offline Considerations:
   - Cache all UI assets (HTML, CSS, JS)
   - DO NOT cache API responses (real-time data)
   - Show "offline" indicator if no connection
   - Queue score updates if offline (optional for MVP)

Test:
- App installs on mobile device
- Icon appears on home screen
- Runs in standalone mode
- UI loads when offline (data requires connection)
```

### 7.2 Step 2: Mobile Polish

**Claude CLI Prompt:**

```
Polish the mobile experience:

1. Viewport Handling:
   - Ensure all pages use correct viewport meta tag
   - Use 100dvh (dynamic viewport height) for full-screen layouts
   - Account for mobile browser chrome (address bar)
   - No horizontal scrolling on any page

2. Touch Interactions:
   - All buttons minimum 44x44px
   - Adequate spacing between touch targets
   - Visual feedback on tap (background change)
   - No accidental double-taps

3. Performance:
   - Minimise re-renders in scorer interface
   - Debounce expensive calculations
   - Lazy load images if any
   - Keep initial bundle small

4. Loading States:
   - Show spinners during data loading
   - Skeleton screens for lists
   - "Saving..." indicators for form submissions

5. Error Handling:
   - Toast notifications for errors
   - Friendly error messages in British English
   - Retry mechanisms for failed API calls

6. Accessibility:
   - Semantic HTML (button, nav, main)
   - ARIA labels where needed
   - Keyboard navigation works
   - High contrast mode support

Test on:
- iPhone SE (smallest screen)
- iPhone 15 Pro (notch)
- iPad (tablet)
- Android phone
- Various orientations (portrait/landscape)
```

### 7.3 Step 3: Netlify Deployment

**Claude CLI Prompt:**

```
Deploy the app to Netlify:

1. Create netlify.toml in project root:
   [build]
     command = "npm run build"
     publish = "build"
   [build.environment]
     NODE_VERSION = "18"
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200

2. Commit and push to GitHub:
   git add .
   git commit -m "feat: complete MVP with PWA and scoring"
   git push origin main

3. Connect to Netlify:
   - Go to app.netlify.com
   - "Add new site" → "Import an existing project"
   - Connect to GitHub
   - Select tournament-management-system repository
   - Build settings auto-detected from netlify.toml
   - Add environment variables:
     * PUBLIC_SUPABASE_URL
     * PUBLIC_SUPABASE_ANON_KEY
   - Deploy site

4. Update Supabase Auth URLs:
   - In Supabase Dashboard → Authentication → URL Configuration
   - Site URL: https://your-app.netlify.app
   - Add Redirect URL: https://your-app.netlify.app/auth/callback

5. Test Production:
   - Visit deployed URL
   - Test login
   - Create tournament
   - Assign and score a match
   - Verify PWA install works
   - Test on mobile device

6. Custom Domain (Optional):
   - Add custom domain in Netlify
   - Update Supabase auth URLs
   - Enable HTTPS (automatic with Netlify)
```

### 7.4 Step 4: Testing & Bug Fixes

**Claude CLI Prompt:**

```
Conduct thorough testing and fix issues:

1. Create Test Tournament:
   - Create 8 players
   - Create knockout tournament
   - Generate bracket
   - Assign all matches to scorers
   - Complete full tournament from first match to final

2. Test Scenarios:
   - Various leg scores (3-0, 3-1, 3-2)
   - High checkouts (170, 160, etc.)
   - Bust scenarios
   - Undo functionality
   - Multiple simultaneous scorers (if possible)

3. Browser Testing:
   - Chrome (desktop & mobile)
   - Safari (desktop & mobile)
   - Firefox
   - Edge

4. Device Testing:
   - iPhone (multiple sizes)
   - iPad
   - Android phone
   - Android tablet

5. Bug Fix Priority:
   - Critical: Login, scoring, match completion
   - High: UI issues, real-time updates
   - Medium: Visual polish, error messages
   - Low: Nice-to-haves, optimisations

6. Create Bug List:
   - Document all found issues
   - Prioritise by severity
   - Fix critical and high priority bugs
   - Log medium/low for post-MVP

Use Claude CLI to fix bugs iteratively:
"Fix [specific bug] in [file/component]. The issue is [description]."

Test each fix immediately.
```

### 7.5 Week 4 Completion Checklist

- ✓ PWA manifest configured correctly
- ✓ App installs on mobile home screen
- ✓ Service worker caches UI assets
- ✓ No scrolling issues on any device
- ✓ Touch targets appropriately sized
- ✓ Loading states implemented
- ✓ Error handling works gracefully
- ✓ Deployed to Netlify successfully
- ✓ Tested on iPhone, iPad, Android
- ✓ Full tournament can be completed start to finish
- ✓ Critical bugs fixed
- ✓ British English throughout

<div style="page-break-before: always;"></div>

## 8. Troubleshooting Common Issues {#troubleshooting}

| Issue | Solution |
|-------|----------|
| Supabase Connection Fails | Check .env file has correct URL and keys. Verify RLS policies in database. Ensure Supabase project is running. |
| Login Redirects to Wrong Page | Check Supabase auth redirect URLs match your domain. Verify +layout.server.js auth guard logic. |
| Real-time Updates Not Working | Ensure Supabase real-time is enabled. Check RLS policies allow SELECT. Verify subscription channel name matches table. |
| Scorer Screen Scrolls on Mobile | Use 100dvh for viewport height. Reduce content or make collapsible. Test on actual device, not just browser resize. |
| PWA Won't Install | Must be served over HTTPS (Netlify does this). Check manifest.json is generated. Verify icons exist in static/icons/. |
| Bracket Generation Incorrect | Verify feeds_into_match_id relationships. Check round numbers are correct. Ensure player seeds are sequential. |
| Darts Don't Record to Database | Check RLS policies on darts/turns/legs tables. Verify scorer user has correct permissions. Check browser console for errors. |
| Match Won't Complete | Ensure best_of_legs count is correct. Verify leg winner is recorded. Check match completion logic in service. |
| Build Fails on Netlify | Check Node version is 18+. Verify all dependencies in package.json. Check environment variables are set. Read build logs carefully. |
| British English Not Consistent | Search codebase for American spellings: organize, color, center. Use VS Code find/replace. Check all user-facing strings. |

<div style="page-break-before: always;"></div>

## 9. Post-MVP: Future Enhancements {#future}

After MVP is complete and stable, consider these enhancements:

### 9.1 Additional Tournament Formats

- **League:** Ongoing season with standings and fixtures
- **Round Robin:** Everyone plays everyone, rankings by wins
- **Groups to Knockout:** Group stage then knockout from top qualifiers

### 9.2 Multi-Sport Expansion

**Adding Pool:**

1. Add pool game type to database (already supported!)
2. Create pool scorer interface (frame-based scoring)
3. Track break/run statistics
4. 8-ball, 9-ball, 10-ball variants

Similar approach for snooker, cricket (darts), or any other sport.

### 9.3 User Experience Enhancements

- Social media login (Google, Facebook, Apple)
- Player self-registration via QR code
- Live spectator view (public URL to watch)
- Statistics dashboard (averages, checkout %, trends)
- Match video recording integration
- Push notifications for assigned matches
- Leaderboards and rankings

### 9.4 Venue Management

- Venue profiles with address, boards, facilities
- Venue admin role fully implemented
- Board scheduling (assign matches to specific boards)
- Multi-venue tournaments (regional competitions)

<div style="page-break-before: always;"></div>

## 10. Appendices {#appendices}

### 10.1 Useful Commands Reference

| Task | Command |
|------|---------|
| Start dev server | `npm run dev` |
| Build for production | `npm run build` |
| Preview production build | `npm run preview` |
| Run Supabase migration | `supabase db push` |
| Pull database schema | `supabase db pull` |
| Reset local database | `supabase db reset` |
| Check git status | `git status` |
| Commit changes | `git add . && git commit -m "message"` |
| Push to GitHub | `git push origin main` |
| Install dependency | `npm install package-name` |
| Remove dependency | `npm uninstall package-name` |

### 10.2 Key File Locations

| File/Folder | Purpose |
|-------------|---------|
| src/routes/ | SvelteKit routing (folders = URLs) |
| src/lib/components/ | Reusable UI components |
| src/lib/services/ | Business logic and API calls |
| src/lib/stores/ | Svelte stores for state management |
| src/lib/utils/ | Pure utility functions |
| src/hooks.server.js | Supabase auth integration |
| supabase/migrations/ | Database version control |
| static/ | Static assets (icons, images) |
| .env | Environment variables (not in git) |
| vite.config.js | Build config with PWA |
| netlify.toml | Deployment configuration |

### 10.3 Database Connection Info

Your Supabase credentials (from Project Settings → API):

- **Project URL:** https://[project-id].supabase.co
- **anon public key:** Used in .env as PUBLIC_SUPABASE_ANON_KEY
- **service_role key:** Used in .env as SUPABASE_SERVICE_ROLE_KEY
- **Database password:** Set during project creation

### 10.4 Resources & Documentation

- **SvelteKit:** https://kit.svelte.dev/docs
- **Supabase:** https://supabase.com/docs
- **Netlify:** https://docs.netlify.com
- **PWA Guide:** https://vite-pwa-org.netlify.app
- **Claude CLI:** https://github.com/anthropics/anthropic-cli

---

## End of Implementation Guide

You now have everything needed to build your multi-sport tournament management system.

**Good luck with your development!** 🎯
