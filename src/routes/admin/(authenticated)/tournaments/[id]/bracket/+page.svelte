<script>
  import { page } from '$app/stores'
  import { onMount } from 'svelte'
  import { getTournament } from '$lib/services/tournament.service'
  import { getBracket, getRoundName } from '$lib/services/bracket.service'
  import { assignMatchToScorer, getScorers } from '$lib/services/match.service'

  let tournament = $state(null)
  let bracket = $state(null)
  let scorers = $state([])
  let loading = $state(true)
  let error = $state(null)
  let selectedMatch = $state(null)
  let assigningScorer = $state(false)

  onMount(async () => {
    await Promise.all([loadTournament(), loadBracket(), loadScorers()])
    loading = false
  })

  async function loadTournament() {
    const result = await getTournament($page.params.id)
    if (result.error) {
      error = result.error.message
    } else {
      tournament = result.data
    }
  }

  async function loadBracket() {
    const result = await getBracket($page.params.id)
    if (result.error) {
      error = result.error.message
    } else {
      bracket = result.data
    }
  }

  async function loadScorers() {
    const result = await getScorers()
    if (result.data) {
      scorers = result.data
    }
  }

  function getPlayerName(tournamentPlayer) {
    if (!tournamentPlayer) return 'TBD'
    return tournamentPlayer.player?.name || 'Unknown'
  }

  function getMatchStatusClass(match) {
    const classes = {
      pending: 'match--pending',
      assigned: 'match--assigned',
      in_progress: 'match--in-progress',
      completed: 'match--completed'
    }
    return classes[match.status] || ''
  }

  function openAssignModal(match) {
    selectedMatch = match
  }

  function closeAssignModal() {
    selectedMatch = null
  }

  async function handleAssignScorer(scorerId) {
    if (!selectedMatch) return

    assigningScorer = true
    const result = await assignMatchToScorer(selectedMatch.id, scorerId)

    if (result.error) {
      error = result.error.message
    } else {
      // Update match in bracket
      const round = bracket.rounds[selectedMatch.round]
      const matchIndex = round.findIndex(m => m.id === selectedMatch.id)
      if (matchIndex !== -1) {
        round[matchIndex] = {
          ...round[matchIndex],
          status: 'assigned',
          assigned_to_user_id: scorerId,
          scorer: scorers.find(s => s.id === scorerId)
        }
        bracket = { ...bracket }
      }
    }

    assigningScorer = false
    selectedMatch = null
  }
</script>

