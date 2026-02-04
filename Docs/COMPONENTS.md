# Component Library

Documentation for reusable UI components in the Tournament Management System.

## Component Organisation

Components are organised by domain:

```
src/lib/components/
├── admin/          # Admin-specific components
├── scorer/         # Scorer-specific components
└── shared/         # Shared components used across app
```

---

## Shared Components

### Button.svelte

Primary button component with consistent styling.

**Usage:**
```svelte
<script>
  import Button from '$lib/components/shared/Button.svelte'
</script>

<Button on:click={handleClick}>
  Click Me
</Button>

<Button variant="secondary">
  Secondary Action
</Button>

<Button variant="danger" disabled>
  Disabled
</Button>
```

**Props:**
- `variant` (string, optional) - 'primary' (default), 'secondary', 'danger', 'success'
- `disabled` (boolean, optional) - Disables the button
- `type` (string, optional) - 'button' (default), 'submit', 'reset'
- `fullWidth` (boolean, optional) - Makes button full width

**Slots:**
- Default slot for button content

**Events:**
- `click` - Fired when button is clicked

---

### Card.svelte

Container component with consistent card styling.

**Usage:**
```svelte
<script>
  import Card from '$lib/components/shared/Card.svelte'
</script>

<Card>
  <h2 slot="header">Card Title</h2>
  
  <p>Card content goes here</p>
  
  <Button slot="footer">Action</Button>
</Card>
```

**Props:**
- `clickable` (boolean, optional) - Adds hover effect for clickable cards
- `padding` (string, optional) - 'normal' (default), 'compact', 'none'

**Slots:**
- `header` - Card header (optional)
- Default slot - Card body
- `footer` - Card footer (optional)

---

### Modal.svelte

Modal dialog component.

**Usage:**
```svelte
<script>
  import Modal from '$lib/components/shared/Modal.svelte'
  
  let showModal = false
</script>

<Button on:click={() => showModal = true}>Open Modal</Button>

<Modal bind:open={showModal} title="Confirm Action">
  <p>Are you sure you want to do this?</p>
  
  <div slot="footer">
    <Button on:click={() => showModal = false}>Cancel</Button>
    <Button variant="danger" on:click={handleConfirm}>Confirm</Button>
  </div>
</Modal>
```

**Props:**
- `open` (boolean, required) - Controls modal visibility (bind:open)
- `title` (string, optional) - Modal title
- `size` (string, optional) - 'small', 'medium' (default), 'large'
- `closeOnEscape` (boolean, optional) - Close on Escape key (default: true)
- `closeOnBackdrop` (boolean, optional) - Close on backdrop click (default: true)

**Slots:**
- Default slot - Modal body
- `footer` - Modal footer with actions

---

### Input.svelte

Form input component with label and validation.

**Usage:**
```svelte
<script>
  import Input from '$lib/components/shared/Input.svelte'
  
  let playerName = ''
  let email = ''
</script>

<Input 
  label="Player Name"
  bind:value={playerName}
  required
  placeholder="Enter name"
/>

<Input 
  type="email"
  label="Email Address"
  bind:value={email}
  error={emailError}
/>
```

**Props:**
- `label` (string, required) - Input label
- `value` (string, required) - Input value (bind:value)
- `type` (string, optional) - 'text' (default), 'email', 'password', 'number'
- `placeholder` (string, optional) - Placeholder text
- `required` (boolean, optional) - Mark as required
- `disabled` (boolean, optional) - Disable input
- `error` (string, optional) - Error message to display

---

### Select.svelte

Dropdown select component.

**Usage:**
```svelte
<script>
  import Select from '$lib/components/shared/Select.svelte'
  
  let format = 'knockout'
  const formats = [
    { value: 'knockout', label: 'Knockout' },
    { value: 'league', label: 'League' },
    { value: 'round_robin', label: 'Round Robin' }
  ]
</script>

<Select 
  label="Tournament Format"
  bind:value={format}
  options={formats}
/>
```

**Props:**
- `label` (string, required) - Select label
- `value` (any, required) - Selected value (bind:value)
- `options` (array, required) - Array of `{ value, label }` objects
- `required` (boolean, optional) - Mark as required
- `disabled` (boolean, optional) - Disable select

