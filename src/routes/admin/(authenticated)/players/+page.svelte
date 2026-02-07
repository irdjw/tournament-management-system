<script>
  import { onMount } from 'svelte'
  import { getPlayers, deletePlayer } from '$lib/services/player.service'

  let players = $state([])
  let loading = $state(true)
  let error = $state(null)
  let searchTerm = $state('')
  let deleteConfirm = $state(null)

  onMount(async () => {
    await loadPlayers()
  })

  async function loadPlayers() {
    loading = true
    error = null
    const result = await getPlayers({ search: searchTerm })
    if (result.error) {
      error = result.error.message
    } else {
      players = result.data || []
    }
    loading = false
  }

  async function handleSearch() {
    await loadPlayers()
  }

  async function handleDelete(player) {
    if (deleteConfirm !== player.id) {
      deleteConfirm = player.id
      return
    }

    const result = await deletePlayer(player.id)
    if (result.error) {
      error = result.error.message
    } else {
      players = players.filter(p => p.id !== player.id)
    }
    deleteConfirm = null
  }

  function cancelDelete() {
    deleteConfirm = null
  }
</script>

<div class="players-page">
  <header class="page-header">
    <h1>Players</h1>
    <a href="/admin/players/create" class="btn btn--primary">Add Player</a>
  </header>

  <div class="search-bar">
    <input
      type="text"
      placeholder="Search players..."
      bind:value={searchTerm}
      onkeyup={(e) => e.key === 'Enter' && handleSearch()}
    />
    <button onclick={handleSearch} class="btn btn--secondary">Search</button>
  </div>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  {#if loading}
    <div class="loading">Loading players...</div>
  {:else if players.length === 0}
    <div class="empty-state">
      <p>No players found.</p>
      <a href="/admin/players/create" class="btn btn--primary">Add Your First Player</a>
    </div>
  {:else}
    <div class="players-list">
      {#each players as player}
        <div class="player-card">
          <div class="player-info">
            <h3>{player.name}</h3>
            {#if player.email}
              <p class="player-email">{player.email}</p>
            {/if}
          </div>
          <div class="player-actions">
            <a href="/admin/players/{player.id}" class="btn btn--small">View</a>
            {#if deleteConfirm === player.id}
              <button onclick={() => handleDelete(player)} class="btn btn--small btn--danger">
                Confirm
              </button>
              <button onclick={cancelDelete} class="btn btn--small">Cancel</button>
            {:else}
              <button onclick={() => handleDelete(player)} class="btn btn--small btn--outline">
                Delete
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .players-page {
    max-width: 800px;
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

  .search-bar {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .search-bar input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid var(--colour-border);
    border-radius: var(--radius-md);
    font-size: 1rem;
  }

  .search-bar input:focus {
    outline: none;
    border-color: var(--colour-primary);
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

  .players-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .player-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 1rem 1.25rem;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    gap: 1rem;
  }

  .player-info h3 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--colour-text);
    margin: 0 0 0.25rem 0;
  }

  .player-email {
    font-size: 0.875rem;
    color: var(--colour-text-light);
    margin: 0;
  }

  .player-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
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

  .btn--danger {
    background: var(--colour-error);
    color: white;
  }

  @media (max-width: 480px) {
    .player-card {
      flex-direction: column;
      align-items: flex-start;
    }

    .player-actions {
      width: 100%;
      justify-content: flex-end;
    }
  }
</style>
