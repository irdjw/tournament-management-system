<script>
  import { onMount } from 'svelte'
  import { supabase } from '$lib/supabaseClient'
  import OfflineIndicator from '$lib/components/shared/OfflineIndicator.svelte'

  let { children, data } = $props()

  onMount(() => {
    // Listen for auth state changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // Clear any local state and redirect to login
        window.location.href = '/login'
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  })
</script>

<svelte:head>
  <title>Tournament Manager</title>
  <meta name="description" content="Multi-sport tournament management and live scoring system" />
</svelte:head>

<OfflineIndicator />

{@render children()}

<style>
  :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(:root) {
    /* Primary colours */
    --colour-primary: #2E7D32;
    --colour-primary-dark: #1B5E20;
    --colour-primary-light: #E8F5E9;

    /* Status colours */
    --colour-success: #388E3C;
    --colour-success-light: #E8F5E9;
    --colour-warning: #F57C00;
    --colour-warning-light: #FFF3E0;
    --colour-error: #D32F2F;
    --colour-error-light: #FFEBEE;
    --colour-info: #1976D2;
    --colour-info-light: #E3F2FD;

    /* Text colours */
    --colour-text: #212121;
    --colour-text-light: #757575;

    /* Background colours */
    --colour-background: #F5F5F5;
    --colour-surface: #FFFFFF;
    --colour-border: #E0E0E0;

    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.08);
    --shadow-md: 0 2px 8px rgba(0, 0, 0, 0.12);
    --shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.16);

    /* Radii */
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;

    /* Safe area insets for notched devices */
    --safe-area-top: env(safe-area-inset-top, 0px);
    --safe-area-bottom: env(safe-area-inset-bottom, 0px);
    --safe-area-left: env(safe-area-inset-left, 0px);
    --safe-area-right: env(safe-area-inset-right, 0px);
  }

  :global(html) {
    height: 100%;
    overflow: hidden;
  }

  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
      'Open Sans', 'Helvetica Neue', sans-serif;
    color: var(--colour-text);
    background-color: var(--colour-background);
    line-height: 1.5;
    min-height: 100dvh;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* Prevent pull-to-refresh on mobile */
    overscroll-behavior-y: contain;
  }

  :global(button) {
    cursor: pointer;
    font-family: inherit;
    border: none;
    background: none;
    -webkit-tap-highlight-color: transparent;
  }

  :global(input, select, textarea) {
    font-family: inherit;
    font-size: 16px; /* Prevents iOS zoom on focus */
  }

  :global(a) {
    color: var(--colour-primary);
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
  }

  :global(a:hover) {
    text-decoration: underline;
  }

  /* Button base styles */
  :global(.btn) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: 1rem;
    text-decoration: none;
    transition: all 0.15s ease;
    cursor: pointer;
    border: none;
    -webkit-tap-highlight-color: transparent;
  }

  :global(.btn:hover) {
    text-decoration: none;
  }

  :global(.btn--primary) {
    background: var(--colour-primary);
    color: white;
  }

  :global(.btn--primary:hover) {
    background: var(--colour-primary-dark);
  }

  :global(.btn--secondary) {
    background: white;
    color: var(--colour-text);
    border: 1px solid var(--colour-border);
  }

  :global(.btn--secondary:hover) {
    background: var(--colour-background);
  }

  /* Focus styles for accessibility */
  :global(:focus-visible) {
    outline: 2px solid var(--colour-primary);
    outline-offset: 2px;
  }

  /* Hide scrollbar but keep functionality */
  :global(.hide-scrollbar) {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  :global(.hide-scrollbar::-webkit-scrollbar) {
    display: none;
  }
</style>