---

### Toast.svelte

Toast notification component.

**Usage:**
```svelte
<script>
  import Toast from '$lib/components/shared/Toast.svelte'
  import { toastStore } from '$lib/stores/toast.store'
</script>

<Toast />

<!-- Trigger toast from anywhere: -->
<script>
  import { showToast } from '$lib/stores/toast.store'
  
  function handleSuccess() {
    showToast('Player created successfully', 'success')
  }
  
  function handleError() {
    showToast('Failed to create player', 'error')
  }
</script>
```

**Toast Store Methods:**
- `showToast(message, type, duration)` - Show notification
  - `type`: 'success', 'error', 'warning', 'info'
  - `duration`: milliseconds (default: 3000)

---

### LoadingSpinner.svelte

Loading indicator.

**Usage:**
```svelte
<script>
  import LoadingSpinner from '$lib/components/shared/LoadingSpinner.svelte'
  
  let loading = false
</script>

{#if loading}
  <LoadingSpinner />
{/if}

<!-- Or inline -->
<LoadingSpinner size="small" />
```

**Props:**
- `size` (string, optional) - 'small', 'medium' (default), 'large'
- `message` (string, optional) - Loading message to display

---

### ConfirmDialog.svelte

Confirmation dialog for destructive actions.

**Usage:**
```svelte
<script>
  import ConfirmDialog from '$lib/components/shared/ConfirmDialog.svelte'
  
  let showConfirm = false
  
  async function handleDelete() {
    showConfirm = false
    await deletePlayer(playerId)
  }
</script>

<Button variant="danger" on:click={() => showConfirm = true}>
  Delete Player
</Button>

<ConfirmDialog 
  bind:open={showConfirm}
  title="Delete Player"
  message="Are you sure you want to delete this player? This action cannot be undone."
  confirmText="Delete"
  confirmVariant="danger"
  on:confirm={handleDelete}
/>
```

**Props:**
- `open` (boolean, required) - Controls visibility (bind:open)
- `title` (string, required) - Dialog title
- `message` (string, required) - Confirmation message
- `confirmText` (string, optional) - Confirm button text (default: "Confirm")
- `cancelText` (string, optional) - Cancel button text (default: "Cancel")
- `confirmVariant` (string, optional) - Button variant (default: "danger")

**Events:**
- `confirm` - Fired when confirmed
- `cancel` - Fired when cancelled

---

## Admin Components

### TournamentCard.svelte

Tournament card for list view.

**Usage:**
```svelte
<script>
  import TournamentCard from '$lib/components/admin/TournamentCard.svelte'
</script>

<TournamentCard 
  tournament={tournamentData}
  on:click={() => goto(`/admin/tournaments/${tournament.id}`)}
/>
```

**Props:**
- `tournament` (object, required) - Tournament data
  - `id`, `name`, `format`, `status`, `tournament_players` (array)

**Events:**
- `click` - Fired when card is clicked

---

### TournamentForm.svelte

Form for creating/editing tournaments.

**Usage:**
```svelte
<script>
  import TournamentForm from '$lib/components/admin/TournamentForm.svelte'
  
  async function handleSubmit(formData) {
    await createTournament(formData)
    goto('/admin/tournaments')
  }
</script>

<TournamentForm 
  players={allPlayers}
  on:submit={handleSubmit}
/>

<!-- Edit mode -->
<TournamentForm 
  tournament={existingTournament}
  players={allPlayers}
  mode="edit"
  on:submit={handleUpdate}
/>
```

**Props:**
- `tournament` (object, optional) - Existing tournament for edit mode
- `players` (array, required) - Available players
- `mode` (string, optional) - 'create' (default) or 'edit'

**Events:**
- `submit` - Fired with form data when submitted

**Form Data Structure:**
```javascript
{
  name: string,
  format: 'knockout' | 'league' | 'round_robin' | 'groups_to_knockout',
  best_of_legs: number,
  starting_score: number,
  player_ids: string[] // Array of player IDs
}
```

---

### PlayerList.svelte

Table displaying players with actions.

