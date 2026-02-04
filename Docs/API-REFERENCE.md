# API Reference

Documentation for the service layer (business logic) of the Tournament Management System.

## Architecture

The application uses a **service layer pattern** where all business logic and database operations are abstracted into service modules. Components never call Supabase directly.

```
Components (UI)
    ↓
Services (Business Logic)
    ↓
Supabase (Database)
```

## Service Modules

### auth.service.js

Handles authentication and user session management.

#### `signIn(email, password)`

Authenticates a user with email and password.

```javascript
import { signIn } from '$lib/services/auth.service'

const { user, error } = await signIn('admin@example.com', 'password123')
if (error) {
  console.error('Login failed:', error.message)
} else {
  console.log('Logged in:', user.email)
}
```

**Parameters:**
- `email` (string) - User's email address
- `password` (string) - User's password

**Returns:**
- `{ user, session, error }` - User object, session, or error if failed

---

#### `signOut()`

Signs out the current user.

```javascript
import { signOut } from '$lib/services/auth.service'

await signOut()
// User is now logged out
```

**Returns:**
- `{ error }` - Error if sign out failed (rare)

---

#### `getCurrentUser()`

Gets the currently authenticated user.

```javascript
import { getCurrentUser } from '$lib/services/auth.service'

const user = await getCurrentUser()
if (user) {
  console.log('Current user:', user.email)
}
```

**Returns:**
- `user` object or `null` if not authenticated

---

### player.service.js

Manages player CRUD operations.

#### `getPlayers()`

Retrieves all players in the system.

```javascript
import { getPlayers } from '$lib/services/player.service'

const players = await getPlayers()
console.log(`Found ${players.length} players`)
```

**Returns:**
- Array of player objects

---

#### `getPlayer(id)`

Retrieves a single player by ID.

```javascript
import { getPlayer } from '$lib/services/player.service'

const player = await getPlayer('123e4567-e89b-12d3-a456-426614174000')
console.log(player.name)
```

**Parameters:**
- `id` (UUID string) - Player ID

**Returns:**
- Player object or `null` if not found

---

#### `createPlayer(data)`

Creates a new player.

```javascript
import { createPlayer } from '$lib/services/player.service'

const player = await createPlayer({
  name: 'John Smith',
  email: 'john@example.com'
})
```

**Parameters:**
- `data` (object)
  - `name` (string, required) - Player's name
  - `email` (string, optional) - Player's email

**Returns:**
- Created player object

---

#### `updatePlayer(id, data)`

Updates an existing player.

```javascript
import { updatePlayer } from '$lib/services/player.service'

const updated = await updatePlayer(playerId, {
  name: 'John H. Smith',
  email: 'john.smith@example.com'
})
```

**Parameters:**
- `id` (UUID string) - Player ID
- `data` (object) - Fields to update

**Returns:**
- Updated player object

---

#### `deletePlayer(id)`

Deletes a player.

```javascript
import { deletePlayer } from '$lib/services/player.service'

await deletePlayer(playerId)
```

**Parameters:**
- `id` (UUID string) - Player ID

**Returns:**
- `{ success: true }` or `{ error }`

---

### tournament.service.js

Manages tournaments and tournament operations.

#### `getTournaments()`

Retrieves all tournaments with game type information.

```javascript
import { getTournaments } from '$lib/services/tournament.service'

const tournaments = await getTournaments()
tournaments.forEach(t => {
  console.log(`${t.name} (${t.game_types.display_name})`)
})
```

**Returns:**
- Array of tournament objects with nested `game_types`

---

#### `getTournament(id)`

Retrieves a single tournament with registered players.

```javascript
import { getTournament } from '$lib/services/tournament.service'

const tournament = await getTournament(tournamentId)
console.log(`${tournament.name} has ${tournament.tournament_players.length} players`)
```

**Parameters:**
- `id` (UUID string) - Tournament ID

**Returns:**
- Tournament object with nested `tournament_players` and `game_types`

