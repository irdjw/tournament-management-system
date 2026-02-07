<script>
  import { supabase } from '$lib/supabaseClient'
  import { goto } from '$app/navigation'

  let { children, data } = $props()
  let isMenuOpen = $state(false)

  async function handleSignOut() {
    await supabase.auth.signOut()
    goto('/login')
  }

  function toggleMenu() {
    isMenuOpen = !isMenuOpen
  }
</script>

<div class="admin-layout">
  <header class="admin-header">
    <div class="header-left">
      <button class="menu-toggle" onclick={toggleMenu} aria-label="Toggle menu">
        <span class="menu-icon"></span>
      </button>
      <a href="/admin" class="logo">Tournament Manager</a>
    </div>
    <div class="header-right">
      <span class="user-email">{data.session?.user?.email}</span>
      <button class="btn btn--outline" onclick={handleSignOut}>Sign Out</button>
    </div>
  </header>

  <nav class="admin-nav" class:open={isMenuOpen}>
    <ul>
      <li><a href="/admin">Dashboard</a></li>
      <li><a href="/admin/tournaments">Tournaments</a></li>
      <li><a href="/admin/players">Players</a></li>
      <li><a href="/admin/users">Users</a></li>
    </ul>
  </nav>

  <main class="admin-main">
    {@render children()}
  </main>
</div>

<style>
  .admin-layout {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  .admin-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background-color: var(--colour-primary);
    color: white;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: none;
    border: none;
    color: white;
  }

  .menu-icon {
    display: block;
    width: 20px;
    height: 2px;
    background: white;
    position: relative;
  }

  .menu-icon::before,
  .menu-icon::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 2px;
    background: white;
    left: 0;
  }

  .menu-icon::before {
    top: -6px;
  }

  .menu-icon::after {
    top: 6px;
  }

  .logo {
    font-weight: 700;
    font-size: 1.125rem;
    color: white;
    text-decoration: none;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-email {
    display: none;
    font-size: 0.875rem;
    opacity: 0.9;
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

  .admin-nav {
    background: var(--colour-background-alt);
    border-bottom: 1px solid var(--colour-border);
    display: none;
  }

  .admin-nav.open {
    display: block;
  }

  .admin-nav ul {
    list-style: none;
    display: flex;
    flex-direction: column;
  }

  .admin-nav li a {
    display: block;
    padding: 0.875rem 1rem;
    color: var(--colour-text);
    text-decoration: none;
    border-bottom: 1px solid var(--colour-border);
  }

  .admin-nav li a:hover {
    background-color: white;
    color: var(--colour-primary);
  }

  .admin-main {
    flex: 1;
    padding: 1rem;
    background-color: var(--colour-background-alt);
  }

  @media (min-width: 768px) {
    .menu-toggle {
      display: none;
    }

    .user-email {
      display: block;
    }

    .admin-nav {
      display: block;
    }

    .admin-nav ul {
      flex-direction: row;
      padding: 0 1rem;
    }

    .admin-nav li a {
      padding: 0.75rem 1.25rem;
      border-bottom: none;
      border-bottom: 2px solid transparent;
    }

    .admin-nav li a:hover {
      background: transparent;
      border-bottom-color: var(--colour-primary);
    }

    .admin-main {
      padding: 1.5rem 2rem;
    }
  }
</style>