**Usage:**
```svelte
<script>
  import PlayerList from '$lib/components/admin/PlayerList.svelte'
</script>

<PlayerList 
  players={allPlayers}
  on:edit={handleEdit}
  on:delete={handleDelete}
/>
```

**Props:**
- `players` (array, required) - Array of player objects
- `selectable` (boolean, optional) - Show checkboxes for selection
- `selected` (array, optional) - Array of selected player IDs (bind:selected)

**Events:**
- `edit` - Fired with player when edit clicked
- `delete` - Fired with player when delete clicked
- `select` - Fired with selected players array

---

### BracketView.svelte

Visual bracket display for knockout tournaments.

**Usage:**
```svelte
<script>
  import BracketView from '$lib/components/admin/BracketView.svelte'
</script>

<BracketView 
  matches={tournamentMatches}
  on:matchClick={handleMatchClick}
/>
```

**Props:**
- `matches` (array, required) - Array of match objects with players
- `interactive` (boolean, optional) - Enable match clicking (default: true)

**Events:**
- `matchClick` - Fired with match when clicked

---

### MatchCard.svelte

Match card showing players and status.

**Usage:**
```svelte
<script>
  import MatchCard from '$lib/components/admin/MatchCard.svelte'
</script>

<MatchCard 
  match={matchData}
  showAssign={match.status === 'pending'}
  on:assign={handleAssign}
  on:view={handleView}
/>
```

**Props:**
- `match` (object, required) - Match data with players
- `showAssign` (boolean, optional) - Show assign button
- `compact` (boolean, optional) - Compact card view

**Events:**
- `assign` - Fired when assign button clicked
- `view` - Fired when view button clicked

---

### MatchAssignment.svelte

Modal for assigning match to scorer.

**Usage:**
```svelte
<script>
  import MatchAssignment from '$lib/components/admin/MatchAssignment.svelte'
  
  let showAssign = false
</script>

<MatchAssignment 
  bind:open={showAssign}
  match={selectedMatch}
  scorers={availableScorers}
  on:assign={handleAssign}
/>
```

**Props:**
- `open` (boolean, required) - Controls visibility (bind:open)
- `match` (object, required) - Match to assign
- `scorers` (array, required) - Available scorer users

**Events:**
- `assign` - Fired with `{ matchId, scorerId }` when assigned

---

## Scorer Components

### DartEntry.svelte

Main dart entry interface coordinator.

**Usage:**
```svelte
<script>
  import DartEntry from '$lib/components/scorer/DartEntry.svelte'
</script>

<DartEntry 
  match={matchData}
  leg={currentLeg}
  on:dartRecorded={handleDartRecorded}
  on:legComplete={handleLegComplete}
/>
```

**Props:**
- `match` (object, required) - Match data
- `leg` (object, required) - Current leg data
- `currentPlayer` (object, required) - Whose turn it is

**Events:**
- `dartRecorded` - Fired with dart data when recorded
- `turnComplete` - Fired when 3 darts entered
- `legComplete` - Fired when leg finished

---

### NumberGrid.svelte

Number pad for dart entry (1-20 + bullseye).

**Usage:**
```svelte
<script>
  import NumberGrid from '$lib/components/scorer/NumberGrid.svelte'
  
  function handleNumberSelect(number) {
    console.log('Selected:', number) // 1-20 or 25
  }
</script>

<NumberGrid 
  on:select={handleNumberSelect}
  disabled={false}
/>
```

**Props:**
- `disabled` (boolean, optional) - Disable all buttons
- `layout` (string, optional) - 'standard' (default), 'compact'

**Events:**
- `select` - Fired with selected number (1-20 or 25)

---

### MultiplierSelector.svelte

Multiplier selection (Single/Double/Treble).

**Usage:**
```svelte
<script>
  import MultiplierSelector from '$lib/components/scorer/MultiplierSelector.svelte'
  
  let multiplier = 1
</script>

<MultiplierSelector 
  bind:value={multiplier}
  on:change={handleMultiplierChange}
/>
```

**Props:**
- `value` (number, required) - Current multiplier (1, 2, or 3) - bind:value

**Events:**
- `change` - Fired when multiplier changes

---

### Scoreboard.svelte

Current game state display.