---

#### `createTournament(data)`

Creates a new tournament.

```javascript
import { createTournament } from '$lib/services/tournament.service'

const tournament = await createTournament({
  name: 'Friday Night Darts',
  game_type_id: dartsGameTypeId,
  format: 'knockout',
  default_best_of_legs: 5,
  default_starting_score: 501,
  venue_id: venueId // optional
})
```

**Parameters:**
- `data` (object)
  - `name` (string, required) - Tournament name
  - `game_type_id` (UUID, required) - Game type (darts, pool, etc.)
  - `format` (string, required) - 'knockout', 'league', 'round_robin', 'groups_to_knockout'
  - `default_best_of_legs` (integer, required) - Default match format
  - `default_starting_score` (integer, required) - Starting score (501, 301, etc.)
  - `venue_id` (UUID, optional) - Venue hosting tournament

**Returns:**
- Created tournament object

---

#### `addPlayerToTournament(tournamentId, playerId, seedNumber)`

Registers a player for a tournament.

```javascript
import { addPlayerToTournament } from '$lib/services/tournament.service'

await addPlayerToTournament(tournamentId, playerId, 1) // Seed 1
```

**Parameters:**
- `tournamentId` (UUID string) - Tournament ID
- `playerId` (UUID string) - Player ID
- `seedNumber` (integer, optional) - Player's seed/ranking

**Returns:**
- Tournament player registration object

---

#### `removePlayerFromTournament(tournamentId, playerId)`

Removes a player from a tournament.

```javascript
import { removePlayerFromTournament } from '$lib/services/tournament.service'

await removePlayerFromTournament(tournamentId, playerId)
```

**Parameters:**
- `tournamentId` (UUID string) - Tournament ID
- `playerId` (UUID string) - Player ID

---

#### `updateTournamentStatus(id, status)`

Updates tournament status.

```javascript
import { updateTournamentStatus } from '$lib/services/tournament.service'

await updateTournamentStatus(tournamentId, 'in_progress')
// Valid statuses: 'setup', 'in_progress', 'completed', 'cancelled'
```

**Parameters:**
- `id` (UUID string) - Tournament ID
- `status` (string) - New status

---

### bracket.service.js

Handles bracket generation for knockout tournaments.

#### `generateKnockoutBracket(tournamentId)`

Generates a complete knockout bracket with matches and feeding relationships.

```javascript
import { generateKnockoutBracket } from '$lib/services/bracket.service'

const bracket = await generateKnockoutBracket(tournamentId)
console.log(`Created ${bracket.matches.length} matches`)
```

**Algorithm:**
- Gets all tournament players ordered by seed
- Calculates rounds needed (8 players = 3 rounds)
- Creates first round matches with traditional seeding (1v8, 2v7, 3v6, 4v5)
- Creates empty matches for subsequent rounds
- Sets `feeds_into_match_id` relationships for bracket progression
- Sets round numbers (1=final, 2=semi, 3=quarter, etc.)

**Parameters:**
- `tournamentId` (UUID string) - Tournament ID

**Returns:**
- Bracket structure object with all matches

**Throws:**
- Error if tournament doesn't have valid player count (must be 4, 8, 16, or 32)

---

### match.service.js

Manages matches and match operations.

#### `getMatchesForTournament(tournamentId)`

Gets all matches for a tournament.

```javascript
import { getMatchesForTournament } from '$lib/services/match.service'

const matches = await getMatchesForTournament(tournamentId)
console.log(`Tournament has ${matches.length} matches`)
```

**Parameters:**
- `tournamentId` (UUID string) - Tournament ID

**Returns:**
- Array of match objects with player details

---

#### `getMatch(matchId)`

Gets a single match with full details.

```javascript
import { getMatch } from '$lib/services/match.service'

const match = await getMatch(matchId)
console.log(`${match.player1.name} vs ${match.player2.name}`)
```

