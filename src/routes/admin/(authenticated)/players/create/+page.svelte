<script>
  import { goto } from '$app/navigation'
  import { createPlayer } from '$lib/services/player.service'

  let name = $state('')
  let email = $state('')
  let loading = $state(false)
  let error = $state(null)

  async function handleSubmit(e) {
    e.preventDefault()

    if (!name.trim()) {
      error = 'Player name is required'
      return
    }

    loading = true
    error = null

    const result = await createPlayer(name.trim(), email.trim() || null)

    if (result.error) {
      error = result.error.message
      loading = false
    } else {
      goto('/admin/players')
    }
  }
</script>

<div class="create-player-page">
  <header class="page-header">
    <a href="/admin/players" class="back-link">← Back to Players</a>
    <h1>Add Player</h1>
  </header>

  {#if error}
    <div class="error-message">{error}</div>
  {/if}

  <form onsubmit={handleSubmit} class="player-form">
    <div class="form-group">
      <label for="name">Name <span class="required">*</span></label>
      <input
        type="text"
        id="name"
        bind:value={name}
        placeholder="Enter player name"
        required
        disabled={loading}
      />
    </div>

    <div class="form-group">
      <label for="email">Email <span class="optional">(optional)</span></label>
      <input
        type="email"
        id="email"
        bind:value={email}
        placeholder="Enter player email"
        disabled={loading}
      />
    </div>

    <div class="form-actions">
      <a href="/admin/players" class="btn btn--secondary">Cancel</a>
      <button type="submit" class="btn btn--primary" disabled={loading}>
        {loading ? 'Creating...' : 'Create Player'}
      </button>
    </div>
  </form>
</div>

<style>
  .create-player-page {
    max-width: 500px;
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

  .player-form {
    background: white;
    padding: 1.5rem;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
  }

  .form-group {
    margin-bottom: 1.25rem;
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

  .optional {
    color: var(--colour-text-light);
    font-weight: 400;
    font-size: 0.875rem;
  }

  .form-group input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--colour-border);
    border-radius: var(--radius-md);
    font-size: 1rem;
  }

  .form-group input:focus {
    outline: none;
    border-color: var(--colour-primary);
  }

  .form-group input:disabled {
    background: var(--colour-background);
    cursor: not-allowed;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
