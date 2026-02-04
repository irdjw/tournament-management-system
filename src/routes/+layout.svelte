<script>
  import { onMount } from 'svelte'
  import { supabase } from '$lib/supabaseClient'

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
  <meta name="description" content="Multi-sport tournament management system" />
</svelte:head>

{@render children()}

<style>
  :global(*) {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :global(:root) {
    --colour-primary: #2E7D32;
    --colour-primary-dark: #1B5E20;
    --colour-primary-light: #4CAF50;
    --colour-secondary: #43A047;
    --colour-danger: #D32F2F;
    --colour-danger-dark: #B71C1C;
    --colour-warning: #FFA000;
    --colour-success: #388E3C;
    --colour-text: #333333;
    --colour-text-light: #666666;
    --colour-background: #FFFFFF;
    --colour-background-alt: #F5F5F5;
    --colour-border: #E0E0E0;
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
    --radius-sm: 4px;
    --radius-md: 8px;
    --radius-lg: 12px;
  }

  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
      'Open Sans', 'Helvetica Neue', sans-serif;
    color: var(--colour-text);
    background-color: var(--colour-background);
    line-height: 1.5;
    min-height: 100dvh;
  }

  :global(button) {
    cursor: pointer;
    font-family: inherit;
  }

  :global(input, select, textarea) {
    font-family: inherit;
    font-size: inherit;
  }

  :global(a) {
    color: var(--colour-primary);
    text-decoration: none;
  }

  :global(a:hover) {
    text-decoration: underline;
  }
</style>
