<script>
  let { data } = $props()
</script>

<div class="dashboard">
  <h1>Admin Dashboard</h1>
  <p class="welcome">Welcome back{data.user?.display_name ? `, ${data.user.display_name}` : ''}!</p>

  <div class="stats-grid">
    <div class="stat-card">
      <h3>Tournaments</h3>
      <p class="stat-value">-</p>
      <a href="/admin/tournaments" class="stat-link">View All</a>
    </div>
    <div class="stat-card">
      <h3>Players</h3>
      <p class="stat-value">-</p>
      <a href="/admin/players" class="stat-link">View All</a>
    </div>
    <div class="stat-card">
      <h3>Active Matches</h3>
      <p class="stat-value">-</p>
      <a href="/admin/tournaments" class="stat-link">View Matches</a>
    </div>
  </div>

  <div class="quick-actions">
    <h2>Quick Actions</h2>
    <div class="actions-grid">
      <a href="/admin/tournaments/create" class="action-card">
        <span class="action-icon">+</span>
        <span class="action-label">Create Tournament</span>
      </a>
      <a href="/admin/players/create" class="action-card">
        <span class="action-icon">+</span>
        <span class="action-label">Add Player</span>
      </a>
      <a href="/admin/users/create" class="action-card">
        <span class="action-icon">+</span>
        <span class="action-label">Add User</span>
      </a>
    </div>
  </div>
</div>

<style>
  .dashboard {
    max-width: 1200px;
    margin: 0 auto;
  }

  h1 {
    font-size: 1.75rem;
    color: var(--colour-text);
    margin-bottom: 0.25rem;
  }

  .welcome {
    color: var(--colour-text-light);
    margin-bottom: 2rem;
  }

  .stats-grid {
    display: grid;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
  }

  .stat-card h3 {
    font-size: 0.875rem;
    color: var(--colour-text-light);
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--colour-primary);
    margin-bottom: 0.5rem;
  }

  .stat-link {
    font-size: 0.875rem;
    color: var(--colour-primary);
  }

  h2 {
    font-size: 1.25rem;
    color: var(--colour-text);
    margin-bottom: 1rem;
  }

  .actions-grid {
    display: grid;
    gap: 1rem;
  }

  .action-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    background: white;
    padding: 1.25rem;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
    text-decoration: none;
    color: var(--colour-text);
    transition: box-shadow 0.2s, transform 0.2s;
  }

  .action-card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
    text-decoration: none;
  }

  .action-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: var(--colour-primary);
    color: white;
    border-radius: var(--radius-md);
    font-size: 1.5rem;
    font-weight: 300;
  }

  .action-label {
    font-weight: 500;
  }

  @media (min-width: 768px) {
    h1 {
      font-size: 2rem;
    }

    .stats-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .actions-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