**Parameters:**
- `matchId` (UUID string) - Match ID

**Returns:**
- Match object with nested player, tournament, and leg data

---

#### `assignMatchToScorer(matchId, scorerId)`

Assigns a match to a scorer user.

```javascript
import { assignMatchToScorer } from '$lib/services/match.service'

await assignMatchToScorer(matchId, scorerUserId)
```

**Parameters:**
- `matchId` (UUID string) - Match ID
- `scorerId` (UUID string) - User ID of scorer

**Updates:**
- `match.assigned_to_user_id` = scorerId
- `match.status` = 'assigned'
- `match.assigned_at` = current timestamp

---

#### `updateMatchStatus(matchId, status)`

Updates match status.

```javascript
import { updateMatchStatus } from '$lib/services/match.service'

await updateMatchStatus(matchId, 'in_progress')
// Valid: 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'
```

---

#### `recordMatchWinner(matchId, winnerId)`

Records the winner of a match.

```javascript
import { recordMatchWinner } from '$lib/services/match.service'

await recordMatchWinner(matchId, winnerTournamentPlayerId)
```

**Parameters:**
- `matchId` (UUID string) - Match ID
- `winnerId` (UUID string) - Tournament player ID of winner

**Updates:**
- `match.winner_id` = winnerId
- `match.status` = 'completed'
- `match.completed_at` = current timestamp

---

#### `advanceWinnerToNextMatch(matchId)`

Progresses match winner to the next round.

```javascript
import { advanceWinnerToNextMatch } from '$lib/services/match.service'

await advanceWinnerToNextMatch(matchId)
```

**Logic:**
- Finds `match.feeds_into_match_id`
- Determines if winner is player1 or player2 in next match
- Updates next match with winner
- If both players now set, changes next match to 'pending'

---

### scoring.service.js

Handles leg, turn, and dart recording.

#### `startLeg(matchId, legNumber)`

Creates a new leg for a match.

```javascript
import { startLeg } from '$lib/services/scoring.service'

const leg = await startLeg(matchId, 1) // Leg 1
```

**Parameters:**
- `matchId` (UUID string) - Match ID
- `legNumber` (integer) - Leg number (1, 2, 3, ...)

**Returns:**
- Created leg object

---

#### `recordDart(legId, playerId, turnNumber, dartNumber, multiplier, number)`

Records a single dart throw.

```javascript
import { recordDart } from '$lib/services/scoring.service'

await recordDart(
  legId,
  tournamentPlayerId,
  1,  // Turn 1
  1,  // Dart 1
  3,  // Treble
  20  // 20
)
// Records T20 (60 points)
```

**Parameters:**
- `legId` (UUID string) - Leg ID
- `playerId` (UUID string) - Tournament player ID
- `turnNumber` (integer) - Turn number (1, 2, 3, ...)
- `dartNumber` (integer) - Dart in turn (1, 2, or 3)
- `multiplier` (integer) - 1 (single), 2 (double), 3 (treble)
- `number` (integer) - Number hit (0-20 or 25 for bull)

**Creates:**
- Turn record (if first dart of turn)
- Dart record
- Updates turn totals

---

#### `completeTurn(turnId)`

Marks a turn as complete.

```javascript
import { completeTurn } from '$lib/services/scoring.service'

await completeTurn(turnId)
```

---

#### `completeLeg(legId, winnerId)`

Marks a leg as complete with winner.

```javascript
import { completeLeg } from '$lib/services/scoring.service'

await completeLeg(legId, winnerTournamentPlayerId)
```

**Parameters:**
- `legId` (UUID string) - Leg ID
- `winnerId` (UUID string) - Tournament player ID of winner

---

#### `completeMatch(matchId, winnerId)`

Marks match as complete with winner and progresses bracket.

```javascript
import { completeMatch } from '$lib/services/scoring.service'

await completeMatch(matchId, winnerTournamentPlayerId)
```

