<script>
  import { onMount } from 'svelte'
  import { getTournaments, deleteTournament } from '$lib/services/tournament.service'

  let tournaments = $state([])
  let loading = $state(true)
  let error = $state(null)
  let deleteConfirm = $state(null)

  onMount(async () => {
    await loadTournaments()
  })

  async function loadTournaments() {
    loading = true
    error = null
    const result = await getTournaments()
    if (result.error) {
      error = result.error.message
    } else {
      tournaments = result.data || []
    }
    loading = false
  }

  async function handleDelete(tournament) {
    if (deleteConfirm !== tournament.id) {
      deleteConfirm = tournament.id
      return
    }

    const result = await deleteTournament(tournament.id)
    if (result.error) {
      error = result.error.message
    } else {
      tournaments = tournaments.filter(t => t.id !== tournament.id)
    }
    deleteConfirm = null
  }

  function getPlayerCount(tournament) {
    return tournament.tournament_players?.[0]?.count || 0
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

<div class="tournaments-page">
  <header class="page-header">
    <h1>Tournaments</h1>
    <a href="/admin/tournaments/create" class="btn btn--primary">Create Tournament</a>
  </header>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  {#if loading}
    <div class="loading">Loading tournaments...</div>
  {:else if tournaments.length === 0}
    <div class="empty-state">
      <p>No tournaments yet.</p>
      <a href="/admin/tournaments/create" class="btn btn--primary">Create Your First Tournament</a>
    </div>
  {:else}
    <div class="tournaments-grid">
      {#each tournaments as tournament}
        <div class="tournament-card">
          <div class="tournament-header">
            <span class="status status--{getStatusColour(tournament.status)}">
              {tournament.status.replace('_', ' ')}
            </span>
            <span class="format">{tournament.format}</span>
          </div>

          <h3>{tournament.name}</h3>

          <div class="tournament-meta">
            <span class="game-type">{tournament.game_type?.display_name || 'Unknown'}</span>
            <span class="player-count">{getPlayerCount(tournament)} players</span>
          </div>

          <div class="tournament-config">
            <span>Best of {tournament.default_best_of_legs}</span>
            <span>{tournament.default_starting_score} start</span>
          </div>

          <div class="tournament-actions">
            <a href="/admin/tournaments/{tournament.id}" class="btn btn--secondary">
              View Details
            </a>
            {#if tournament.status === 'setup'}
              {#if deleteConfirm === tournament.id}
                <button onclick={() => handleDelete(tournament)} class="btn btn--danger btn--small">
                  Confirm
                </button>
                <button onclick={() => deleteConfirm = null} class="btn btn--small">
                  Cancel
                </button>
              {:else}
                <button onclick={() => handleDelete(tournament)} class="btn btn--outline btn--small">
                  Delete
                </button>
              {/if}
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .tournaments-page {
    max-width: 1000px;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
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

  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    background: white;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
  }

  .empty-state p {
    color: var(--colour-text-light);
    margin-bottom: 1rem;
  }

  .tournaments-grid {
    display: grid;
    gap: 1rem;
  }

  .tournament-card {
    background: white;
    padding: 1.25rem;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
  }

  .tournament-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
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

  .format {
    font-size: 0.875rem;
    color: var(--colour-text-light);
    text-transform: capitalize;
  }

  .tournament-card h3 {
    font-size: 1.125rem;
    color: var(--colour-text);
    margin: 0 0 0.75rem 0;
  }

  .tournament-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--colour-text-light);
    margin-bottom: 0.5rem;
  }

  .tournament-config {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--colour-text-light);
    margin-bottom: 1rem;
  }

  .tournament-actions {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
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

  .btn--danger {
    background: var(--colour-error);
    color: white;
  }

  @media (min-width: 768px) {
    .tournaments-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
