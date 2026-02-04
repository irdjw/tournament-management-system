<script>
  import { supabase } from '$lib/supabaseClient'
  import { goto } from '$app/navigation'

  let email = $state('')
  let password = $state('')
  let error = $state('')
  let isLoading = $state(false)

  async function handleLogin(event) {
    event.preventDefault()
    error = ''
    isLoading = true

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) {
        error = authError.message
        return
      }

      if (data.session) {
        // Redirect to admin dashboard on successful login
        goto('/admin')
      }
    } catch (err) {
      error = 'An unexpected error occurred. Please try again.'
    } finally {
      isLoading = false
    }
  }
</script>

<main class="login-page">
  <div class="login-container">
    <div class="login-header">
      <h1>Tournament Manager</h1>
      <p>Sign in to continue</p>
    </div>

    <form class="login-form" onsubmit={handleLogin}>
      {#if error}
        <div class="error-message" role="alert">
          {error}
        </div>
      {/if}

      <div class="form-group">
        <label for="email">Email Address</label>
        <input
          type="email"
          id="email"
          bind:value={email}
          placeholder="Enter your email"
          required
          autocomplete="email"
          disabled={isLoading}
        />
      </div>

      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          bind:value={password}
          placeholder="Enter your password"
          required
          autocomplete="current-password"
          disabled={isLoading}
        />
      </div>

      <button type="submit" class="btn btn--primary" disabled={isLoading}>
        {#if isLoading}
          Signing in...
        {:else}
          Sign In
        {/if}
      </button>
    </form>

    <div class="login-footer">
      <a href="/">Back to Home</a>
    </div>
  </div>
</main>

<style>
  .login-page {
    min-height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    background-color: var(--colour-background-alt);
  }

  .login-container {
    width: 100%;
    max-width: 400px;
    background: white;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: 2rem;
  }

  .login-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .login-header h1 {
    font-size: 1.75rem;
    color: var(--colour-primary);
    margin-bottom: 0.5rem;
  }

  .login-header p {
    color: var(--colour-text-light);
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-group label {
    font-weight: 500;
    font-size: 0.875rem;
    color: var(--colour-text);
  }

  .form-group input {
    padding: 0.75rem 1rem;
    border: 1px solid var(--colour-border);
    border-radius: var(--radius-md);
    font-size: 1rem;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .form-group input:focus {
    outline: none;
    border-color: var(--colour-primary);
    box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
  }

  .form-group input:disabled {
    background-color: var(--colour-background-alt);
    cursor: not-allowed;
  }

  .error-message {
    background-color: #FFEBEE;
    color: var(--colour-danger);
    padding: 0.75rem 1rem;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    border: 1px solid #FFCDD2;
  }

  .btn {
    padding: 0.875rem 1.5rem;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: 1rem;
    transition: background-color 0.2s, transform 0.2s;
  }

  .btn--primary {
    background-color: var(--colour-primary);
    color: white;
  }

  .btn--primary:hover:not(:disabled) {
    background-color: var(--colour-primary-dark);
  }

  .btn--primary:disabled {
    background-color: var(--colour-border);
    cursor: not-allowed;
  }

  .login-footer {
    text-align: center;
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--colour-border);
  }

  .login-footer a {
    color: var(--colour-text-light);
    font-size: 0.875rem;
  }

  .login-footer a:hover {
    color: var(--colour-primary);
  }
</style>
