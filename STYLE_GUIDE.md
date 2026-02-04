# Style Guide

Coding standards and conventions for the Tournament Management System.

## Table of Contents

- [British English](#british-english)
- [JavaScript Style](#javascript-style)
- [Svelte Conventions](#svelte-conventions)
- [CSS & Styling](#css--styling)
- [File Naming](#file-naming)
- [Database Conventions](#database-conventions)
- [Git Commit Messages](#git-commit-messages)

---

## British English

**All user-facing text MUST use British English spelling and terminology.**

### Spelling Differences

| ❌ American | ✅ British |
|------------|-----------|
| organize | organise |
| color | colour |
| center | centre |
| defense | defence |
| favor | favour |
| honor | honour |
| analyze | analyse |
| realize | realise |
| maximize | maximise |
| minimize | minimise |
| canceled | cancelled |
| traveling | travelling |
| dialog | dialogue |
| program (general) | programme |

### Terminology Differences

| ❌ American | ✅ British |
|------------|-----------|
| cell phone | mobile phone |
| app | app (acceptable) |
| trash | bin / rubbish |
| customize | customise |
| check | tick (checkbox) |
| form | form (acceptable) |
| movie | film |

### Code Variables (Exception)

Code variables and function names may use American spelling for compatibility with libraries:

```javascript
// ✅ Acceptable in code
const backgroundColor = '#fff'
function initialize() { }

// ✅ User-facing text must be British
const label = 'Background Colour'
const message = 'Initialise system'
```

### Testing for British English

Use VS Code search to find American spellings:

```regex
\b(organize|color|center|defense|realize|analyze)\b
```

---

## JavaScript Style

### General Rules

- **No TypeScript** - Use JavaScript only
- **ES6+ Features** - Use modern JavaScript
- **No Semicolons** - Rely on ASI (Automatic Semicolon Insertion)
- **Single Quotes** - For strings (except in Svelte templates)
- **2 Space Indentation** - Consistent throughout

### File Structure

```javascript
// 1. Imports (grouped)
import { supabase } from '$lib/supabaseClient'
import { goto } from '$app/navigation'

// 2. Constants
const MAX_PLAYERS = 32

// 3. Functions
export async function getPlayers() {
  // Implementation
}

// 4. Exports (if multiple)
export { getPlayers, createPlayer }
```

### Naming Conventions

```javascript
// Variables & Functions: camelCase
const playerName = 'John Smith'
function calculateScore() { }

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3
const API_TIMEOUT = 5000

// Classes & Components: PascalCase
class TournamentManager { }
// PlayerCard.svelte

// Private functions: prefix with underscore
function _internalHelper() { }

// Boolean variables: prefix with is/has/should
const isActive = true
const hasPermission = false
const shouldUpdate = true
```

### Functions

```javascript
// ✅ Good: Named functions for reusability
export function getPlayers() {
  return supabase.from('players').select()
}

// ✅ Good: Arrow functions for callbacks
players.map(player => player.name)

// ✅ Good: Async/await over promises
async function loadData() {
  const result = await fetchData()
  return result
}

// ❌ Avoid: Anonymous functions for exported functions
export default function() { }
```

### Error Handling

```javascript
// ✅ Good: Try-catch with meaningful errors
try {
  const result = await createPlayer(data)
  return result
} catch (error) {
  console.error('Failed to create player:', error.message)
  throw error
}

// ✅ Good: Check for errors from Supabase
const { data, error } = await supabase.from('players').select()
if (error) throw error
return data

// ❌ Avoid: Silent failures
try {
  await doSomething()
} catch (error) {
  // Nothing here
}
```

### Array & Object Operations

```javascript
// ✅ Good: Use modern array methods
const activeMatches = matches.filter(m => m.status === 'in_progress')
const playerNames = players.map(p => p.name)
const totalScore = darts.reduce((sum, dart) => sum + dart.value, 0)

// ✅ Good: Destructuring
const { name, email } = player
const [first, second, ...rest] = array

// ✅ Good: Spread operator
const newPlayer = { ...player, email: 'new@example.com' }
const allPlayers = [...existing, ...new]

// ❌ Avoid: for loops when array methods work
for (let i = 0; i < players.length; i++) {
  names.push(players[i].name)
}
```

### Comments

```javascript
// ✅ Good: Explain WHY, not WHAT
// Calculate winner based on legs won (best of X format)
const winner = legs.filter(l => l.winner_id === p1).length > bestOf / 2

// ✅ Good: Document complex algorithms
/**
 * Generates knockout bracket with traditional seeding
 * 1v8, 2v7, 3v6, 4v5 for 8 players
 */
function generateBracket() { }

// ❌ Avoid: Obvious comments
// Set name to player name
const name = player.name
```

---

## Svelte Conventions

### Component Structure

```svelte
<script>
  // 1. Imports
  import Button from '$lib/components/shared/Button.svelte'
  import { createEventDispatcher } from 'svelte'
  
  // 2. Props (with export)
  export let player
  export let editable = false
  
  // 3. Event dispatcher
  const dispatch = createEventDispatcher()
  
  // 4. Local state
  let isEditing = false
  
  // 5. Reactive declarations
  $: fullName = `${player.first_name} ${player.last_name}`
  $: isValid = name.length > 0
  
  // 6. Functions
  function handleSave() {
    dispatch('save', { player })
  }
</script>

<!-- 7. HTML Template -->
<div class="player-card">
  <h3>{fullName}</h3>
  {#if editable}
    <Button on:click={handleSave}>Save</Button>
  {/if}
</div>

<!-- 8. Styles (scoped) -->
<style>
  .player-card {
    padding: 1rem;
  }
</style>
```

### Props

```svelte
<script>
  // ✅ Good: Explicit prop types in JSDoc
  /** @type {string} */
  export let name
  
  /** @type {number} */
  export let age = 0
  
  /** @type {{ id: string, name: string }} */
  export let player
  
  // ✅ Good: Default values
  export let variant = 'primary'
  export let disabled = false
</script>
```

### Reactivity

```svelte
<script>
  // ✅ Good: Reactive declarations
  $: doubled = count * 2
  $: if (count > 10) {
    alert('Count exceeded 10!')
  }
  
  // ✅ Good: Derived stores
  import { derived } from 'svelte/store'
  const activeMatches = derived(matches, $m => 
    $m.filter(match => match.status === 'in_progress')
  )
  
  // ❌ Avoid: Manual updates when reactive declarations work
  function updateDoubled() {
    doubled = count * 2
  }
</script>
```

### Events

```svelte
<script>
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()
  
  // ✅ Good: Dispatch with detail
  function handleClick() {
    dispatch('select', { playerId: player.id })
  }
  
  // ✅ Good: Forward events
  <Button on:click />
</script>
```

### Conditional Rendering

```svelte
<!-- ✅ Good: Use {#if} for conditional rendering -->
{#if isLoading}
  <LoadingSpinner />
{:else if error}
  <ErrorMessage message={error} />
{:else}
  <Content data={data} />
{/if}

<!-- ✅ Good: Use {#each} for lists -->
{#each players as player (player.id)}
  <PlayerCard {player} />
{:else}
  <p>No players found</p>
{/each}

<!-- ❌ Avoid: Ternary in template when {#if} is clearer -->
{isActive ? <Active /> : null}
```

---

## CSS & Styling

### Approach

- **Scoped CSS** - Component-level styles in `<style>` tags
- **Mobile-First** - Design for smallest screen first
- **BEM Naming** - Block Element Modifier for clarity
- **CSS Variables** - For theme colours

### Mobile-First

```css
/* ✅ Good: Mobile first, then enhance */
.button {
  padding: 0.5rem;
  font-size: 0.875rem;
}

@media (min-width: 768px) {
  .button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
}

/* ❌ Avoid: Desktop first */
.button {
  padding: 0.75rem 1.5rem;
}

@media (max-width: 767px) {
  .button {
    padding: 0.5rem;
  }
}
```

### BEM Naming

```css
/* Block */
.player-card { }

/* Element */
.player-card__name { }
.player-card__email { }

/* Modifier */
.player-card--active { }
.player-card--disabled { }

/* Combined */
.player-card__button--primary { }
```

### Spacing & Units

```css
/* ✅ Good: rem for spacing, em for relative sizing */
.container {
  padding: 1rem;        /* 16px */
  margin: 0.5rem;       /* 8px */
  font-size: 1.25rem;   /* 20px */
}

/* ✅ Good: dvh for full height (accounts for mobile chrome) */
.scorer-interface {
  height: 100dvh;
}

/* ❌ Avoid: px for spacing (not scalable) */
.container {
  padding: 16px;
}

/* ❌ Avoid: vh on mobile (address bar issues) */
.scorer-interface {
  height: 100vh;
}
```

### Colours

```css
/* ✅ Good: CSS variables for theme */
:root {
  --colour-primary: #2E7D32;
  --colour-secondary: #43A047;
  --colour-danger: #D32F2F;
  --colour-text: #333333;
  --colour-background: #FFFFFF;
}

.button {
  background-colour: var(--colour-primary);
  colour: var(--colour-background);
}

/* ❌ Avoid: Hardcoded colours */
.button {
  background-color: #2E7D32;
}
```

---

## File Naming

### General Rules

- **kebab-case** - For all files
- **PascalCase** - Only for Svelte components
- **Descriptive names** - Clear purpose

### Examples

```
✅ Good:
src/lib/components/admin/TournamentCard.svelte
src/lib/components/scorer/DartEntry.svelte
src/lib/services/auth.service.js
src/lib/utils/scoring.utils.js
src/routes/admin/tournaments/[id]/+page.svelte

❌ Avoid:
src/lib/components/admin/tournament_card.svelte
src/lib/components/scorer/dartEntry.svelte
src/lib/services/authService.js
src/lib/utils/scoringUtils.js
```

### File Suffixes

```
*.service.js    - Service modules (business logic)
*.utils.js      - Utility functions (pure functions)
*.store.js      - Svelte stores
*.test.js       - Test files
+page.svelte    - Route page
+layout.svelte  - Route layout
+server.js      - Server-side code
```

---

## Database Conventions

### Table Names

- **snake_case** - All lowercase with underscores
- **Plural** - Represents collection of records
- **Descriptive** - Clear purpose

```sql
✅ Good:
users
tournaments
tournament_players
matches
legs

❌ Avoid:
Users
tournament_player (singular)
tp (abbreviation)
```

### Column Names

- **snake_case** - Consistent with table names
- **Descriptive** - No abbreviations unless obvious

```sql
✅ Good:
tournament_id
best_of_legs
starting_score
created_at

❌ Avoid:
tournamentId (camelCase)
bol (abbreviation)
score (ambiguous)
```

### Foreign Keys

```sql
-- ✅ Good: Reference table name + _id
tournament_id
player_id
assigned_to_user_id

-- ❌ Avoid: Ambiguous names
tournament
tid
```

---

## Git Commit Messages

### Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]

[optional footer]
```

### Types

```
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
style:    Code style (formatting, missing semicolons, etc.)
refactor: Code restructuring without changing functionality
test:     Adding or updating tests
chore:    Maintenance tasks (dependencies, config, etc.)
perf:     Performance improvements
ci:       CI/CD changes
```

### Examples

```bash
✅ Good:
feat: add knockout bracket generation
fix: correct scoring calculation for busts
docs: update API reference with new endpoints
style: format player service with prettier
refactor: extract scoring logic to utils
test: add unit tests for bracket service
chore: update dependencies to latest versions

✅ Good with body:
feat: add real-time score updates

Implemented Supabase real-time subscriptions for legs, turns, and darts tables. Admin dashboard now shows live scores as scorers enter darts.

Closes #42

❌ Avoid:
Added stuff
fixed bug
WIP
asdf
Updated files
```

### Commit Frequency

- Commit often with logical units of work
- Each commit should represent a complete thought
- Don't commit broken code

---

## Additional Guidelines

### Console Logging

```javascript
// ✅ Good: Descriptive console messages
console.log('Tournament created:', tournament.id)
console.error('Failed to load players:', error.message)

// ✅ Good: Remove console.log before committing
// Use during development, remove in production code

// ❌ Avoid: console.log without context
console.log(data)
console.log('here')
```

### Magic Numbers

```javascript
// ❌ Avoid: Magic numbers
if (players.length === 8) { }
setTimeout(() => { }, 3000)

// ✅ Good: Named constants
const REQUIRED_PLAYERS_FOR_KNOCKOUT = 8
const TOAST_DURATION_MS = 3000

if (players.length === REQUIRED_PLAYERS_FOR_KNOCKOUT) { }
setTimeout(() => { }, TOAST_DURATION_MS)
```

### Async/Await

```javascript
// ✅ Good: Async/await for readability
async function loadTournament() {
  const tournament = await getTournament(id)
  const players = await getPlayers(tournament.id)
  return { tournament, players }
}

// ❌ Avoid: Promise chains when async/await is clearer
function loadTournament() {
  return getTournament(id)
    .then(tournament => getPlayers(tournament.id))
    .then(players => ({ tournament, players }))
}
```

---

## Code Review Checklist

Before submitting a PR, verify:

- [ ] British English in all user-facing text
- [ ] Mobile-first responsive design
- [ ] No console.log statements
- [ ] Proper error handling
- [ ] Component props documented
- [ ] Functions have descriptive names
- [ ] No hardcoded values (use constants)
- [ ] Git commit messages follow convention
- [ ] Tests pass (when implemented)
- [ ] No TypeScript creeping in

---

**Consistency is key. When in doubt, refer to existing code or ask for clarification.**
