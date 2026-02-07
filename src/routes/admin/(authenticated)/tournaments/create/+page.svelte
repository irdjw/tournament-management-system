<script>
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { createTournament, getGameTypes, addPlayerToTournament, isValidKnockoutPlayerCount } from '$lib/services/tournament.service'
  import { getPlayers } from '$lib/services/player.service'

  let gameTypes = $state([])
  let players = $state([])
  let selectedPlayers = $state([])

  let name = $state('')
  let gameTypeId = $state('')
  let format = $state('knockout')
  let bestOfLegs = $state(5)
  let startingScore = $state(501)

  let loading = $state(true)
  let saving = $state(false)
  let error = $state(null)

  onMount(async () => {
    await Promise.all([loadGameTypes(), loadPlayers()])
    loading = false
  })

  async function loadGameTypes() {
    const result = await getGameTypes()
    if (result.data) {
      gameTypes = result.data
      if (gameTypes.length > 0) {
        gameTypeId = gameTypes[0].id
      }
    }
  }

  async function loadPlayers() {
    const result = await getPlayers()
    if (result.data) {
      players = result.data
    }
  }

  function togglePlayer(player) {
    if (selectedPlayers.find(p => p.id === player.id)) {
      selectedPlayers = selectedPlayers.filter(p => p.id !== player.id)
    } else {
      selectedPlayers = [...selectedPlayers, player]
    }
  }

  function isPlayerSelected(player) {
    return selectedPlayers.some(p => p.id === player.id)
  }

  function getValidationMessage() {
    if (format === 'knockout' && !isValidKnockoutPlayerCount(selectedPlayers.length)) {
      return `Knockout tournaments require 4, 8, 16, or 32 players. Currently selected: ${selectedPlayers.length}`
    }
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!name.trim()) {
      error = 'Tournament name is required'
      return
    }

    if (!gameTypeId) {
      error = 'Please select a game type'
      return
    }

    const validationMsg = getValidationMessage()
    if (validationMsg) {
      error = validationMsg
      return
    }

    saving = true
    error = null

    // Create tournament
    const result = await createTournament({
      name: name.trim(),
      gameTypeId,
      format,
      bestOfLegs,
      startingScore
    })

    if (result.error) {
      error = result.error.message
      saving = false
      return
    }

    const tournamentId = result.data.id

    // Add players with seed numbers
    for (let i = 0; i < selectedPlayers.length; i++) {
      const playerResult = await addPlayerToTournament(
        tournamentId,
        selectedPlayers[i].id,
        i + 1 // Seed number based on selection order
      )
      if (playerResult.error) {
        error = `Failed to add player: ${playerResult.error.message}`
        saving = false
        return
      }
    }

    goto(`/admin/tournaments/${tournamentId}`)
  }
</script>

