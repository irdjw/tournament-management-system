<script>
  import { page } from '$app/stores'
</script>

<main class="error-page">
  <div class="container">
    <h1>{$page.status}</h1>
    <p class="message">{$page.error?.message || 'An error occurred'}</p>
    <a href="/" class="btn">Return Home</a>
  </div>
</main>

<style>
  .error-page {
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background: var(--colour-background);
  }

  .container {
    text-align: center;
  }

  h1 {
    font-size: 4rem;
    color: var(--colour-primary);
    margin-bottom: 0.5rem;
  }

  .message {
    font-size: 1.25rem;
    color: var(--colour-text-light);
    margin-bottom: 2rem;
  }

  .btn {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    background: var(--colour-primary);
    color: white;
    text-decoration: none;
    border-radius: var(--radius-md);
    font-weight: 600;
  }

  .btn:hover {
    background: var(--colour-primary-dark);
  }
</style>
