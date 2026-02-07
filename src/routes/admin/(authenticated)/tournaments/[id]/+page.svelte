<script>
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  import { getTournament, removePlayerFromTournament, isValidKnockoutPlayerCount } from '$lib/services/tournament.service'
  import { generateKnockoutBracket } from '$lib/services/bracket.service'

  let tournament = $state(null)
  let loading = $state(true)
  let error = $state(null)
  let generating = $state(false)

  onMount(async () => {
    await loadTournament()
  })

  async function loadTournament() {
    loading = true
    error = null

    const result = await getTournament($page.params.id)

    if (result.error) {
      error = result.error.message
    } else {
      tournament = result.data
    }
    loading = false
  }

  async function handleRemovePlayer(tournamentPlayer) {
    const result = await removePlayerFromTournament(
      tournament.id,
      tournamentPlayer.player.id
    )
    if (result.error) {
      error = result.error.message
    } else {
      tournament.tournament_players = tournament.tournament_players.filter(
        tp => tp.id !== tournamentPlayer.id
      )
    }
  }

  async function handleGenerateBracket() {
    generating = true
    error = null

    const result = await generateKnockoutBracket(tournament.id)

    if (result.error) {
      error = result.error.message
      generating = false
    } else {
      goto(`/admin/tournaments/${tournament.id}/bracket`)
    }
  }

  function canGenerateBracket() {
    if (!tournament) return false
    if (tournament.status !== 'setup') return false
    return isValidKnockoutPlayerCount(tournament.tournament_players?.length || 0)
  }

  function getStatusColour(status) {
    const colours = {
      setup: 'warning',
      in_progress: 'info',
      completed: 'success',
      cancelled: 'error'
    }
    return colours[status] || 'default'
  }
</script>

<div class="tournament-detail-page">
  <header class="page-header">
    <a href="/admin/tournaments" class="back-link">← Back to Tournaments</a>
  </header>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  {#if loading}
    <div class="loading">Loading tournament...</div>
  {:else if tournament}
    <div class="tournament-card">
      <div class="tournament-header">
        <div class="title-section">
          <h1>{tournament.name}</h1>
          <span class="status status--{getStatusColour(tournament.status)}">
            {tournament.status.replace('_', ' ')}
          </span>
        </div>
        <div class="header-actions">
          {#if tournament.status === 'in_progress' || tournament.status === 'completed'}
            <a href="/admin/tournaments/{tournament.id}/bracket" class="btn btn--primary">
              View Bracket
            </a>
          {/if}
        </div>
      </div>

      <div class="tournament-info">
        <div class="info-row">
          <span class="label">Game:</span>
          <span class="value">{tournament.game_type?.display_name}</span>
        </div>
        <div class="info-row">
          <span class="label">Format:</span>
          <span class="value">{tournament.format}</span>
        </div>
        <div class="info-row">
          <span class="label">Best of:</span>
          <span class="value">{tournament.default_best_of_legs} legs</span>
        </div>
        <div class="info-row">
          <span class="label">Starting Score:</span>
          <span class="value">{tournament.default_starting_score}</span>
        </div>
      </div>
    </div>

    <div class="players-section">
      <div class="section-header">
        <h2>Players ({tournament.tournament_players?.length || 0})</h2>
        {#if tournament.status === 'setup'}
          {#if canGenerateBracket()}
            <button
              onclick={handleGenerateBracket}
              class="btn btn--primary"
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate Bracket'}
            </button>
          {:else}
            <span class="hint">
              Need {isValidKnockoutPlayerCount(tournament.tournament_players?.length || 0) ? '' : '4, 8, 16, or 32'} players to generate bracket
            </span>
          {/if}
        {/if}
      </div>

      {#if tournament.tournament_players?.length === 0}
        <div class="empty-players">
          <p>No players registered yet.</p>
          <p class="hint">Add players when creating the tournament.</p>
        </div>
      {:else}
        <div class="players-list">
          {#each tournament.tournament_players.sort((a, b) => (a.seed_number || 999) - (b.seed_number || 999)) as tp}
            <div class="player-row">
              <div class="player-info">
                <span class="seed">#{tp.seed_number || '-'}</span>
                <span class="name">{tp.player?.name}</span>
              </div>
              {#if tournament.status === 'setup'}
                <button
                  onclick={() => handleRemovePlayer(tp)}
                  class="btn btn--small btn--outline"
                >
                  Remove
                </button>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {:else}
    <div class="not-found">Tournament not found</div>
  {/if}
</div>

<style>
  .tournament-detail-page {
    max-width: 700px;
    margin: 0 auto;
  }

  .page-header {
    margin-bottom: 1rem;
  }

  .back-link {
    color: var(--colour-text-light);
    font-size: 0.875rem;
  }

  .error-message {
    background: var(--colour-error-light);
    color: var(--colour-error);
    padding: 1rem;
    border-radius: var(--radius-md);
    margin-bottom: 1rem;
  }

  .loading, .not-found {
    text-align: center;
    padding: 2rem;
    color: var(--colour-text-light);
  }

  .tournament-card {
    background: white;
    padding: 1.5rem;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    margin-bottom: 1.5rem;
  }

  .tournament-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
  }

  .title-section {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .title-section h1 {
    font-size: 1.5rem;
    color: var(--colour-text);
    margin: 0;
  }

  .status {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
    text-transform: uppercase;
    font-weight: 600;
  }

  .status--warning { background: var(--colour-warning-light); color: var(--colour-warning); }
  .status--info { background: var(--colour-info-light); color: var(--colour-info); }
  .status--success { background: var(--colour-success-light); color: var(--colour-success); }
  .status--error { background: var(--colour-error-light); color: var(--colour-error); }

  .tournament-info {
    display: grid;
    gap: 0.75rem;
  }

  .info-row {
    display: flex;
    gap: 0.5rem;
  }

  .info-row .label {
    font-weight: 500;
    color: var(--colour-text-light);
    min-width: 120px;
  }

  .info-row .value {
    color: var(--colour-text);
  }

  .players-section {
    background: white;
    padding: 1.5rem;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .section-header h2 {
    font-size: 1.125rem;
    color: var(--colour-text);
    margin: 0;
  }

  .section-header .hint {
    font-size: 0.875rem;
    color: var(--colour-text-light);
  }

  .empty-players {
    text-align: center;
    padding: 2rem;
    color: var(--colour-text-light);
  }

  .empty-players .hint {
    font-size: 0.875rem;
  }

  .players-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .player-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: var(--colour-background);
    border-radius: var(--radius-md);
  }

  .player-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .player-info .seed {
    font-weight: 600;
    color: var(--colour-primary);
    min-width: 2rem;
  }

  .player-info .name {
    color: var(--colour-text);
  }

  .btn--small {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }

  .btn--outline {
    background: transparent;
    border: 1px solid var(--colour-border);
    color: var(--colour-text-light);
  }

  .btn--outline:hover {
    border-color: var(--colour-error);
    color: var(--colour-error);
  }
</style>