**Logic:**
- Records winner in match
- Updates status to 'completed'
- Calls `advanceWinnerToNextMatch()`

---

### realtime.service.js

Manages Supabase real-time subscriptions.

#### `subscribeToMatch(matchId, callback)`

Subscribes to real-time updates for a match.

```javascript
import { subscribeToMatch } from '$lib/services/realtime.service'

const unsubscribe = subscribeToMatch(matchId, (updatedData) => {
  console.log('Match updated:', updatedData)
  // Update UI with new data
})

// Later, clean up:
unsubscribe()
```

**Parameters:**
- `matchId` (UUID string) - Match ID
- `callback` (function) - Called when data changes

**Listens to:**
- `legs` table changes for this match
- `turns` table changes for legs in this match
- `darts` table changes for turns in this match

**Returns:**
- Unsubscribe function

---

## Utility Functions

### scoring.utils.js

Pure functions for scoring calculations.

#### `calculateDartValue(multiplier, number)`

```javascript
import { calculateDartValue } from '$lib/utils/scoring.utils'

const value = calculateDartValue(3, 20) // Returns 60 (T20)
const value = calculateDartValue(2, 25) // Returns 50 (Bull)
```

#### `calculateNewScore(currentScore, dartValue)`

```javascript
import { calculateNewScore } from '$lib/utils/scoring.utils'

const newScore = calculateNewScore(501, 60) // Returns 441
```

#### `isBust(currentScore, dartValue, checkoutRequired)`

```javascript
import { isBust } from '$lib/utils/scoring.utils'

const bust = isBust(32, 32, true) // true (can't finish on single)
const bust = isBust(32, 20, true) // false (leaves 12)
```

#### `isCheckout(currentScore, dartValue)`

```javascript
import { isCheckout } from '$lib/utils/scoring.utils'

const checkout = isCheckout(40, 40) // true (D20)
const checkout = isCheckout(40, 20) // false (left with 20, not on double)
```

#### `calculateAverages(darts)`

```javascript
import { calculateAverages } from '$lib/utils/scoring.utils'

const stats = calculateAverages(arrayOfDarts)
console.log(`Average: ${stats.average}`)
console.log(`Checkout %: ${stats.checkoutPercent}`)
```

---

## Error Handling

All service functions follow a consistent error handling pattern:

```javascript
try {
  const result = await someService.someFunction()
  // Success
} catch (error) {
  console.error('Operation failed:', error.message)
  // Handle error appropriately
}
```

Services throw errors that should be caught by components and handled gracefully with user-friendly messages.

---

## Best Practices

### 1. Always Use Services

```javascript
// ❌ Bad - Direct Supabase call in component
const { data } = await supabase.from('players').select()

// ✅ Good - Use service
import { getPlayers } from '$lib/services/player.service'
const players = await getPlayers()
```

### 2. Handle Errors Gracefully

```javascript
// ✅ Good error handling
try {
  await createPlayer(formData)
  showToast('Player created successfully')
} catch (error) {
  showToast(`Failed to create player: ${error.message}`, 'error')
}
```

### 3. Use Appropriate Service

```javascript
// Each domain has its own service
import { getPlayers } from '$lib/services/player.service'           // Players
import { getTournament } from '$lib/services/tournament.service'    // Tournaments
import { getMatch } from '$lib/services/match.service'              // Matches
import { recordDart } from '$lib/services/scoring.service'          // Scoring
```

---

## Adding New Services

When adding new services, follow this pattern:

```javascript
// src/lib/services/example.service.js
import { supabase } from '$lib/supabaseClient'

export async function getItems() {
  const { data, error } = await supabase
    .from('items')
    .select('*')
  
  if (error) throw error
  return data
}

export async function createItem(itemData) {
  const { data, error } = await supabase
    .from('items')
    .insert([itemData])
    .select()
    .single()
  
  if (error) throw error
  return data
}
```

---

For complete implementation examples, see [implementation-guide.md](./implementation-guide.md)
