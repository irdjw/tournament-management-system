<script>
  /**
   * OfflineIndicator Component
   * Shows when the user is offline
   */

  import { onMount, onDestroy } from 'svelte'

  let isOnline = $state(true)

  function updateOnlineStatus() {
    isOnline = navigator.onLine
  }

  onMount(() => {
    isOnline = navigator.onLine
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
  })

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  })
</script>

{#if !isOnline}
  <div class="offline-banner" role="alert">
    <span class="offline-icon">⚠</span>
    <span class="offline-message">You're offline. Some features may be unavailable.</span>
  </div>
{/if}

<style>
  .offline-banner {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    background: #ff9800;
    color: white;
    font-size: 0.875rem;
    font-weight: 500;
    z-index: 1000;
    text-align: center;
  }

  .offline-icon {
    font-size: 1rem;
  }

  .offline-message {
    line-height: 1.3;
  }

  @media (max-width: 480px) {
    .offline-banner {
      font-size: 0.8125rem;
      padding: 0.5rem 0.75rem;
    }
  }
</style>
