<script>
  let { data } = $props()
</script>

<main class="home">
  <div class="container">
    <h1>Tournament Manager</h1>
    <p class="tagline">Multi-sport tournament management system</p>

    <div class="actions">
      {#if data.session}
        <a href="/admin" class="btn btn--primary">Go to Admin Dashboard</a>
        <a href="/scorer" class="btn btn--secondary">Go to Scorer Dashboard</a>
      {:else}
        <a href="/login" class="btn btn--primary">Sign In</a>
      {/if}
    </div>

    <div class="features">
      <div class="feature">
        <h3>Organise Tournaments</h3>
        <p>Create and manage knockout, league, and round robin tournaments with ease.</p>
      </div>
      <div class="feature">
        <h3>Live Scoring</h3>
        <p>Mobile-first scorer interface for real-time dart-by-dart scoring.</p>
      </div>
      <div class="feature">
        <h3>Multi-Sport</h3>
        <p>Support for darts, pool, snooker, and more sports coming soon.</p>
      </div>
    </div>
  </div>
</main>

<style>
  .home {
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: linear-gradient(135deg, var(--colour-primary) 0%, var(--colour-primary-dark) 100%);
  }

  .container {
    text-align: center;
    color: white;
    max-width: 800px;
  }

  h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  .tagline {
    font-size: 1.25rem;
    opacity: 0.9;
    margin-bottom: 2rem;
  }

  .actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 3rem;
  }

  .btn {
    display: inline-block;
    padding: 0.875rem 2rem;
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: 1rem;
    text-decoration: none;
    transition: transform 0.2s, box-shadow 0.2s;
    min-width: 200px;
  }

  .btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    text-decoration: none;
  }

  .btn--primary {
    background: white;
    color: var(--colour-primary);
  }

  .btn--secondary {
    background: transparent;
    color: white;
    border: 2px solid white;
  }

  .features {
    display: grid;
    gap: 1.5rem;
    margin-top: 2rem;
  }

  .feature {
    background: rgba(255, 255, 255, 0.1);
    padding: 1.5rem;
    border-radius: var(--radius-md);
    backdrop-filter: blur(10px);
  }

  .feature h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .feature p {
    opacity: 0.9;
    font-size: 0.9375rem;
  }

  @media (min-width: 768px) {
    h1 {
      font-size: 3.5rem;
    }

    .tagline {
      font-size: 1.5rem;
    }

    .features {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
