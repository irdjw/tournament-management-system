<script>
  /**
   * Toast Component
   * Notification toast for success/error messages
   */

  let { message = '', type = 'info', visible = false, onClose = null } = $props()

  const icons = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'ℹ'
  }

  function handleClose() {
    if (onClose) onClose()
  }
</script>

{#if visible}
  <div class="toast toast--{type}" role="alert">
    <span class="toast-icon">{icons[type]}</span>
    <span class="toast-message">{message}</span>
    <button class="toast-close" onclick={handleClose} aria-label="Close">×</button>
  </div>
{/if}

<style>
  .toast {
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.875rem 1rem;
    border-radius: var(--radius-md, 0.5rem);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    max-width: calc(100vw - 2rem);
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      transform: translateX(-50%) translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }

  .toast--success {
    background: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #a5d6a7;
  }

  .toast--error {
    background: #ffebee;
    color: #c62828;
    border: 1px solid #ef9a9a;
  }

  .toast--warning {
    background: #fff3e0;
    color: #ef6c00;
    border: 1px solid #ffcc80;
  }

  .toast--info {
    background: #e3f2fd;
    color: #1976d2;
    border: 1px solid #90caf9;
  }

  .toast-icon {
    font-weight: bold;
    font-size: 1rem;
  }

  .toast-message {
    flex: 1;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .toast-close {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    opacity: 0.6;
    padding: 0;
    line-height: 1;
    color: inherit;
  }

  .toast-close:hover {
    opacity: 1;
  }
</style>