**Usage:**
```svelte
<script>
  import Scoreboard from '$lib/components/scorer/Scoreboard.svelte'
</script>

<Scoreboard 
  player1={player1Data}
  player2={player2Data}
  player1Score={441}
  player2Score={381}
  currentPlayer={1}
  legNumber={2}
/>
```

**Props:**
- `player1`, `player2` (object, required) - Player data with `name`
- `player1Score`, `player2Score` (number, required) - Current scores
- `currentPlayer` (number, required) - 1 or 2 (whose turn)
- `legNumber` (number, required) - Current leg number
- `compact` (boolean, optional) - Compact view for smaller screens

---

### TurnHistory.svelte

Collapsible turn history display.

**Usage:**
```svelte
<script>
  import TurnHistory from '$lib/components/scorer/TurnHistory.svelte'
</script>

<TurnHistory 
  turns={legTurns}
  collapsed={true}
/>
```

**Props:**
- `turns` (array, required) - Array of turn objects
- `collapsed` (boolean, optional) - Initially collapsed (default: true)

---

### CheckoutSuggestions.svelte

Displays checkout suggestions for current score.

**Usage:**
```svelte
<script>
  import CheckoutSuggestions from '$lib/components/scorer/CheckoutSuggestions.svelte'
</script>

<CheckoutSuggestions 
  score={40}
  visible={score <= 170}
/>
```

**Props:**
- `score` (number, required) - Current score to checkout
- `visible` (boolean, optional) - Show/hide suggestions

---

### MatchSummary.svelte

Post-match statistics and summary.

**Usage:**
```svelte
<script>
  import MatchSummary from '$lib/components/scorer/MatchSummary.svelte'
</script>

<MatchSummary 
  match={completedMatch}
  winner={winnerPlayer}
  stats={matchStatistics}
  on:close={handleClose}
/>
```

**Props:**
- `match` (object, required) - Completed match data
- `winner` (object, required) - Winning player
- `stats` (object, required) - Match statistics

**Events:**
- `close` - Fired when close button clicked

---

## Component Best Practices

### 1. Consistent Prop Naming

```svelte
<!-- ✅ Good -->
<Component 
  tournament={data}
  on:click={handler}
/>

<!-- ❌ Bad -->
<Component 
  tournamentData={data}
  onClick={handler}
/>
```

### 2. Event Handlers

```svelte
<!-- Use on: prefix for events -->
<Button on:click={handleClick}>Click</Button>

<!-- Dispatch custom events with detail -->
<script>
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()
  
  function handleSubmit() {
    dispatch('submit', { formData })
  }
</script>
```

### 3. Bind Properties When Needed

```svelte
<!-- Two-way binding for form inputs -->
<Input bind:value={playerName} />

<!-- Two-way binding for modal visibility -->
<Modal bind:open={showModal} />
```

### 4. Slot Usage

```svelte
<!-- Named slots for flexibility -->
<Card>
  <h2 slot="header">Title</h2>
  Content
  <Button slot="footer">Action</Button>
</Card>
```

### 5. Responsive Design

```svelte
<!-- Use responsive props -->
<Scoreboard compact={isMobile} />

<!-- Or use CSS media queries in component -->
<style>
  .container {
    /* Mobile first */
    padding: 1rem;
  }
  
  @media (min-width: 768px) {
    .container {
      padding: 2rem;
    }
  }
</style>
```

---

## Creating New Components

When creating new components, follow this template:

```svelte
<!-- src/lib/components/domain/ComponentName.svelte -->
<script>
  import { createEventDispatcher } from 'svelte'
  
  // Props
  export let requiredProp
  export let optionalProp = 'default value'
  
  // Events
  const dispatch = createEventDispatcher()
  
  // Local state
  let internalState = false
  
  // Functions
  function handleAction() {
    dispatch('action', { data })
  }
</script>

<!-- Template -->
<div class="component-name">
  <slot name="header" />
  <slot />
  <slot name="footer" />
</div>

<!-- Styles (scoped to component) -->
<style>
  .component-name {
    /* Mobile-first styles */
  }
  
  @media (min-width: 768px) {
    /* Tablet/desktop styles */
  }
</style>
```

---

For complete implementation examples, see [implementation-guide.md](./implementation-guide.md)
