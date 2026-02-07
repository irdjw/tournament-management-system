<script>
  import { supabase } from '$lib/supabaseClient'
  import { goto } from '$app/navigation'

  let { children, data } = $props()

  async function handleSignOut() {
    await supabase.auth.signOut()
    goto('/login')
  }
</script>

<div class="scorer-layout">
  <header class="scorer-header">
    <a href="/scorer" class="logo">Tournament Scorer</a>
    <button class="btn btn--outline" onclick={handleSignOut}>Sign Out</button>
  </header>

  <main class="scorer-main">
    {@render children()}
  </main>
</div>

<style>
  .scorer-layout {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    background-color: var(--colour-background-alt);
  }

  .scorer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background-color: var(--colour-primary);
    color: white;
  }

  .logo {
    font-weight: 700;
    font-size: 1.125rem;
    color: white;
    text-decoration: none;
  }

  .btn--outline {
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid white;
    border-radius: var(--radius-md);
    color: white;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .btn--outline:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .scorer-main {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
</style>