<div class="bracket-page">
  <header class="page-header">
    <a href="/admin/tournaments/{$page.params.id}" class="back-link">← Back to Tournament</a>
    {#if tournament}
      <h1>{tournament.name} - Bracket</h1>
    {/if}
  </header>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  {#if loading}
    <div class="loading">Loading bracket...</div>
  {:else if bracket}
    <div class="bracket-container">
      <div class="bracket">
        {#each Array.from({ length: bracket.totalRounds }, (_, i) => bracket.totalRounds - i) as round}
          <div class="round">
            <h3 class="round-title">{getRoundName(round, bracket.totalRounds)}</h3>
            <div class="matches">
              {#each bracket.rounds[round] || [] as match}
                <div class="match {getMatchStatusClass(match)}">
                  <div class="match-players">
                    <div class="player" class:winner={match.winner?.id === match.player1?.id}>
                      <span class="seed">{match.player1?.seed_number || '-'}</span>
                      <span class="name">{getPlayerName(match.player1)}</span>
                      {#if match.status === 'completed'}
                        <span class="legs">{match.player1_legs_won}</span>
                      {/if}
                    </div>
                    <div class="player" class:winner={match.winner?.id === match.player2?.id}>
                      <span class="seed">{match.player2?.seed_number || '-'}</span>
                      <span class="name">{getPlayerName(match.player2)}</span>
                      {#if match.status === 'completed'}
                        <span class="legs">{match.player2_legs_won}</span>
                      {/if}
                    </div>
                  </div>
                  <div class="match-footer">
                    <span class="status-badge">{match.status.replace('_', ' ')}</span>
                    {#if match.scorer}
                      <span class="scorer">{match.scorer.display_name || match.scorer.email}</span>
                    {:else if match.status === 'pending' && match.player1_id && match.player2_id}
                      <button
                        onclick={() => openAssignModal(match)}
                        class="assign-btn"
                      >
                        Assign Scorer
                      </button>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div class="legend">
      <div class="legend-item">
        <span class="legend-colour legend--pending"></span>
        <span>Pending</span>
      </div>
      <div class="legend-item">
        <span class="legend-colour legend--assigned"></span>
        <span>Assigned</span>
      </div>
      <div class="legend-item">
        <span class="legend-colour legend--in-progress"></span>
        <span>In Progress</span>
      </div>
      <div class="legend-item">
        <span class="legend-colour legend--completed"></span>
        <span>Completed</span>
      </div>
    </div>
  {:else}
    <div class="no-bracket">No bracket generated yet.</div>
  {/if}
</div>

{#if selectedMatch}
  <div class="modal-overlay" onclick={closeAssignModal}>
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <h3>Assign Scorer</h3>
      <p class="match-info">
        {getPlayerName(selectedMatch.player1)} vs {getPlayerName(selectedMatch.player2)}
      </p>

      {#if scorers.length === 0}
        <p class="no-scorers">No scorers available. Add users with scorer role first.</p>
      {:else}
        <div class="scorer-list">
          {#each scorers as scorer}
            <button
              onclick={() => handleAssignScorer(scorer.id)}
              class="scorer-option"
              disabled={assigningScorer}
            >
              {scorer.display_name || scorer.email}
            </button>
          {/each}
        </div>
      {/if}

      <button onclick={closeAssignModal} class="btn btn--secondary">Cancel</button>
    </div>
  </div>
{/if}

<style>
  .bracket-page {
    max-width: 100%;
    overflow-x: auto;
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

  .loading, .no-bracket {
    text-align: center;
    padding: 2rem;
    color: var(--colour-text-light);
  }

  .bracket-container {
    overflow-x: auto;
    padding-bottom: 1rem;
  }

  .bracket {
    display: flex;
    gap: 1.5rem;
    min-width: max-content;
  }

  .round {
    min-width: 200px;
  }

  .round-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--colour-text-light);
    text-align: center;
    margin-bottom: 1rem;
    text-transform: uppercase;
  }

  .matches {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    justify-content: space-around;
    min-height: 100%;
  }

  .match {
    background: white;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    border-left: 4px solid var(--colour-border);
  }

  .match--pending { border-left-color: #9e9e9e; }
  .match--assigned { border-left-color: #2196f3; }
  .match--in-progress { border-left-color: #ff9800; }
  .match--completed { border-left-color: #4caf50; }

  .match-players {
    padding: 0.5rem;
  }

  .player {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    border-radius: var(--radius-sm);
  }

  .player.winner {
    background: var(--colour-success-light);
  }

  .player .seed {
    font-size: 0.75rem;
    color: var(--colour-text-light);
    min-width: 1.5rem;
  }

  .player .name {
    flex: 1;
    font-size: 0.875rem;
    color: var(--colour-text);
  }

  .player .legs {
    font-weight: 600;
    color: var(--colour-text);
  }

  .match-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: var(--colour-background);
    font-size: 0.75rem;
  }

  .status-badge {
    text-transform: uppercase;
    color: var(--colour-text-light);
  }

  .scorer {
    color: var(--colour-primary);
  }

  .assign-btn {
    background: var(--colour-primary);
    color: white;
    border: none;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    cursor: pointer;
  }

  .legend {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    margin-top: 2rem;
    flex-wrap: wrap;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: var(--colour-text-light);
  }

  .legend-colour {
    width: 1rem;
    height: 1rem;
    border-radius: var(--radius-sm);
  }

  .legend--pending { background: #9e9e9e; }
  .legend--assigned { background: #2196f3; }
  .legend--in-progress { background: #ff9800; }
  .legend--completed { background: #4caf50; }

  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 100;
  }

  .modal {
    background: white;
    padding: 1.5rem;
    border-radius: var(--radius-md);
    max-width: 400px;
    width: 100%;
  }

  .modal h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
  }

  .match-info {
    color: var(--colour-text-light);
    margin-bottom: 1rem;
  }

  .no-scorers {
    color: var(--colour-text-light);
    text-align: center;
    padding: 1rem;
  }

  .scorer-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .scorer-option {
    padding: 0.75rem 1rem;
    border: 1px solid var(--colour-border);
    border-radius: var(--radius-md);
    background: white;
    cursor: pointer;
    text-align: left;
  }

  .scorer-option:hover {
    border-color: var(--colour-primary);
    background: var(--colour-primary-light);
  }

  .scorer-option:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
