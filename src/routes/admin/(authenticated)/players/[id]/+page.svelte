<script>
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'
  import { getPlayerWithTournaments, updatePlayer, deletePlayer } from '$lib/services/player.service'

  let player = $state(null)
  let loading = $state(true)
  let error = $state(null)
  let editing = $state(false)
  let saving = $state(false)
  let deleteConfirm = $state(false)

  let editName = $state('')
  let editEmail = $state('')

  onMount(async () => {
    await loadPlayer()
  })

  async function loadPlayer() {
    loading = true
    error = null

    const result = await getPlayerWithTournaments($page.params.id)

    if (result.error) {
      error = result.error.message
    } else {
      player = result.data
      editName = player.name
      editEmail = player.email || ''
    }
    loading = false
  }

  function startEditing() {
    editName = player.name
    editEmail = player.email || ''
    editing = true
  }

  function cancelEditing() {
    editing = false
  }

  async function saveChanges() {
    if (!editName.trim()) {
      error = 'Player name is required'
      return
    }

    saving = true
    error = null

    const result = await updatePlayer(player.id, {
      name: editName.trim(),
      email: editEmail.trim() || null
    })

    if (result.error) {
      error = result.error.message
    } else {
      player = { ...player, ...result.data }
      editing = false
    }
    saving = false
  }

  async function handleDelete() {
    if (!deleteConfirm) {
      deleteConfirm = true
      return
    }

    const result = await deletePlayer(player.id)
    if (result.error) {
      error = result.error.message
      deleteConfirm = false
    } else {
      goto('/admin/players')
    }
  }
</script>

<div class="player-detail-page">
  <header class="page-header">
    <a href="/admin/players" class="back-link">← Back to Players</a>
  </header>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  {#if loading}
    <div class="loading">Loading player...</div>
  {:else if player}
    <div class="player-card">
      {#if editing}
        <div class="edit-form">
          <div class="form-group">
            <label for="name">Name</label>
            <input type="text" id="name" bind:value={editName} disabled={saving} />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" bind:value={editEmail} disabled={saving} />
          </div>
          <div class="form-actions">
            <button onclick={cancelEditing} class="btn btn--secondary" disabled={saving}>
              Cancel
            </button>
            <button onclick={saveChanges} class="btn btn--primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      {:else}
        <div class="player-header">
          <h1>{player.name}</h1>
          <div class="header-actions">
            <button onclick={startEditing} class="btn btn--secondary">Edit</button>
            {#if deleteConfirm}
              <button onclick={handleDelete} class="btn btn--danger">Confirm Delete</button>
              <button onclick={() => deleteConfirm = false} class="btn btn--secondary">Cancel</button>
            {:else}
              <button onclick={handleDelete} class="btn btn--outline">Delete</button>
            {/if}
          </div>
        </div>

        {#if player.email}
          <p class="player-email">{player.email}</p>
        {/if}

        <div class="player-meta">
          <span>Created: {new Date(player.created_at).toLocaleDateString('en-GB')}</span>
        </div>
      {/if}
    </div>

    {#if !editing && player.tournament_players?.length > 0}
      <div class="tournaments-section">
        <h2>Tournament History</h2>
        <div class="tournaments-list">
          {#each player.tournament_players as tp}
            <div class="tournament-card">
              <div class="tournament-info">
                <h3>{tp.tournament?.name || 'Unknown Tournament'}</h3>
                <span class="tournament-status status--{tp.tournament?.status}">
                  {tp.tournament?.status}
                </span>
              </div>
              {#if tp.seed_number}
                <span class="seed">Seed #{tp.seed_number}</span>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {:else}
    <div class="not-found">Player not found</div>
  {/if}
</div>

<style>
  .player-detail-page {
    max-width: 600px;
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

  .player-card {
    background: white;
    padding: 1.5rem;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
  }

  .player-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .player-header h1 {
    font-size: 1.5rem;
    color: var(--colour-text);
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  .player-email {
    color: var(--colour-text-light);
    margin: 0.5rem 0 0 0;
  }

  .player-meta {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--colour-border);
    font-size: 0.875rem;
    color: var(--colour-text-light);
  }

  .edit-form .form-group {
    margin-bottom: 1rem;
  }

  .edit-form label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .edit-form input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--colour-border);
    border-radius: var(--radius-md);
    font-size: 1rem;
  }

  .edit-form input:focus {
    outline: none;
    border-color: var(--colour-primary);
  }

  .form-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
  }

  .tournaments-section {
    margin-top: 2rem;
  }

  .tournaments-section h2 {
    font-size: 1.25rem;
    color: var(--colour-text);
    margin-bottom: 1rem;
  }

  .tournaments-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .tournament-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    padding: 1rem;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
  }

  .tournament-info h3 {
    font-size: 1rem;
    margin: 0 0 0.25rem 0;
  }

  .tournament-status {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
    text-transform: uppercase;
  }

  .status--setup { background: var(--colour-warning-light); color: var(--colour-warning); }
  .status--in_progress { background: var(--colour-info-light); color: var(--colour-info); }
  .status--completed { background: var(--colour-success-light); color: var(--colour-success); }

  .seed {
    font-size: 0.875rem;
    color: var(--colour-text-light);
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
</style>
