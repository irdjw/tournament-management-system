<script>
  /**
   * LoadingSpinner Component
   * Simple animated loading indicator
   */

  let { size = 'medium', message = '' } = $props()

  const sizes = {
    small: '1.25rem',
    medium: '2rem',
    large: '3rem'
  }
</script>

<div class="loading-container">
  <div
    class="spinner"
    style="width: {sizes[size]}; height: {sizes[size]}"
  ></div>
  {#if message}
    <p class="loading-message">{message}</p>
  {/if}
</div>

<style>
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    gap: 0.75rem;
  }

  .spinner {
    border: 3px solid var(--colour-border, #e0e0e0);
    border-top-color: var(--colour-primary, #2E7D32);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .loading-message {
    color: var(--colour-text-light, #757575);
    font-size: 0.875rem;
    margin: 0;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
