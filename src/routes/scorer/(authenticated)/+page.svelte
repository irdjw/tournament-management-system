<script>
  import { onMount } from 'svelte'
  import { getMatchesForScorer } from '$lib/services/match.service'

  let { data } = $props()

  let matches = $state([])
  let loading = $state(true)
  let error = $state(null)

  onMount(async () => {
    await loadMatches()
  })

  async function loadMatches() {
    loading = true
    error = null

    const userId = data.session?.user?.id
    if (!userId) {
      loading = false
      return
    }

    const result = await getMatchesForScorer(userId)

    if (result.error) {
      error = result.error.message
    } else {
      matches = result.data || []
    }
    loading = false
  }

  function getStatusLabel(status) {
    const labels = {
      assigned: 'Ready to Start',
      in_progress: 'In Progress'
    }
    return labels[status] || status
  }

  function getStatusClass(status) {
    const classes = {
      assigned: 'status--assigned',
      in_progress: 'status--in-progress'
    }
    return classes[status] || ''
  }
</script>

<div class="scorer-dashboard">
  <h1>Scorer Dashboard</h1>
  <p class="welcome">Welcome, {data.user?.display_name || data.session?.user?.email}!</p>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  <section class="matches-section">
    <h2>Your Assigned Matches</h2>

    {#if loading}
      <div class="loading">Loading matches...</div>
    {:else if matches.length === 0}
      <div class="empty-state">
        <p>No matches assigned yet.</p>
        <p class="hint">Matches will appear here when an administrator assigns them to you.</p>
      </div>
    {:else}
      <div class="matches-list">
        {#each matches as match}
          <a href="/scorer/match/{match.id}" class="match-card">
            <div class="match-header">
              <span class="tournament-name">{match.tournament?.name || 'Tournament'}</span>
              <span class="status {getStatusClass(match.status)}">
                {getStatusLabel(match.status)}
              </span>
            </div>

            <div class="match-players">
              <span class="player">{match.player1?.player?.name || 'TBD'}</span>
              <span class="vs">vs</span>
              <span class="player">{match.player2?.player?.name || 'TBD'}</span>
            </div>

            <div class="match-info">
              <span>Best of {match.best_of_legs || match.tournament?.default_best_of_legs || 5}</span>
              <span>•</span>
              <span>{match.starting_score || match.tournament?.default_starting_score || 501}</span>
            </div>

            {#if match.status === 'in_progress'}
              <div class="match-score">
                <span>{match.player1_legs_won || 0}</span>
                <span class="score-divider">-</span>
                <span>{match.player2_legs_won || 0}</span>
              </div>
            {/if}

            <div class="match-action">
              {#if match.status === 'assigned'}
                <span class="action-text">Tap to Start Scoring →</span>
              {:else}
                <span class="action-text">Tap to Continue →</span>
              {/if}
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </section>
</div>

<style>
  .scorer-dashboard {
    padding: 1rem;
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
  }

  h1 {
    font-size: 1.5rem;
    color: var(--colour-text);
    margin-bottom: 0.25rem;
  }

  .welcome {
    color: var(--colour-text-light);
    margin-bottom: 1.5rem;
  }

  .error-message {
    background: var(--colour-error-light);
    color: var(--colour-error);
    padding: 1rem;
    border-radius: var(--radius-md);
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 1.125rem;
    color: var(--colour-text);
    margin-bottom: 1rem;
  }

  .matches-section {
    background: white;
    border-radius: var(--radius-md);
    padding: 1.25rem;
    box-shadow: var(--shadow-sm);
  }

  .loading {
    text-align: center;
    padding: 2rem;
    color: var(--colour-text-light);
  }

  .empty-state {
    text-align: center;
    padding: 2rem 1rem;
    color: var(--colour-text-light);
  }

  .empty-state p {
    margin-bottom: 0.5rem;
  }

  .hint {
    font-size: 0.875rem;
    opacity: 0.8;
  }

  .matches-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .match-card {
    display: block;
    background: var(--colour-background);
    border-radius: var(--radius-md);
    padding: 1rem;
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s, box-shadow 0.2s;
    border: 2px solid transparent;
  }

  .match-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    text-decoration: none;
  }

  .match-card:active {
    transform: scale(0.98);
  }

  .match-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  .tournament-name {
    font-size: 0.75rem;
    color: var(--colour-text-light);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .status {
    font-size: 0.6875rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
    text-transform: uppercase;
  }

  .status--assigned {
    background: #e3f2fd;
    color: #1976d2;
  }

  .status--in-progress {
    background: #fff3e0;
    color: #f57c00;
  }

  .match-players {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
  }

  .player {
    font-size: 1rem;
    font-weight: 600;
    color: var(--colour-text);
  }

  .vs {
    font-size: 0.75rem;
    color: var(--colour-text-light);
    text-transform: uppercase;
  }

  .match-info {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--colour-text-light);
    margin-bottom: 0.75rem;
  }

  .match-score {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--colour-primary);
    margin-bottom: 0.75rem;
  }

  .score-divider {
    color: var(--colour-text-light);
  }

  .match-action {
    text-align: center;
  }

  .action-text {
    font-size: 0.875rem;
    color: var(--colour-primary);
    font-weight: 500;
  }
</style>