<div class="create-tournament-page">
  <header class="page-header">
    <a href="/admin/tournaments" class="back-link">← Back to Tournaments</a>
    <h1>Create Tournament</h1>
  </header>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  {#if loading}
    <div class="loading">Loading...</div>
  {:else}
    <form onsubmit={handleSubmit} class="tournament-form">
      <div class="form-section">
        <h2>Tournament Details</h2>

        <div class="form-group">
          <label for="name">Tournament Name <span class="required">*</span></label>
          <input
            type="text"
            id="name"
            bind:value={name}
            placeholder="e.g., Friday Night Darts"
            required
            disabled={saving}
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="gameType">Game Type</label>
            <select id="gameType" bind:value={gameTypeId} disabled={saving}>
              {#each gameTypes as gt}
                <option value={gt.id}>{gt.display_name}</option>
              {/each}
            </select>
          </div>

          <div class="form-group">
            <label for="format">Format</label>
            <select id="format" bind:value={format} disabled={saving}>
              <option value="knockout">Knockout</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="bestOfLegs">Best of Legs</label>
            <select id="bestOfLegs" bind:value={bestOfLegs} disabled={saving}>
              <option value={3}>Best of 3</option>
              <option value={5}>Best of 5</option>
              <option value={7}>Best of 7</option>
              <option value={9}>Best of 9</option>
              <option value={11}>Best of 11</option>
            </select>
          </div>

          <div class="form-group">
            <label for="startingScore">Starting Score</label>
            <select id="startingScore" bind:value={startingScore} disabled={saving}>
              <option value={301}>301</option>
              <option value={501}>501</option>
              <option value={701}>701</option>
            </select>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h2>Select Players</h2>
        <p class="section-hint">
          Select players in seeding order. First selected = Seed #1.
          {#if format === 'knockout'}
            <strong>Knockout requires 4, 8, 16, or 32 players.</strong>
          {/if}
        </p>

        {#if getValidationMessage()}
          <div class="validation-warning">{getValidationMessage()}</div>
        {/if}

        <div class="selected-count">
          Selected: {selectedPlayers.length} player{selectedPlayers.length !== 1 ? 's' : ''}
        </div>

        {#if players.length === 0}
          <div class="no-players">
            <p>No players available.</p>
            <a href="/admin/players/create" class="btn btn--secondary">Add Players First</a>
          </div>
        {:else}
          <div class="players-grid">
            {#each players as player}
              <button
                type="button"
                class="player-option"
                class:selected={isPlayerSelected(player)}
                onclick={() => togglePlayer(player)}
                disabled={saving}
              >
                <span class="player-name">{player.name}</span>
                {#if isPlayerSelected(player)}
                  <span class="seed-badge">
                    #{selectedPlayers.findIndex(p => p.id === player.id) + 1}
                  </span>
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <div class="form-actions">
        <a href="/admin/tournaments" class="btn btn--secondary">Cancel</a>
        <button
          type="submit"
          class="btn btn--primary"
          disabled={saving || !!getValidationMessage()}
        >
          {saving ? 'Creating...' : 'Create Tournament'}
        </button>
      </div>
    </form>
  {/if}
</div>

<style>
  .create-tournament-page {
    max-width: 700px;
    margin: 0 auto;
  }

  .page-header {
    margin-bottom: 1.5rem;
  }

  .back-link {
    display: inline-block;
    color: var(--colour-text-light);
    font-size: 0.875rem;
    margin-bottom: 0.5rem;
  }

  .page-header h1 {
    font-size: 1.5rem;
    color: var(--colour-text);
    margin: 0;
  }

  .error-message {
    background: var(--colour-error-light);
    color: var(--colour-error);
    padding: 1rem;
    border-radius: var(--radius-md);
    margin-bottom: 1rem;
  }

  .loading {
    text-align: center;
    padding: 2rem;
    color: var(--colour-text-light);
  }

  .tournament-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-section {
    background: white;
    padding: 1.5rem;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
  }

  .form-section h2 {
    font-size: 1.125rem;
    color: var(--colour-text);
    margin: 0 0 1rem 0;
  }

  .section-hint {
    font-size: 0.875rem;
    color: var(--colour-text-light);
    margin-bottom: 1rem;
  }

  .validation-warning {
    background: var(--colour-warning-light);
    color: var(--colour-warning);
    padding: 0.75rem 1rem;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: var(--colour-text);
  }

  .required {
    color: var(--colour-error);
  }

  .form-group input,
  .form-group select {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--colour-border);
    border-radius: var(--radius-md);
    font-size: 1rem;
    background: white;
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: var(--colour-primary);
  }

  .form-row {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr 1fr;
  }

  .selected-count {
    font-weight: 600;
    color: var(--colour-primary);
    margin-bottom: 1rem;
  }

  .no-players {
    text-align: center;
    padding: 2rem;
    color: var(--colour-text-light);
  }

  .players-grid {
    display: grid;
    gap: 0.5rem;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .player-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border: 2px solid var(--colour-border);
    border-radius: var(--radius-md);
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
  }

  .player-option:hover {
    border-color: var(--colour-primary);
  }

  .player-option.selected {
    border-color: var(--colour-primary);
    background: var(--colour-primary-light);
  }

  .player-option:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .player-name {
    font-weight: 500;
    color: var(--colour-text);
  }

  .seed-badge {
    background: var(--colour-primary);
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    .form-row {
      grid-template-columns: 1fr;
    }
  }
</style>
