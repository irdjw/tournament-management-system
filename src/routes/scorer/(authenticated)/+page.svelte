<script>
  let { data } = $props()
</script>

<div class="scorer-dashboard">
  <h1>Scorer Dashboard</h1>
  <p class="welcome">Welcome, {data.user?.display_name || data.session?.user?.email}!</p>

  <section class="matches-section">
    <h2>Your Assigned Matches</h2>
    <div class="matches-list">
      <div class="empty-state">
        <p>No matches assigned yet.</p>
        <p class="hint">Matches will appear here when an administrator assigns them to you.</p>
      </div>
    </div>
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
</style>
